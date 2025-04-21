// backend/routes/dashboard.js
module.exports = (pool) => {
    const express = require('express');
    const router = express.Router();
    
    // Get employee dashboard data
    router.get('/employee', async (req, res) => {
      try {
        const employeeId = req.user.id;
        
        // Get today's attendance status
        const today = new Date().toISOString().split('T')[0];
        const [attendance] = await pool.query(
          'SELECT check_in, check_out, status FROM attendance WHERE employee_id = ? AND date = ?',
          [employeeId, today]
        );
        
        const todayAttendance = attendance.length > 0 ? attendance[0] : { status: 'not-checked-in' };
        
        // Get leave balance summary
        const [leaveBalances] = await pool.query(`
          SELECT lt.name, lb.total_days, lb.used_days, (lb.total_days - lb.used_days) as available_days
          FROM leave_balances lb 
          JOIN leave_types lt ON lb.leave_type_id = lt.id
          WHERE lb.employee_id = ? AND lb.year = YEAR(CURRENT_DATE)
        `, [employeeId]);
        
        // Get upcoming leave requests
        const [upcomingLeaves] = await pool.query(`
          SELECT lr.start_date, lr.end_date, lr.total_days, lr.status, lt.name as leave_type
          FROM leave_requests lr
          JOIN leave_types lt ON lr.leave_type_id = lt.id
          WHERE lr.employee_id = ? 
          AND lr.status IN ('pending', 'approved') 
          AND lr.start_date >= CURDATE()
          ORDER BY lr.start_date
          LIMIT 3
        `, [employeeId]);
        
        // Get assigned projects
        const [projects] = await pool.query(`
          SELECT p.id, p.name, p.status, pa.role
          FROM projects p
          JOIN project_assignments pa ON p.id = pa.project_id
          WHERE pa.employee_id = ? AND p.status != 'completed'
          ORDER BY p.start_date
          LIMIT 5
        `, [employeeId]);
        
        // Get recent notifications
        const [notifications] = await pool.query(`
          SELECT id, title, message, is_read, created_at
          FROM notifications
          WHERE employee_id = ?
          ORDER BY created_at DESC
          LIMIT 5
        `, [employeeId]);
        
        // Get upcoming birthdays in the department
        const [birthdays] = await pool.query(`
          SELECT id, first_name, last_name, profile_image, birth_date
          FROM employees
          WHERE 
            department_id = (SELECT department_id FROM employees WHERE id = ?)
            AND id != ?
            AND birth_date IS NOT NULL
            AND (
              (MONTH(birth_date) > MONTH(CURDATE())) OR 
              (MONTH(birth_date) = MONTH(CURDATE()) AND DAY(birth_date) >= DAY(CURDATE()))
            )
          ORDER BY MONTH(birth_date), DAY(birth_date)
          LIMIT 5
        `, [employeeId, employeeId]);
        
        res.json({
          today_attendance: todayAttendance,
          leave_balances: leaveBalances,
          upcoming_leaves: upcomingLeaves,
          projects,
          notifications,
          birthdays
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
   // Get supervisor dashboard data
router.get('/supervisor', async (req, res) => {
  try {
      // --- AUTH CHECK ---
    
      if (!req.user || !req.user.is_supervisor) {
          console.warn('Unauthorized dashboard access attempt:', req.user); // Log attempt
          return res.status(403).json({ message: 'Not authorized' });
      }
      const supervisorId = req.user.id; // Store supervisor ID

      const today = new Date().toISOString().split('T')[0]; // Define today's date string

      // --- ATTENDANCE SUMMARY ---
      const [attendanceSummaryRows] = await pool.query(`
          SELECT
            (SELECT COUNT(*) FROM employees WHERE is_active = 1) as total_employees,
            COUNT(DISTINCT a.employee_id) as checked_in,
            COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present,
            COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late,
            COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent,
            COUNT(CASE WHEN a.status = 'on-leave' THEN 1 END) as on_leave
          FROM attendance a
          WHERE a.date = ?
        `, [today]);
      // handle potentially empty result
      const attendanceSummary = attendanceSummaryRows.length > 0 ? attendanceSummaryRows[0] : {
           total_employees: 0, checked_in: 0, present: 0, late: 0, absent: 0, on_leave: 0
       };

      // --- PENDING LEAVES ---
      const [pendingLeaves] = await pool.query(`
          SELECT lr.id, lr.employee_id, lr.start_date, lr.end_date, lr.total_days,
                 lr.created_at, lt.name as leave_type,
                 e.first_name, e.last_name, e.profile_image, d.name as department /* Added department */
          FROM leave_requests lr
          JOIN employees e ON lr.employee_id = e.id
          JOIN leave_types lt ON lr.leave_type_id = lt.id
          JOIN departments d ON e.department_id = d.id /* Added Join */
          WHERE lr.status = 'pending'
          /* Optional: Add filtering if supervisor only sees their reports/department */
          /* AND (e.reports_to = ? OR e.department_id = (SELECT department_id FROM employees WHERE id = ?)) */
          ORDER BY lr.start_date
          LIMIT 5
        `); 

      // --- ON LEAVE TODAY ---
 
      const [onLeaveToday] = await pool.query(`
          SELECT e.id, e.first_name, e.last_name, e.profile_image,
                 lt.name as leave_type, lr.start_date, lr.end_date
          FROM employees e
          JOIN leave_requests lr ON e.id = lr.employee_id
          JOIN leave_types lt ON lr.leave_type_id = lt.id
          WHERE lr.status = 'approved'
          AND CURDATE() BETWEEN lr.start_date AND lr.end_date -- Use CURDATE()
          ORDER BY e.first_name, e.last_name
        `); 

      // --- DEPARTMENT SUMMARY ---
      const [departmentSummary] = await pool.query(`
          SELECT d.id, d.name, COUNT(e.id) as employee_count
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id AND e.is_active = 1
          GROUP BY d.id, d.name
          ORDER BY employee_count DESC
        `);

      // --- RECENT HIRES ---
      const [recentHires] = await pool.query(`
          SELECT e.id, e.first_name, e.last_name, e.profile_image,
                 e.hire_date, d.name as department, des.name as designation
          FROM employees e
          JOIN departments d ON e.department_id = d.id
          JOIN designations des ON e.designation_id = des.id
          WHERE e.is_active = 1
          ORDER BY e.hire_date DESC
          LIMIT 5
        `);

      // --- PROJECT SUMMARY ---
      const [projectSummary] = await pool.query(`
          SELECT status, COUNT(*) as count
          FROM projects
          GROUP BY status
        `);

      // --- SEND RESPONSE ---
      
      res.json({
          attendance_summary: attendanceSummary, 
          pending_leaves: pendingLeaves || [],   
          on_leave_today: onLeaveToday || [],   
          department_summary: departmentSummary || [], 
          recent_hires: recentHires || [],     
          project_summary: projectSummary || []     
      });
  } catch (error) {
      
      console.error('SUPERVISOR DASHBOARD BACKEND ERROR:', error);
      
      res.status(500).json({ message: 'Server error processing dashboard data', error: error.message });
  }
});
    
    return router;
  };