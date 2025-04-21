// backend/routes/projects.js
module.exports = (pool) => {
    const express = require('express');
    const router = express.Router();
    
    // Get all projects 
    router.get('/', async (req, res) => {
      try {
        // Regular employees see only their assigned projects
        if (!req.user.is_supervisor) {
          const [projects] = await pool.query(`
            SELECT p.id, p.name, p.description, p.start_date, p.end_date, p.status,
                   pa.role as assignment_role
            FROM projects p
            JOIN project_assignments pa ON p.id = pa.project_id
            WHERE pa.employee_id = ?
            ORDER BY p.start_date DESC
          `, [req.user.id]);
          
          return res.json(projects);
        }
        
        // Supervisors see all projects
        const [projects] = await pool.query(`
          SELECT p.id, p.name, p.description, p.start_date, p.end_date, p.status,
                 COUNT(pa.id) as total_members
          FROM projects p
          LEFT JOIN project_assignments pa ON p.id = pa.project_id
          GROUP BY p.id
          ORDER BY p.start_date DESC
        `);
        
        res.json(projects);
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Get project by ID with team members
    router.get('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        // Check if regular employee has access to this project
        if (!req.user.is_supervisor) {
          const [assignment] = await pool.query(
            'SELECT id FROM project_assignments WHERE project_id = ? AND employee_id = ?',
            [id, req.user.id]
          );
          
          if (assignment.length === 0) {
            return res.status(403).json({ message: 'Not authorized to view this project' });
          }
        }
        
        // Get project details
        const [projectDetails] = await pool.query(
          'SELECT * FROM projects WHERE id = ?',
          [id]
        );
        
        if (projectDetails.length === 0) {
          return res.status(404).json({ message: 'Project not found' });
        }
        
        // Get team members
        const [members] = await pool.query(`
          SELECT pa.id as assignment_id, pa.employee_id, pa.role, pa.start_date, pa.end_date,
                 e.first_name, e.last_name, e.profile_image,
                 d.name as department, des.name as designation
          FROM project_assignments pa
          JOIN employees e ON pa.employee_id = e.id
          JOIN departments d ON e.department_id = d.id
          JOIN designations des ON e.designation_id = des.id
          WHERE pa.project_id = ?
          ORDER BY pa.role, e.first_name, e.last_name
        `, [id]);
        
        res.json({
          project: projectDetails[0],
          members
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Create new project (supervisor only)
    router.post('/', async (req, res) => {
      try {
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { name, description, start_date, end_date, status } = req.body;
        
        const [result] = await pool.query(
          'INSERT INTO projects (name, description, start_date, end_date, status) VALUES (?, ?, ?, ?, ?)',
          [name, description, start_date, end_date, status]
        );
        
        // Log the creation
        await pool.query(
          'INSERT INTO system_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, 'CREATE', 'projects', result.insertId, `Project created: ${name}`]
        );
        
        res.status(201).json({ 
          message: 'Project created successfully',
          id: result.insertId 
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
      }
    });
    
    // Update project (supervisor only)
    router.patch('/:id', async (req, res) => {
      try {
        const { id } = req.params;
        
        if (!req.user.is_supervisor) {
          return res.status(403).json({ message: 'Not authorized' });
        }
        
        const { name, description, start_date, end_date, status } = req.body;
        
        const updateFields = {};
        if (name) updateFields.name = name;
        if (description !== undefined) updateFields.description = description;
      if (start_date) updateFields.start_date = start_date;
      if (end_date) updateFields.end_date = end_date;
      if (status) updateFields.status = status;
      
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      // Build update query
      const setClause = Object.keys(updateFields).map(key => `${key} = ?`).join(', ');
      const queryParams = [...Object.values(updateFields), id];
      
      const [result] = await pool.query(`UPDATE projects SET ${setClause} WHERE id = ?`, queryParams);
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Log the update
      await pool.query(
        'INSERT INTO system_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'UPDATE', 'projects', id, `Project updated: ${JSON.stringify(updateFields)}`]
      );
      
      res.json({ 
        message: 'Project updated successfully',
        updated: updateFields
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Assign employee to project (supervisor only)
  router.post('/:id/assign', async (req, res) => {
    try {
      const { id } = req.params;
      const { employee_id, role, start_date, end_date } = req.body;
      
      if (!req.user.is_supervisor) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Check if project exists
      const [project] = await pool.query('SELECT id, name FROM projects WHERE id = ?', [id]);
      
      if (project.length === 0) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if employee exists
      const [employee] = await pool.query('SELECT id, first_name, last_name FROM employees WHERE id = ?', [employee_id]);
      
      if (employee.length === 0) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      // Check if already assigned
      const [existing] = await pool.query(
        'SELECT id FROM project_assignments WHERE project_id = ? AND employee_id = ?',
        [id, employee_id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ message: 'Employee already assigned to this project' });
      }
      
      // Assign employee
      const [result] = await pool.query(
        'INSERT INTO project_assignments (project_id, employee_id, role, start_date, end_date) VALUES (?, ?, ?, ?, ?)',
        [id, employee_id, role, start_date, end_date]
      );
      
      // Log the assignment (system logs handled by trigger)
      
      res.status(201).json({ 
        message: 'Employee assigned to project successfully',
        id: result.insertId 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  // Remove employee from project (supervisor only)
  router.delete('/:projectId/assignments/:assignmentId', async (req, res) => {
    try {
      const { projectId, assignmentId } = req.params;
      
      if (!req.user.is_supervisor) {
        return res.status(403).json({ message: 'Not authorized' });
      }
      
      // Get assignment details for logging
      const [assignment] = await pool.query(`
        SELECT pa.id, pa.employee_id, pa.role, p.name as project_name, 
               CONCAT(e.first_name, ' ', e.last_name) as employee_name
        FROM project_assignments pa
        JOIN projects p ON pa.project_id = p.id
        JOIN employees e ON pa.employee_id = e.id
        WHERE pa.id = ? AND pa.project_id = ?
      `, [assignmentId, projectId]);
      
      if (assignment.length === 0) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      // Remove assignment
      await pool.query('DELETE FROM project_assignments WHERE id = ?', [assignmentId]);
      
      // Log the removal
      await pool.query(
        'INSERT INTO system_logs (user_id, action, entity, entity_id, details) VALUES (?, ?, ?, ?, ?)',
        [
          req.user.id, 
          'DELETE', 
          'project_assignments', 
          assignmentId, 
          `Removed ${assignment[0].employee_name} from project ${assignment[0].project_name}`
        ]
      );
      
      // Notify the employee
      await pool.query(`
        INSERT INTO notifications (employee_id, title, message)
        VALUES (?, ?, ?)
      `, [
        assignment[0].employee_id,
        'Project Assignment Removed',
        `You have been removed from project: ${assignment[0].project_name}`
      ]);
      
      res.json({ message: 'Employee removed from project successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
  
  return router;
};