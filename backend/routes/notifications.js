// backend/routes/notifications.js
module.exports = (pool) => {
    const express = require('express');
    const router = express.Router();
    
    // Get user notifications
    router.get('/', async (req, res) => {
      try {
        const employeeId = req.user.id;
        const limit = parseInt(req.query.limit) || 10;
        const offset = parseInt(req.query.offset) || 0;
        const unreadOnly = req.query.unread === 'true';
        
        let query = `
          SELECT id, title, message, is_read, created_at
          FROM notifications
          WHERE employee_id = ?
        `;
        
        if (unreadOnly) {
          query += ' AND is_read = 0';
        }
        
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        
        const [notifications] = await pool.query(query, [employeeId, limit, offset]);
        
        // Get total count for pagination
        let countQuery = 'SELECT COUNT(*) as total FROM notifications WHERE employee_id = ?';
        if (unreadOnly) {
          countQuery += ' AND is_read = 0';
        }
        
        const [countResult] = await pool.query(countQuery, [employeeId]);
        
        res.json({
          notifications,
          total: countResult[0].total,
          unread_count: await getUnreadCount(pool, employeeId)
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Mark notification as read
    router.patch('/:id/read', async (req, res) => {
      try {
        const { id } = req.params;
        const employeeId = req.user.id;
        
        // Ensure notification belongs to user
        const [notification] = await pool.query(
          'SELECT id FROM notifications WHERE id = ? AND employee_id = ?',
          [id, employeeId]
        );
        
        if (notification.length === 0) {
          return res.status(404).json({ message: 'Notification not found' });
        }
        
        // Mark as read
        await pool.query(
          'UPDATE notifications SET is_read = 1 WHERE id = ?',
          [id]
        );
        
        res.json({ 
          message: 'Notification marked as read',
          unread_count: await getUnreadCount(pool, employeeId)
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Mark all notifications as read
    router.post('/read-all', async (req, res) => {
      try {
        const employeeId = req.user.id;
        
        await pool.query(
          'UPDATE notifications SET is_read = 1 WHERE employee_id = ? AND is_read = 0',
          [employeeId]
        );
        
        res.json({ 
          message: 'All notifications marked as read',
          unread_count: 0
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Delete notification
    router.delete('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const employeeId = req.user.id;
        
        // Ensure notification belongs to user
        const [notification] = await pool.query(
          'SELECT id FROM notifications WHERE id = ? AND employee_id = ?',
          [id, employeeId]
        );
        
        if (notification.length === 0) {
          return res.status(404).json({ message: 'Notification not found' });
        }
        
        // Delete notification
        await pool.query('DELETE FROM notifications WHERE id = ?', [id]);
        
        res.json({ 
          message: 'Notification deleted',
          unread_count: await getUnreadCount(pool, employeeId)
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Helper function to get unread notification count
    async function getUnreadCount(pool, employeeId) {
      const [result] = await pool.query(
        'SELECT COUNT(*) as count FROM notifications WHERE employee_id = ? AND is_read = 0',
        [employeeId]
      );
      return result[0].count;
    }
    
    return router;
  };