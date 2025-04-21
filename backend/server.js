// backend/server.js
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'employee_management_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Import routes
const authRoutes = require('./routes/auth')(pool);
const employeeRoutes = require('./routes/employees')(pool, upload);
const attendanceRoutes = require('./routes/attendance')(pool);
const leaveRoutes = require('./routes/leaves')(pool);
const projectRoutes = require('./routes/projects')(pool);
const adminRoutes = require('./routes/admin')(pool);
const dashboardRoutes = require('./routes/dashboard')(pool);
const documentRoutes = require('./routes/documents')(pool, upload);
const notificationRoutes = require('./routes/notifications')(pool);

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Check supervisor role middleware
const isSupervisor = (req, res, next) => {
  if (!req.user || !req.user.is_supervisor) {
    return res.status(403).json({ message: 'Access denied. Supervisor role required.' });
  }
  next();
};



// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', authenticateToken, employeeRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);
app.use('/api/leaves', authenticateToken, leaveRoutes);
app.use('/api/projects', authenticateToken, projectRoutes);
app.use('/api/admin', authenticateToken, isSupervisor, adminRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/documents', authenticateToken, documentRoutes);
app.use('/api/notifications', authenticateToken, notificationRoutes);

app.get('/', (req, res) => {
  res.send('Employee Management System API is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;