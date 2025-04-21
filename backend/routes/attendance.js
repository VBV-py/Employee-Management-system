// backend/routes/attendance.js
module.exports = (pool) => {
    const express = require('express');
    const router = express.Router();
    
    // Check in
    router.post('/check-in', async (req, res) => {
      try {
        const employeeId = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        // Check if already checked in today
        const [existing] = await pool.query(
          'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
          [employeeId, today]
        );
        
        if (existing.length > 0) {
          return res.status(400).json({ message: 'Already checked in today' });
        }
        
        // Create check-in record
        const now = new Date();
        
        await pool.query(
          'INSERT INTO attendance (employee_id, date, check_in) VALUES (?, ?, ?)',
          [employeeId, today, now]
        );
        
        res.status(201).json({ 
          message: 'Checked in successfully', 
          time: now 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Check out
    router.post('/check-out', async (req, res) => {
      try {
        const employeeId = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        const now = new Date();
        
        // Check if checked in today
        const [existing] = await pool.query(
          'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
          [employeeId, today]
        );
        
        if (existing.length === 0) {
          return res.status(400).json({ message: 'Not checked in today' });
        }
        
        if (existing[0].check_out) {
          return res.status(400).json({ message: 'Already checked out today' });
        }
        
        // Update record with check-out time
        await pool.query(
          'UPDATE attendance SET check_out = ? WHERE employee_id = ? AND date = ?',
          [now, employeeId, today]
        );
        
        res.json({ 
          message: 'Checked out successfully', 
          time: now 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get today's attendance for current employee
    router.get('/today', async (req, res) => {
      try {
        const employeeId = req.user.id;
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const [record] = await pool.query(
          'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
          [employeeId, today]
        );
        
        if (record.length === 0) {
          return res.json({ checked_in: false });
        }
        
        res.json({
          checked_in: true,
          check_in: record[0].check_in,
          check_out: record[0].check_out,
          status: record[0].status
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get daily attendance overview (for supervisors)
    router.get('/daily', async (req, res) => {
      try {
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const date = req.query.date || new Date().toISOString().split('T')[0]; // Default to today
        const departmentId = req.query.department; // Optional department filter
        
        let query = `
          SELECT a.id, a.employee_id, a.date, a.check_in, a.check_out, a.status, a.note,
                 e.first_name, e.last_name, e.profile_image, d.name as department_name
          FROM attendance a
          JOIN employees e ON a.employee_id = e.id
          JOIN departments d ON e.department_id = d.id
          WHERE a.date = ?
        `;
        
        const queryParams = [date];
        
        if (departmentId) {
          query += " AND e.department_id = ?";
          queryParams.push(departmentId);
        }
        
        query += " ORDER BY e.first_name, e.last_name";
        
        const [attendance] = await pool.query(query, queryParams);
        
        // Get summary statistics
        let summaryQuery = `
          SELECT 
            COUNT(DISTINCT a.employee_id) as total_employees,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
            COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
            COUNT(CASE WHEN a.status = 'on-leave' THEN 1 END) as leave_count
          FROM attendance a
          JOIN employees e ON a.employee_id = e.id
          WHERE a.date = ?
        `;
        
        const summaryParams = [date];
        
        if (departmentId) {
          summaryQuery += " AND e.department_id = ?";
          summaryParams.push(departmentId);
        }
        
        const [summary] = await pool.query(summaryQuery, summaryParams);
        
        // Get missing employees (not checked in)
        let missingQuery = `
          SELECT e.id as employee_id, e.first_name, e.last_name, 
                 e.profile_image, d.name as department_name
          FROM employees e
          JOIN departments d ON e.department_id = d.id
          WHERE e.is_active = 1
        `;
        
        const missingParams = [];
        
        if (departmentId) {
          missingQuery += " AND e.department_id = ?";
          missingParams.push(departmentId);
        }
        
        missingQuery += `
          AND e.id NOT IN (
            SELECT employee_id 
            FROM attendance 
            WHERE date = ?
          )
        `;
        missingParams.push(date);
        
        const [missing] = await pool.query(missingQuery, missingParams);
        
        res.json({
          date,
          records: attendance,
          summary: summary[0],
          missing
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Update attendance record (supervisor only)
    router.patch('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { status, note } = req.body;
        
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Update attendance
        const [result] = await pool.query(
          'UPDATE attendance SET status = ?, note = ? WHERE id = ?',
          [status, note, id]
        );
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Attendance record not found' });
        }
        
        res.json({ message: 'Attendance record updated successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Mark employee as absent (supervisor only)
    router.post('/mark-absent', async (req, res) => {
      try {
        const { employee_id, date, note } = req.body;
        
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        // Check if record already exists for this date
        const [existing] = await pool.query(
          'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
          [employee_id, date]
        );
        
        if (existing.length > 0) {
          // Update existing record
          await pool.query(
            'UPDATE attendance SET status = ?, note = ? WHERE id = ?',
            ['absent', note, existing[0].id]
          );
        } else {
          // Create new absence record
          await pool.query(
            'INSERT INTO attendance (employee_id, date, status, note) VALUES (?, ?, ?, ?)',
            [employee_id, date, 'absent', note]
          );
        }
        
        res.json({ message: 'Employee marked as absent' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get department-wise attendance report (supervisor only)
    router.get('/department-report', async (req, res) => {
      try {
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = req.query.month ? parseInt(req.query.month) : null;
        
        let query = `
          SELECT d.id, d.name,
            COUNT(DISTINCT e.id) as total_employees,
            COUNT(DISTINCT a.employee_id) as tracked_employees,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_count,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_count,
            COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_count,
            COUNT(CASE WHEN a.status = 'on-leave' THEN 1 END) as leave_count,
            ROUND(
              COUNT(CASE WHEN a.status = 'present' OR a.status = 'late' THEN 1 END) * 100.0 / 
              NULLIF(COUNT(a.id), 0), 
              2
            ) as attendance_percentage
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id
          LEFT JOIN attendance a ON e.id = a.employee_id
        `;
        
        const queryParams = [];
        
        if (month !== null) {
          query += " AND YEAR(a.date) = ? AND MONTH(a.date) = ?";
          queryParams.push(year, month);
        } else {
          query += " AND YEAR(a.date) = ?";
          queryParams.push(year);
        }
        
        query += " GROUP BY d.id, d.name ORDER BY d.name";
        
        const [results] = await pool.query(query, queryParams);
        
        res.json(results);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    return router;
  };