// src/components/layouts/EmployeeLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import api from '../../services/api.js';
import { 
  FiHome, 
  FiUser, 
  FiCalendar, 
  FiFileText, 
  FiBriefcase, 
  FiFolder,
  FiBell, 
  FiMenu, 
  FiX, 
  FiLogOut,
  FiDollarSign,
  
} from 'react-icons/fi';

const EmployeeLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  
  useEffect(() => {
    // Fetch notification count
    const fetchNotificationCount = async () => {
      try {
        const response = await api.get('/notifications', { 
          params: { limit: 5, unread: true } 
        });
        setNotifications(response.data.notifications);
        setNotificationCount(response.data.unread_count);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };
    
    fetchNotificationCount();
    
    // Set up polling for new notifications
    const interval = setInterval(fetchNotificationCount, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const navigation = [
    { name: 'Dashboard', path: '/employee/dashboard', icon: <FiHome className="h-5 w-5" /> },
    { name: 'Profile', path: '/employee/profile', icon: <FiUser className="h-5 w-5" /> },
    { name: 'Attendance', path: '/employee/attendance', icon: <FiCalendar className="h-5 w-5" /> },
    { name: 'Leave', path: '/employee/leave', icon: <FiFileText className="h-5 w-5" /> },
    { name: 'Projects', path: '/employee/projects', icon: <FiBriefcase className="h-5 w-5" /> },
    { name: 'Documents', path: '/employee/documents', icon: <FiFolder className="h-5 w-5" /> },
    { name: 'Salary', path: '/employee/salary', icon: <FiDollarSign className="h-5 w-5" /> },
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const markNotificationAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      setNotificationCount(prev => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary-600">EMS</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? 'border-primary-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              {/* Notification bell */}
              <div className="relative mr-4">
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none relative"
                >
                  <FiBell className="h-6 w-6" />
                  {notificationCount > 0 && (
                    <span className="absolute top-0 right-0 inline-block w-3 h-3 transform -translate-y-1/4 translate-x-1/4 bg-red-600 rounded-full"></span>
                  )}
                </button>
                
                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-700">Notifications</p>
                      </div>
                      {notifications.length === 0 ? (
                        <div className="px-4 py-2 text-sm text-gray-500">No new notifications</div>
                      ) : (
                        <>
                          {notifications.map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`px-4 py-3 hover:bg-gray-50 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                            >
                              <div className="flex justify-between items-start">
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <button 
                                  onClick={() => markNotificationAsRead(notification.id)}
                                  className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                                >
                                  Mark read
                                </button>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                              </p>
                            </div>
                          ))}
                          <div className="px-4 py-2 border-t border-gray-200 text-center">
                            <Link 
                              to="#" 
                              className="text-sm font-medium text-blue-500 hover:text-blue-700"
                              onClick={() => setIsNotificationsOpen(false)}
                            >
                              View all notifications
                            </Link>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-sm font-medium text-gray-500">
                      {user?.email}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-3 py-1 text-sm text-white bg-primary-600 hover:bg-primary-700 rounded-md flex items-center"
                  >
                    <FiLogOut className="mr-1" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="-mr-2 flex items-center sm:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <FiX className="h-6 w-6" />
                ) : (
                  <FiMenu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} sm:hidden`}>
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  location.pathname === item.path
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  {item.icon}
                  <span className="ml-3">{item.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <main className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

export default EmployeeLayout;