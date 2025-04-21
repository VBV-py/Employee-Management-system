// backend/routes/admin.js
module.exports = (pool) => {
    const express = require('express');
    const router = express.Router();
    
    // Get all departments
    router.get('/departments', async (req, res) => {
      try {
        const [departments] = await pool.query(`
          SELECT d.id, d.name, d.description,
                 COUNT(e.id) as employee_count
          FROM departments d
          LEFT JOIN employees e ON d.id = e.department_id AND e.is_active = 1
          GROUP BY d.id, d.name, d.description
          ORDER BY d.name
        `);
        
        res.json(departments);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Add department
    router.post('/departments', async (req, res) => {
      try {
        const { name, description } = req.body;
        
        const [result] = await pool.query(
          'INSERT INTO departments (name, description) VALUES (?, ?)',
          [name, description]
        );
        
        res.status(201).json({ 
          message: 'Department added successfully',
          id: result.insertId 
        });
      } catch (error) {
        console.error(error);
        
        if (error.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'Department name already exists' });
        }
        
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Update department
    router.patch('/departments/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { name, description } = req.body;
        
        const [result] = await pool.query(
          'UPDATE departments SET name = ?, description = ? WHERE id = ?',
          [name, description, id]
        );
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Department not found' });
        }
        
        res.json({ message: 'Department updated successfully' });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Department name already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get all designations
  router.get('/designations', async (req, res) => {
    try {
      const [designations] = await pool.query(`
        SELECT d.id, d.name, d.description,
               COUNT(e.id) as employee_count
        FROM designations d
        LEFT JOIN employees e ON d.id = e.designation_id AND e.is_active = 1
        GROUP BY d.id, d.name, d.description
        ORDER BY d.name
      `);
      
      res.json(designations);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Add designation
  router.post('/designations', async (req, res) => {
    try {
      const { name, description } = req.body;
      
      const [result] = await pool.query(
        'INSERT INTO designations (name, description) VALUES (?, ?)',
        [name, description]
      );
      
      res.status(201).json({ 
        message: 'Designation added successfully',
        id: result.insertId 
      });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Designation name already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Update designation
  router.patch('/designations/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;
      
      const [result] = await pool.query(
        'UPDATE designations SET name = ?, description = ? WHERE id = ?',
        [name, description, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Designation not found' });
      }
      
      res.json({ message: 'Designation updated successfully' });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Designation name already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get all roles
  router.get('/roles', async (req, res) => {
    try {
      const [roles] = await pool.query(`
        SELECT r.id, r.name, r.description,
               COUNT(e.id) as employee_count
        FROM roles r
        LEFT JOIN employees e ON r.id = e.role_id AND e.is_active = 1
        GROUP BY r.id, r.name, r.description
        ORDER BY r.name
      `);
      
      res.json(roles);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Add role
  router.post('/roles', async (req, res) => {
    try {
      const { name, description } = req.body;
      
      const [result] = await pool.query(
        'INSERT INTO roles (name, description) VALUES (?, ?)',
        [name, description]
      );
      
      res.status(201).json({ 
        message: 'Role added successfully',
        id: result.insertId 
      });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Role name already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get all employee types
  router.get('/employee-types', async (req, res) => {
    try {
      const [types] = await pool.query(`
        SELECT et.id, et.name, et.description,
               COUNT(e.id) as employee_count
        FROM employee_types et
        LEFT JOIN employees e ON et.id = e.employee_type_id AND e.is_active = 1
        GROUP BY et.id, et.name, et.description
        ORDER BY et.name
      `);
      
      res.json(types);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Add employee type
  router.post('/employee-types', async (req, res) => {
    try {
      const { name, description } = req.body;
      
      const [result] = await pool.query(
        'INSERT INTO employee_types (name, description) VALUES (?, ?)',
        [name, description]
      );
      
      res.status(201).json({ 
        message: 'Employee type added successfully',
        id: result.insertId 
      });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Employee type already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Manage leave types
  router.get('/leave-types', async (req, res) => {
    try {
      const [types] = await pool.query(
        'SELECT id, name, default_days, description FROM leave_types ORDER BY name'
      );
      
      res.json(types);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Add leave type
  router.post('/leave-types', async (req, res) => {
    try {
      const { name, default_days, description } = req.body;
      
      const [result] = await pool.query(
        'INSERT INTO leave_types (name, default_days, description) VALUES (?, ?, ?)',
        [name, default_days, description]
      );
      
      res.status(201).json({ 
        message: 'Leave type added successfully',
        id: result.insertId 
      });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Leave type name already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get system logs
  router.get('/logs', async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const offset = (page - 1) * limit;
      
      // Get logs with user information and filtering
      let query = `
        SELECT l.id, l.action, l.entity, l.entity_id, l.details,
               l.ip_address, l.created_at,
               CONCAT(e.first_name, ' ', e.last_name) as user_name,
               e.employee_id as user_employee_id
        FROM system_logs l
        LEFT JOIN employees e ON l.user_id = e.id
        WHERE 1=1
      `;
      
      const queryParams = [];
      
      // Add filters if provided
      if (req.query.action) {
        query += " AND l.action = ?";
        queryParams.push(req.query.action);
      }
      
      if (req.query.entity) {
        query += " AND l.entity = ?";
        queryParams.push(req.query.entity);
      }
      
      if (req.query.user_id) {
        query += " AND l.user_id = ?";
        queryParams.push(req.query.user_id);
      }
      
      // Add date range filter
      if (req.query.start_date && req.query.end_date) {
        query += " AND DATE(l.created_at) BETWEEN ? AND ?";
        queryParams.push(req.query.start_date, req.query.end_date);
      }
      
      const countQuery = query.replace("SELECT l.id, l.action", "SELECT COUNT(*) as total");
      
      // Add sorting and pagination
      query += " ORDER BY l.created_at DESC LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);
      
      // Execute queries
      const [logs] = await pool.query(query, queryParams);
      const [countResult] = await pool.query(countQuery, queryParams.slice(0, -2));
      
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);
      
      res.json({
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Get all skills (for skill management)
  router.get('/skills', async (req, res) => {
    try {
      const [skills] = await pool.query(`
        SELECT s.id, s.name, s.category, s.description,
               COUNT(es.id) as employee_count
        FROM skills s
        LEFT JOIN employee_skills es ON s.id = es.skill_id
        GROUP BY s.id, s.name, s.category, s.description
        ORDER BY s.category, s.name
      `);
      
      res.json(skills);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Add new skill
  router.post('/skills', async (req, res) => {
    try {
      const { name, category, description } = req.body;
      
      const [result] = await pool.query(
        'INSERT INTO skills (name, category, description) VALUES (?, ?, ?)',
        [name, category, description]
      );
      
      res.status(201).json({ 
        message: 'Skill added successfully',
        id: result.insertId 
      });
    } catch (error) {
      console.error(error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ message: 'Skill name already exists' });
      }
      
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  return router;
};