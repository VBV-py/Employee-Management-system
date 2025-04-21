// backend/routes/leaves.js
module.exports = (pool) => {
    const express = require('express');
    const router = express.Router();
    
    // Apply for leave
    router.post('/', async (req, res) => {
      try {
        const { leave_type_id, start_date, end_date, reason } = req.body;
        const employeeId = req.user.id;
        
        // Calculate total days (including weekends for simplicity)
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (startDate > endDate) {
          return res.status(400).json({ message: 'End date must be after start date' });
        }
        
        const diffTime = Math.abs(endDate - startDate);
        const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Include both start and end days
        
        // Check leave balance
        const [balance] = await pool.query(
          'SELECT (total_days - used_days) as available_days FROM leave_balances WHERE employee_id = ? AND leave_type_id = ? AND year = YEAR(?)',
          [employeeId, leave_type_id, start_date]
        );
        
        if (balance.length === 0) {
          return res.status(400).json({ message: 'No leave balance found for this type' });
        }
        
        if (balance[0].available_days < totalDays) {
          return res.status(400).json({ 
            message: 'Insufficient leave balance', 
            available: balance[0].available_days,
            requested: totalDays
          });
        }
        
        // Check for overlapping leaves
        const [overlapping] = await pool.query(`
          SELECT id FROM leave_requests 
          WHERE employee_id = ? AND status != 'rejected' AND status != 'cancelled'
          AND (
            (start_date <= ? AND end_date >= ?) OR
            (start_date <= ? AND end_date >= ?) OR
            (start_date >= ? AND end_date <= ?)
          )
        `, [employeeId, start_date, start_date, end_date, end_date, start_date, end_date]);
        
        if (overlapping.length > 0) {
          return res.status(400).json({ message: 'You already have an overlapping leave request' });
        }
        
        // Create leave request
        const [result] = await pool.query(`
          INSERT INTO leave_requests 
          (employee_id, leave_type_id, start_date, end_date, total_days, reason)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [employeeId, leave_type_id, start_date, end_date, totalDays, reason]);
        
        // Notify supervisors (in a real app, you might send emails or push notifications)
        const [supervisors] = await pool.query(`
          SELECT id FROM employees 
          WHERE is_supervisor = 1 AND 
          (id IN (SELECT reports_to FROM employees WHERE id = ?) OR department_id = (SELECT department_id FROM employees WHERE id = ?))
        `, [employeeId, employeeId]);
        
        for (const supervisor of supervisors) {
            await pool.query(`
            INSERT INTO notifications (employee_id, title, message)
            VALUES (?, 'Leave Request Pending', ?)
          `,
          [
            supervisor.id,
            `A leave request from ${req.user.first_name} ${req.user.last_name} is pending your approval.`
          ]);
        }
        
        res.status(201).json({ 
          message: 'Leave request submitted successfully',
          id: result.insertId 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Cancel leave request
    router.patch('/:id/cancel', async (req, res) => {
      try {
        const { id } = req.params;
        const employeeId = req.user.id;
        
        // Check if leave request exists and belongs to the employee
        const [leave] = await pool.query(
          'SELECT * FROM leave_requests WHERE id = ? AND employee_id = ?',
          [id, employeeId]
        );
        
        if (leave.length === 0) {
          return res.status(404).json({ message: 'Leave request not found' });
        }
        
        // Only pending leave requests can be cancelled by employee
        if (leave[0].status !== 'pending') {
          return res.status(400).json({ message: 'Only pending leave requests can be cancelled' });
        }
        
        // Update leave request
        await pool.query(
          'UPDATE leave_requests SET status = ?, updated_at = NOW() WHERE id = ?',
          ['cancelled', id]
        );
        
        res.json({ message: 'Leave request cancelled successfully' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get pending leave requests (for supervisors)
    router.get('/pending', async (req, res) => {
      try {
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const [requests] = await pool.query(`
          SELECT lr.id, lr.employee_id, lr.start_date, lr.end_date, lr.total_days, 
                 lr.reason, lr.created_at, lt.name as leave_type,
                 e.first_name, e.last_name, e.profile_image, d.name as department
          FROM leave_requests lr
          JOIN employees e ON lr.employee_id = e.id
          JOIN leave_types lt ON lr.leave_type_id = lt.id
          JOIN departments d ON e.department_id = d.id
          WHERE lr.status = 'pending'
          AND (e.reports_to = ? OR e.department_id = (SELECT department_id FROM employees WHERE id = ?))
          ORDER BY lr.created_at
        `, [req.user.id, req.user.id]);
        
        res.json(requests);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Process leave request (approve/reject - supervisors only)
    router.patch('/:id/process', async (req, res) => {
      try {
        const { id } = req.params;
        const { status, comment } = req.body;
        
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        if (status !== 'approved' && status !== 'rejected') {
          return res.status(400).json({ message: 'Invalid status' });
        }
        
        // Check if leave request exists
        const [leave] = await pool.query(`
        SELECT
            lr.id,
            lr.employee_id,
            lr.leave_type_id,
            lr.start_date,
            lr.end_date,
            lr.total_days,
            lr.reason,
            lr.status,       
            lr.created_at,   
            e.department_id,
            e.reports_to,
            e.first_name,    -- Employee's name
            e.last_name,     -- Employee's name
            lt.name as leave_type_name -- The leave type name
        FROM leave_requests lr
        JOIN employees e ON lr.employee_id = e.id
        JOIN leave_types lt ON lr.leave_type_id = lt.id -- Join to get the name
        WHERE lr.id = ? -- Filter by the specific leave request ID
      `, [id]);
        
        if (leave.length === 0) {
          return res.status(404).json({ message: 'Leave request not found' });
        }
        
        // Make sure supervisor is authorized for this employee
        const leaveRequest = leave[0];
        console.log(" Leave Request Details for Processing:", leaveRequest);
        if (!leaveRequest.leave_type_name) {
            console.error(` ERROR: leave_type_name is missing for leave_request id ${id}, leave_type_id ${leaveRequest.leave_type_id}`);
        }

        const supervisorDept = await pool.query('SELECT department_id FROM employees WHERE id = ?', [req.user.id]);
        
        if (leaveRequest.reports_to !== req.user.id && supervisorDept[0][0].department_id !== leaveRequest.department_id) {
          return res.status(403).json({ message: 'Not authorized to process this request' });
        }
        
        if (leaveRequest.status !== 'pending') {
          return res.status(400).json({ message: 'Only pending requests can be processed' });
        }
        
        // Start a transaction
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
          // Update leave request
          await connection.query(
            'UPDATE leave_requests SET status = ?, comment = ?, approved_by = ?, approved_at = NOW(), updated_at = NOW() ' +
            'WHERE id = ?',
            [status, comment, req.user.id, id]
          );
          
          // If approved, update leave balance
          if (status === 'approved') {
            // Update attendance for the leave period
            const start = new Date(leaveRequest.start_date);
            const end = new Date(leaveRequest.end_date);
            
            console.log("Leave Approval Dates - Start:", start.toISOString(), "End:", end.toISOString());

            for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
               let currentUTC = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
             const dateString = currentUTC.toISOString().split('T')[0];
              
             console.log(`Looping for date: ${day.toISOString()}, using dateString: ${dateString}`); // DEBUG LOOP
             
              const leaveNote = `On ${leaveRequest.leave_type_name || 'N/A'}`; // Corrected string
              console.log(` Attendance Note Generated: "${leaveNote}" for date ${dateString}`);
          
              // Check if attendance record exists
              const [existingRecord] = await connection.query(
                'SELECT id FROM attendance WHERE employee_id = ? AND date = ?',
                [leaveRequest.employee_id, dateString]
              );
              
              if (existingRecord.length > 0) {
                // Update existing record
                await connection.query(
                  'UPDATE attendance SET status = ?, note = ?, check_in = NULL, check_out = NULL WHERE id = ?',
                  ['on-leave', leaveNote, existingRecord[0].id] 
              );
              console.log(`Updated attendance record ID: ${existingRecord[0].id} for date: ${dateString}`); // DEBUG
              } else {
                // Create new record
                await connection.query(
                  'INSERT INTO attendance (employee_id, date, status, note) VALUES (?, ?, ?, ?)',
                  [leaveRequest.employee_id, dateString, 'on-leave', leaveNote] // Provide actual values
              );
               console.log(`Inserted new attendance record for date: ${dateString}`);
              }
            }
            
            // Leave balance is updated by the trigger
          }
          
          // Notify the employee
          await connection.query(`
            INSERT INTO notifications (employee_id, title, message)
            VALUES (?, ?, ?)
          `, [
            leaveRequest.employee_id,
            `Leave Request ${status.charAt(0).toUpperCase() + status.slice(1)}`,
            `Your leave request from ${leaveRequest.start_date} to ${leaveRequest.end_date} has been ${status}.${comment ? ' Comment: ' + comment : ''}`
          ]);
          
          await connection.commit();
          
          res.json({ message: `Leave request ${status} successfully` });
        } catch (error) {
          await connection.rollback();
          throw error;
        } finally {
          connection.release();
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get leave calendar (for supervisors)
    router.get('/calendar', async (req, res) => {
      try {
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const year = parseInt(req.query.year) || new Date().getFullYear();
        const month = req.query.month ? parseInt(req.query.month) : null;
        const departmentId = req.query.department; 
        
        let query = `
          SELECT lr.id, lr.employee_id, lr.start_date, lr.end_date, lr.total_days,
                 lr.status, lt.name as leave_type, lt.id as leave_type_id,
                 e.first_name, e.last_name, d.name as department
          FROM leave_requests lr
          JOIN employees e ON lr.employee_id = e.id
          JOIN leave_types lt ON lr.leave_type_id = lt.id
          JOIN departments d ON e.department_id = d.id
          WHERE lr.status = 'approved'
        `;
        
        const queryParams = [];
        
        if (month !== null) {
          query += `
            AND ((YEAR(lr.start_date) = ? AND MONTH(lr.start_date) = ?) OR
                 (YEAR(lr.end_date) = ? AND MONTH(lr.end_date) = ?) OR
                 (lr.start_date <= ? AND lr.end_date >= ?))
          `;
          const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
          const endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of month
          queryParams.push(year, month, year, month, endDate, startDate);
        } else {
          query += ` AND YEAR(lr.start_date) = ? OR YEAR(lr.end_date) = ?`;
          queryParams.push(year, year);
        }
        
        if (departmentId) {
          query += " AND e.department_id = ?";
          queryParams.push(departmentId);
        }
        
        query += " ORDER BY lr.start_date, e.first_name, e.last_name";
        
        const [leaves] = await pool.query(query, queryParams);
        
        res.json(leaves);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get leave types
    router.get('/types', async (req, res) => {
      try {
        const [types] = await pool.query('SELECT id, name, default_days, description FROM leave_types');
        res.json(types);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    return router;
  };