// src/pages/employee/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmployeeLayout from '../../components/layouts/EmployeeLayout.jsx';
import api from '../../services/api.js';
import { format, formatDistanceToNowStrict } from 'date-fns';
import {
    FiClock, FiCalendar, FiClipboard, FiBriefcase, FiLoader,
    FiLogIn, FiLogOut, FiBell, FiGift, FiX 
} from 'react-icons/fi';

const EmployeeDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        today_attendance: { status: 'loading', checked_in: false },
        leave_balances: [],
        upcoming_leaves: [],
        projects: [],
        notifications: [],
        birthdays: [],
    });
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [error, setError] = useState('');


    // Fetch all dashboard data
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const [dashboardResponse, attendanceResponse] = await Promise.all([
                    api.get('/dashboard/employee'),
                    api.get('/attendance/today') // Separate call for today's status
                ]);

                console.log("Dashboard API Response:", dashboardResponse.data);
                console.log("Today Attendance API Response:", attendanceResponse.data);

                setDashboardData({
                    today_attendance: attendanceResponse.data || { status: 'not-checked-in', checked_in: false },
                    leave_balances: dashboardResponse.data.leave_balances || [],
                    upcoming_leaves: dashboardResponse.data.upcoming_leaves || [],
                    projects: dashboardResponse.data.projects || [],
                    notifications: dashboardResponse.data.notifications || [],
                    birthdays: dashboardResponse.data.birthdays || [],
                });
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Could not load dashboard data. Please try again later.');
                setDashboardData({
                    today_attendance: { status: 'error', checked_in: false }, leave_balances: [], upcoming_leaves: [], projects: [], notifications: [], birthdays: [],
               });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []); // Fetch only on mount

    // Handlers for check-in/out
    const handleCheckIn = async () => {
        setCheckingIn(true);
        setError('');
        try {
            await api.post('/attendance/check-in');
            const attendanceResponse = await api.get('/attendance/today');
            setDashboardData(prev => ({ ...prev, today_attendance: attendanceResponse.data || { status: 'not-checked-in', checked_in: false } }));
        } catch (err) { console.error('Error checking in:', err); setError(err.response?.data?.message || 'Check-in failed.');
        } finally { setCheckingIn(false); }
    };
    const handleCheckOut = async () => {
        setCheckingOut(true);
        setError('');
        try {
            await api.post('/attendance/check-out');
            const attendanceResponse = await api.get('/attendance/today');
            setDashboardData(prev => ({ ...prev, today_attendance: attendanceResponse.data || { status: 'not-checked-in', checked_in: false } }));
        } catch (err) { console.error('Error checking out:', err); setError(err.response?.data?.message || 'Check-out failed.');
        } finally { setCheckingOut(false); }
    };

    // --- CORRECTED Badge Helper ---
    // Helper to render attendance status badge
    const renderAttendanceStatusBadge = (status) => {
        let colorClasses = 'bg-gray-100 text-gray-800';
        let text = 'Not Checked In';

        switch (status) {
            case 'present': colorClasses = 'bg-green-100 text-green-800'; text = 'Present'; break;
            case 'late': colorClasses = 'bg-yellow-100 text-yellow-800'; text = 'Late'; break;
            case 'on-leave': colorClasses = 'bg-blue-100 text-blue-800'; text = 'On Leave'; break; // Will be shown if status is on-leave
            case 'absent': colorClasses = 'bg-red-100 text-red-800'; text = 'Absent'; break;
            case 'half-day': colorClasses = 'bg-orange-100 text-orange-800'; text = 'Half Day'; break;
            case 'error': colorClasses = 'bg-red-100 text-red-800'; text = 'Error'; break;
           

            default:
                
                 const currentAttendanceState = dashboardData.today_attendance;
                 if (currentAttendanceState?.checked_in && !currentAttendanceState?.check_out) {
                  
                    colorClasses = 'bg-green-100 text-green-800'; text = 'Checked In';
                 }
                 // Otherwise, it remains 'Not Checked In'
                 break;
        }
        return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>{text}</span>;
    };
 

    // --- Loading State ---
    if (loading) {
        return ( <EmployeeLayout> <div className="flex justify-center items-center h-64"> <FiLoader className="animate-spin h-12 w-12 text-primary-500" /> </div> </EmployeeLayout> );
    }

    // --- Error State ---
     if (error) {
        return (
             <EmployeeLayout>
                  <div className="mb-6"><h1 className="text-2xl font-bold text-gray-800">Dashboard</h1></div>
                 <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                     <div className="flex">
                          <div className="flex-shrink-0"><FiX className="h-5 w-5 text-red-400" /></div>
                          <div className="ml-3"><p className="text-sm text-red-700">{error}</p></div>
                      </div>
                  </div>
         
              </EmployeeLayout>
         );
     }

    // --- Main Render ---
    const todayAttendance = dashboardData.today_attendance; // Alias

    return (
        <EmployeeLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600">Welcome back! Here's an overview.</p>
            </div>

            {/* --- CORRECTED Attendance Card --- */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Today's Attendance</h2>
                    <span className="text-gray-600">{format(new Date(), 'EEEE, MMMM d, yyyy')}</span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Left side: Controls or Status */}
                    <div className="flex-grow">
                        {todayAttendance.status === 'on-leave' ? (
                            <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-md">
                                <div className="rounded-full p-2 bg-blue-100 text-blue-600"><FiCalendar className="h-5 w-5" /></div>
                                <div>
                                    <p className="font-medium text-blue-800">On Leave Today</p>
                                    {todayAttendance.note && (<p className="text-sm text-blue-700">{todayAttendance.note}</p>)}
                                </div>
                            </div>
                        ) : todayAttendance.checked_in ? (
                            <div className="flex items-center space-x-4 md:space-x-6">
                                {/* Check-in time */}
                                <div className="flex items-center">
                                    <div className="rounded-full p-2 bg-green-100 text-green-600 mr-2"><FiClock className="h-5 w-5" /></div>
                                    <div>
                                        <p className="font-medium text-sm">Checked In</p>
                                        <p className="text-gray-700 font-semibold">{todayAttendance.check_in ? format(new Date(todayAttendance.check_in), 'p') : 'N/A'}</p>
                                    </div>
                                </div>
                                {/* Check-out time or button */}
                                <div className="flex items-center">
                                    {todayAttendance.check_out ? (
                                        <>
                                            <div className="rounded-full p-2 bg-red-100 text-red-600 mr-2"><FiLogOut className="h-5 w-5" /></div>
                                            <div>
                                                <p className="font-medium text-sm">Checked Out</p>
                                                <p className="text-gray-700 font-semibold">{format(new Date(todayAttendance.check_out), 'p')}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <button onClick={handleCheckOut} disabled={checkingOut} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                            {checkingOut ? (<FiLoader className="animate-spin h-4 w-4 mr-2"/>) : <FiLogOut className="h-4 w-4 mr-2"/>}
                                            {checkingOut ? 'Processing...' : 'Check Out'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <button onClick={handleCheckIn} disabled={checkingIn} className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                                    {checkingIn ? (<FiLoader className="animate-spin h-4 w-4 mr-2"/>) : <FiLogIn className="h-4 w-4 mr-2"/>}
                                    {checkingIn ? 'Processing...' : 'Check In'}
                                </button>
                                <span className="text-gray-600 text-sm">You haven't checked in today.</span>
                            </div>
                        )}
                    </div>
                    {/* Right side: Status Badge */}
                    <div className="flex-shrink-0 text-left md:text-right mt-2 md:mt-0">
                         <p className="text-sm text-gray-600 mb-1">Status</p>
                         {/* Call badge function with ONLY the status */}
                         {renderAttendanceStatusBadge(todayAttendance.status)}
                     </div>
                 </div>
            </div>

            {/* Leave Balance & Projects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* --- CORRECTED Leave Balance Card --- */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold text-gray-800 flex items-center"><FiCalendar className="mr-2" /> Leave Balance</h2>
                         <Link to="/employee/leave" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Manage Leave →</Link>
                     </div>
                    {!dashboardData.leave_balances || dashboardData.leave_balances.length === 0 ? (
                         <p className="text-gray-600">No balance info available.</p>
                     ) : (
                         <div className="space-y-4">
                            {dashboardData.leave_balances.map((balance, index) => {
                                 const remaining = balance.available_days ?? (balance.total_days || 0) - (balance.used_days || 0);
                                 const usedPercent = balance.total_days > 0 ? ((balance.used_days || 0) / balance.total_days) * 100 : 0;
                                 let barColor = 'bg-red-500';
                                 if (balance.total_days > 0) {
                                     const availablePercent = remaining / balance.total_days;
                                     if (availablePercent > 0.6) barColor = 'bg-green-500';
                                     else if (availablePercent > 0.3) barColor = 'bg-yellow-500';
                                 }
                                 return (
                                     <div key={balance.name || index} className="flex justify-between items-center">
                                         <div>
                                             <p className="font-medium text-sm">{balance.name || 'Unknown Type'}</p> {/* Use balance.name */}
                                             <p className="text-xs text-gray-600">{balance.used_days || 0} used of {balance.total_days || 0} days</p>
                                          </div>
                                         <div className="flex items-center space-x-2 w-1/2">
                                              <div className="w-full bg-gray-200 rounded-full h-1.5"><div className={`h-1.5 rounded-full ${barColor}`} style={{ width: `${usedPercent}%` }}></div></div>
                                              <span className="font-semibold text-gray-700 text-sm">{remaining}</span>
                                          </div>
                                      </div>
                                 );
                             })}
                         </div>
                     )}
                     {/* Upcoming Leaves Sub-section */}
                     {dashboardData.upcoming_leaves && dashboardData.upcoming_leaves.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                             <p className="font-medium text-sm text-gray-600 mb-2">Upcoming Leaves</p>
                             {dashboardData.upcoming_leaves.map((leave, idx) => (
                                 <div key={idx} className="mb-2 text-sm">
                                     <div className="flex items-center">
                                         <span className={`w-2 h-2 rounded-full mr-2 ${leave.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                                         <span className="font-medium">{leave.leave_type || 'Unknown'}</span>
                                         <span className="ml-2 text-gray-600">{format(new Date(leave.start_date), 'MMM d')}{leave.start_date !== leave.end_date && ` - ${format(new Date(leave.end_date), 'MMM d')}`}</span>
                                         <span className={`ml-auto px-2 py-0.5 text-xs rounded ${leave.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{leave.status}</span>
                                     </div>
                                 </div>
                             ))}
                          </div>
                      )}
                </div>

                {/* Projects Card */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                     <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold text-gray-800 flex items-center"><FiBriefcase className="mr-2" /> Active Projects</h2>
                         <Link to="/employee/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View All →</Link>
                     </div>
                     {!dashboardData.projects || dashboardData.projects.length === 0 ? (
                         <p className="text-gray-600">No active projects assigned.</p>
                     ) : (
                         <div className="space-y-3">
                             {dashboardData.projects.map((project) => (
                                <div key={project.id} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                                     <div className="flex justify-between items-start">
                                          <div> <p className="font-medium">{project.name}</p> <p className="text-sm text-gray-600">Role: {project.role || 'N/A'}</p> </div>
                                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${ project.status === 'completed' ? 'bg-green-100 text-green-800' : project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : project.status === 'planning' ? 'bg-purple-100 text-purple-800' : project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'}`}>{project.status || 'Unknown'}</span>
                                      </div>
                                  </div>
                              ))}
                         </div>
                     )}
                </div>
            </div>

            {/* Notifications and Birthdays */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Notifications Card */}
                 <div className="bg-white rounded-lg shadow-sm p-6">
                     <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold text-gray-800 flex items-center"><FiBell className="mr-2" /> Recent Notifications</h2>
                         {/* Optional: Link to all notifications */}
                     </div>
                     {!dashboardData.notifications || dashboardData.notifications.length === 0 ? (
                         <p className="text-gray-600">No recent notifications.</p>
                     ) : (
                         <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                             {dashboardData.notifications.map((notification) => (
                                 <div key={notification.id} className={`p-3 rounded ${notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border-l-4 border-blue-300'}`}>
                                     <p className="font-medium text-sm">{notification.title}</p>
                                     <p className="text-sm text-gray-700 mt-1">{notification.message}</p>
                                     <p className="text-xs text-gray-400 mt-1.5">{formatDistanceToNowStrict(new Date(notification.created_at), { addSuffix: true })}</p>
                                 </div>
                             ))}
                         </div>
                     )}
                 </div>

                 {/* Birthdays Card */}
                 <div className="bg-white rounded-lg shadow-sm p-6">
                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center"><FiGift className="mr-2" /> Upcoming Birthdays</h2>
                     {!dashboardData.birthdays || dashboardData.birthdays.length === 0 ? (
                         <p className="text-gray-600">No upcoming birthdays in your department.</p>
                     ) : (
                         <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                             {dashboardData.birthdays.map((employee) => (
                                 <div key={employee.id} className="flex items-center">
                                      {employee.profile_image ? (
                                         <img src={`${import.meta.env.VITE_APP_API_URL}${employee.profile_image}`} alt={`${employee.first_name}`} className="w-10 h-10 rounded-full object-cover"/>
                                      ) : (
                                         <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                                             {employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}
                                         </div>
                                      )}
                                     <div className="ml-3">
                                         <p className="font-medium text-sm">{employee.first_name} {employee.last_name}</p>
                                         <p className="text-sm text-gray-600">{format(new Date(employee.birth_date), 'MMMM d')}</p>
                                     </div>
                                 </div>
                              ))}
                          </div>
                     )}
                 </div>
             </div>

        </EmployeeLayout> 
    );
};

export default EmployeeDashboard;