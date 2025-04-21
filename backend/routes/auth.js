// backend/routes/auth.js
module.exports = (pool) => {
    const express = require('express');
    const router = express.Router();
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');
  
    // Employee login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: '***' });  // Log attempt but hide password
    
    // Get user from database
    const [rows] = await pool.query(
      'SELECT * FROM employees WHERE email = ? AND is_active = 1',
      [email]
    );
    
    console.log('Query result:', rows.length > 0 ? 'User found' : 'User not found');
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = rows[0];
    
    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', validPassword);
    
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Create token
    const token = jwt.sign(
      { 
        id: user.id,
        employee_id: user.employee_id,
        is_supervisor: user.is_supervisor,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role_id: user.role_id,             
        department_id: user.department_id 
      },
      process.env.JWT_SECRET || 'your_jwt_secret',
      { expiresIn: '12h' }
    );
    
    console.log('Login successful, token created');
    
    res.json({
      token,
      user: {
        id: user.id,
        employee_id: user.employee_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        is_supervisor: user.is_supervisor,
        profile_image: user.profile_image,
        department_id: user.department_id,
        designation_id: user.designation_id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
    
    // Register new employee (for admins/supervisors only)
    router.post('/register', async (req, res) => {
      let connection;
      try {
        const creatorUserId = req.user?.id || null; // Use logged-in user ID if available, else null
             if (!creatorUserId) {
                 console.warn("Attempt to register employee without authenticated user (creator unknown).")};

        const { 
          first_name, last_name, email, password, phone, department_id, 
          designation_id, role_id, employee_type_id, is_supervisor,
          hire_date, reports_to,initial_salary 
        } = req.body;
        


        if (!first_name || !last_name || !email || !password || password.length < 8 || !hire_date || !department_id || !designation_id || !role_id || !employee_type_id || !initial_salary) {
          return res.status(400).json({ message: 'Missing required fields: First Name, Last Name, Email, Password (min 8 chars), Hire Date, Department, Designation, Role, Employee Type, Initial Salary are required.' });
      }
      const parsedSalary = parseFloat(initial_salary);
      if (isNaN(parsedSalary) || parsedSalary <= 0) {
          return res.status(400).json({ message: 'Initial salary must be a valid positive number.' });
      }

        // Generate employee ID (e.g., EMP-2023-001)
        const year = new Date().getFullYear();
        const [lastEmpResult] = await pool.query(
          "SELECT employee_id FROM employees WHERE employee_id LIKE ? ORDER BY id DESC LIMIT 1",
          [`EMP-${year}-%`]
        );
        
        let employeeIdNum = 1;
        if (lastEmpResult.length > 0) {
          const lastId = lastEmpResult[0].employee_id;
          const lastNum = parseInt(lastId.split('-')[2]);
           if (!isNaN(lastNum)) { // Check if parsing was successful
                   employeeIdNum = lastNum + 1;
                }
        }
        
        const employee_id = `EMP-${year}-${String(employeeIdNum).padStart(3, '0')}`;
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        connection = await pool.getConnection();
        await connection.beginTransaction();
        
        // Insert new employee
        try {
       
          const [result] = await connection.query(
              `INSERT INTO employees (
                  employee_id, first_name, last_name, email, password, phone, address, profile_image, birth_date, gender, hire_date,
                  department_id, designation_id, role_id, employee_type_id, is_supervisor, reports_to, emergency_contact, is_active, created_at, updated_at
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
               [
                   employee_id, first_name, last_name, email, hashedPassword, phone || null, address || null, null, // profile_image default null
                   birth_date || null, gender || null, hire_date, department_id, designation_id, role_id, employee_type_id,
                    0, // <-- Default to NOT supervisor
                    reports_to || null, emergency_contact || null,
                    1 // Default to active
               ]
           );
          const newEmployeeId = result.insertId;

          // 2. Insert initial salary history record
          await connection.query(
              `INSERT INTO salary_history (employee_id, amount, effective_date, reason, created_by, created_at)
               VALUES (?, ?, ?, ?, ?, NOW())`,
               [newEmployeeId, parsedSalary, hire_date, 'Initial Salary', creatorUserId] // Use creator ID
           );

          // 3. Commit Transaction
           await connection.commit();

          res.status(201).json({
               message: 'Employee registered successfully with initial salary.',
               employee_id: employee_id,
               id: newEmployeeId
           });

     } catch (transactionError) {
         // Rollback on any error during transaction
         await connection.rollback();
          console.error("Transaction Error:", transactionError); // Log specific transaction error

            // Handle specific transaction errors if needed
            if (transactionError.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Email already exists.' });
            }
            if (transactionError.code === 'ER_NO_REFERENCED_ROW_2') {
                // Determine which foreign key failed (dept, desig, role, etc.)
                 let detail = transactionError.sqlMessage.includes('department_id') ? 'Department' :
                               transactionError.sqlMessage.includes('designation_id') ? 'Designation' :
                              transactionError.sqlMessage.includes('role_id') ? 'Role' :
                              transactionError.sqlMessage.includes('employee_type_id') ? 'Employee Type' :
                              transactionError.sqlMessage.includes('reports_to') ? 'Reports To Supervisor' :
                               'Reference';
                  return res.status(400).json({ message: `Invalid ID provided for ${detail}.` });
            }

            throw transactionError; // Re-throw to be caught by outer catch block
     }

 } catch (error) { 
     // Rollback if connection was established but commit failed or error before commit
     if (connection && connection.connection._closing === false && connection.connection._protocol._transactionState === 'TRANSACTION') { // Robust check if rollback needed
         try { await connection.rollback(); } catch (rbError) { console.error("Rollback failed:", rbError); }
     }
     console.error("Registration Route Error:", error);
      // Ensure duplicate email check is handled even if before transaction
      if (error.code === 'ER_DUP_ENTRY') {
         return res.status(400).json({ message: 'Email already exists.' });
     }
     res.status(500).json({ message: 'Server error during registration', error: error.message });
 } finally {

     if (connection) connection.release();
 }
});
    
    // Request password reset
    router.post('/reset-password-request', async (req, res) => {
      try {
        const { email } = req.body;
        
        // Check if email exists
        const [rows] = await pool.query('SELECT * FROM employees WHERE email = ?', [email]);
        
        if (rows.length === 0) {
          
          return res.json({ message: 'If the email exists, reset instructions will be sent.' });
        }
        
        // Generate reset token
        const resetToken = jwt.sign(
          { id: rows[0].id, email },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '1h' }
        );
        
        // In a production app, send an email with the reset link,For this demo, we'll just return the tokenFor this demo, we'll just return the token
      
        res.json({ 
          message: 'Password reset instructions sent',
          resetToken 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Reset password with token
    router.post('/reset-password', async (req, res) => {
      try {
        const { resetToken, password } = req.body;
        
        // Verify token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update password
        await pool.query('UPDATE employees SET password = ? WHERE id = ?', [hashedPassword, decoded.id]);
        
        res.json({ message: 'Password reset successful' });
      } catch (error) {
        console.error(error);
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
          return res.status(400).json({ message: 'Invalid or expired token' });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });


    //   temporary debug route
router.get('/test-users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, employee_id, first_name, last_name, email, password, is_supervisor FROM employees');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

//  temporary route 
router.get('/reset-password', async (req, res) => {
  try {
    // Generate a fresh hash for 'password123'
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    
    console.log('Generated hash for password123:', hashedPassword);
    
    // Update both users
    await pool.query(
      'UPDATE employees SET password = ? WHERE email IN (?, ?)',
      [hashedPassword, 'supervisor@example.com', 'employee@example.com']
    );
    
    res.json({ message: 'Passwords reset successfully', hash: hashedPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

    // Get authenticated user profile
    router.get('/me', async (req, res) => {
      try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
          return res.status(401).json({ message: 'No token provided' });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        
        // Get user profile
        const [rows] = await pool.query(
          `SELECT e.*, d.name as department_name, des.name as designation_name, r.name as role_name
           FROM employees e
           JOIN departments d ON e.department_id = d.id
           JOIN designations des ON e.designation_id = des.id
           JOIN roles r ON e.role_id = r.id
           WHERE e.id = ?`,
          [decoded.id]
        );
        
        if (rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
        }
        
        const user = rows[0];
        
        // Remove sensitive data
        delete user.password;
        
        res.json({ user });
      } catch (error) {
        console.error(error);
        
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Invalid or expired token' });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
  
    return router;
  };