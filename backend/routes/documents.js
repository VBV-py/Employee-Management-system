// backend/routes/documents.js
module.exports = (pool, upload) => {
    const express = require('express');
    const router = express.Router();
    const fs = require('fs');
    const path = require('path');
    
    // Configure multer for document uploads
    const documentUpload = upload.single('document');
    
    // Upload employee document
    router.post('/', async (req, res) => {
      try {
        documentUpload(req, res, async (err) => {
          if (err) {
            return res.status(400).json({ message: err.message });
          }
          
          if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
          }
          
          const { document_type, title } = req.body;
          const employeeId = req.body.employee_id || req.user.id;
          
          //only supervisors can upload documents for other employees
          if (employeeId !== req.user.id && !req.user.is_supervisor) {
            // Delete the uploaded file
            fs.unlinkSync(req.file.path);
            return res.status(403).json({ message: 'Not authorized to upload documents for other employees' });
          }
          
          // Save file path to database
          const filePath = `/uploads/${req.file.filename}`;
          
          const [result] = await pool.query(
            'INSERT INTO employee_documents (employee_id, document_type, title, file_path) VALUES (?, ?, ?, ?)',
            [employeeId, document_type, title, filePath]
          );
          
          res.status(201).json({
            message: 'Document uploaded successfully',
            id: result.insertId,
            file_path: filePath
          });
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get employee documents
    router.get('/', async (req, res) => {
      try {
        const employeeId = req.query.employee_id || req.user.id;
        
        // For security, only supervisors can view documents of other employees
        if (employeeId !== req.user.id && !req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized to view documents of other employees' });
        }
        
        const [documents] = await pool.query(
          'SELECT id, document_type, title, file_path, uploaded_at FROM employee_documents WHERE employee_id = ? ORDER BY uploaded_at DESC',
          [employeeId]
        );
        
        res.json(documents);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Delete document
    router.delete('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Get document details to check ownership and get file path
        const [document] = await pool.query(
          'SELECT employee_id, file_path FROM employee_documents WHERE id = ?',
          [id]
        );
        
        if (document.length === 0) {
          return res.status(404).json({ message: 'Document not found' });
        }
        
        //only document owner or supervisors can delete
        if (document[0].employee_id !== req.user.id && !req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized to delete this document' });
        }
        
        // Delete the file from storage
        const filePath = path.join(__dirname, '..', document[0].file_path);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        
        // Delete record from database
        await pool.query('DELETE FROM employee_documents WHERE id = ?', [id]);
        
        res.json({ message: 'Document deleted successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    return router;
  };