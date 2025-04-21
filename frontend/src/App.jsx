// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';

// Import Pages
import LoginPage from './pages/LoginPage.jsx';
import EmployeeDashboard from './pages/employee/Dashboard.jsx';
import SupervisorDashboard from './pages/supervisor/Dashboard.jsx';
import EmployeeProfilePage from './pages/employee/Profile.jsx';
import EmployeeAttendancePage from './pages/employee/Attendance.jsx';
import EmployeeLeavePage from './pages/employee/Leave.jsx';
import EmployeeProjectsPage from './pages/employee/Projects.jsx';
import EmployeeDocumentsPage from './pages/employee/Documents.jsx';
import SupervisorEmployeeEditPage from './pages/supervisor/EmployeeEdit.jsx'
import SupervisorEmployeesPage from './pages/supervisor/Employees.jsx';
import SupervisorEmployeeAddPage from './pages/supervisor/EmployeeAdd.jsx';
import SupervisorEmployeeDetailsPage from './pages/supervisor/EmployeeDetails.jsx';
import SupervisorAttendancePage from './pages/supervisor/Attendance.jsx';
import SupervisorLeavesPage from './pages/supervisor/Leaves.jsx';
import SupervisorProjectsPage from './pages/supervisor/Projects.jsx';
import SupervisorProjectDetailsPage from './pages/supervisor/ProjectDetails.jsx';
import SupervisorProjectEditPage from './pages/supervisor/ProjectEdit.jsx';
import SupervisorSettingsPage from './pages/supervisor/Settings.jsx';
import EmployeeSalaryPage from './pages/employee/Salary.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

// Private Route component
const PrivateRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="spinner"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (requiredRole && requiredRole === 'supervisor' && !user.is_supervisor) {
    return <Navigate to="/employee/dashboard" />;
  }
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Employee Routes */}
          <Route 
            path="/employee/dashboard" 
            element={
              <PrivateRoute>
                <EmployeeDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employee/profile" 
            element={
              <PrivateRoute>
                <EmployeeProfilePage />
              </PrivateRoute>
            } 
          />
          <Route
              path="/employee/salary"
              element={ <PrivateRoute> <EmployeeSalaryPage /> </PrivateRoute> }
           />
          <Route 
            path="/employee/attendance" 
            element={
              <PrivateRoute>
                <EmployeeAttendancePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employee/leave" 
            element={
              <PrivateRoute>
                <EmployeeLeavePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employee/projects" 
            element={
              <PrivateRoute>
                <EmployeeProjectsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/employee/documents" 
            element={
              <PrivateRoute>
                <EmployeeDocumentsPage />
              </PrivateRoute>
            } 
          />
          
          {/* Supervisor Routes */}
          <Route 
            path="/supervisor/dashboard" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorDashboard />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/supervisor/employees" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorEmployeesPage />
              </PrivateRoute>
            } 
          />
          <Route
              path="/supervisor/employees/add"
              element={
                  <PrivateRoute requiredRole="supervisor">
                      <SupervisorEmployeeAddPage />
                  </PrivateRoute>
              }
          />
          <Route
            path="/supervisor/employees/:id/edit"
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorEmployeeEditPage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/supervisor/employees/:id" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorEmployeeDetailsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/supervisor/attendance" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorAttendancePage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/supervisor/leaves" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorLeavesPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/supervisor/projects" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorProjectsPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/supervisor/projects/:id" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorProjectDetailsPage />
              </PrivateRoute>
            } 
          />
           <Route
            path="/supervisor/projects/:id/edit"
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorProjectEditPage />
              </PrivateRoute>
            }
          />
          <Route 
            path="/supervisor/settings" 
            element={
              <PrivateRoute requiredRole="supervisor">
                <SupervisorSettingsPage />
              </PrivateRoute>
            } 
          />
          
          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;