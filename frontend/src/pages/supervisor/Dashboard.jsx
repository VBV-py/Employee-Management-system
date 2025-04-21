// src/pages/supervisor/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';
import {
    FiUsers, FiCalendar, FiClock, FiBriefcase, FiClipboard,
    FiUserCheck, FiUserX, FiUserPlus, FiLoader, FiAlertCircle
} from 'react-icons/fi';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const SupervisorDashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboardData, setDashboardData] = useState({ // Initialize with defaults
        attendance_summary: { total_employees: 0, checked_in: 0, present: 0, late: 0, absent: 0, on_leave: 0 },
        pending_leaves: [],
        on_leave_today: [],
        department_summary: [],
        recent_hires: [],
        project_summary: []
    });

    const pieChartRef = useRef(null); // Keep ref if needed later, but not strictly for legend toggle

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get('/dashboard/supervisor');
                if (response.data) {
                    setDashboardData({
                        attendance_summary: response.data.attendance_summary || { total_employees: 0, checked_in: 0, present: 0, late: 0, absent: 0, on_leave: 0 },
                        pending_leaves: response.data.pending_leaves || [],
                        on_leave_today: response.data.on_leave_today || [],
                        department_summary: response.data.department_summary || [],
                        recent_hires: response.data.recent_hires || [],
                        project_summary: response.data.project_summary || [],
                    });
                } else {
                    setError("Could not load dashboard data.");
                }
            } catch (err) {
                console.error('Error fetching supervisor dashboard data:', err);
                setError(`Failed to load dashboard data: ${err.message}.`);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    // Loading & Error JSX remains the same
    if (loading) {
        return <SupervisorLayout><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin h-12 w-12 text-primary-500" /></div></SupervisorLayout>;
    }
    if (error) {
        return <SupervisorLayout><div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3"><FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" /><p className="text-sm text-red-700">{error}</p></div></SupervisorLayout>;
    }

    // --- Data & Chart Preparation ---
    const attendanceSummary = dashboardData.attendance_summary || {};
    const onLeaveTodayList = dashboardData.on_leave_today || [];
    const departmentSummaryList = dashboardData.department_summary || [];
    const projectSummaryList = dashboardData.project_summary || [];
    const pendingLeavesList = dashboardData.pending_leaves || [];
    const recentHiresList = dashboardData.recent_hires || [];

    // Attendance Data Points (for displaying numbers below chart)
    const attendanceDataPoints = [
        { label: 'Present', value: attendanceSummary.present || 0, color: '#10B981', bgColor: 'bg-green-500' },
        { label: 'Late', value: attendanceSummary.late || 0, color: '#F59E0B', bgColor: 'bg-yellow-500' },
        { label: 'Absent', value: attendanceSummary.absent || 0, color: '#EF4444', bgColor: 'bg-red-500' },
        { label: 'On Leave', value: attendanceSummary.on_leave || 0, color: '#3B82F6', bgColor: 'bg-blue-500' },
    ];

    const attendanceChartData = {
        labels: attendanceDataPoints.map(p => p.label),
        datasets: [{
            data: attendanceDataPoints.map(p => p.value),
            backgroundColor: attendanceDataPoints.map(p => p.color),
            borderWidth: 1,
            borderColor: '#fff',
            hoverOffset: 8,
        }],
    };

    // --- ATTENDANCE CHART OPTIONS WITH WORKING LEGEND ---
    const attendanceChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right', // Legend position
                labels: {
                    padding: 15, // Padding around legend items
                    boxWidth: 12, // Size of the colored box
                   
                },
                // Standard Chart.js onClick handler to toggle visibility
                onClick: (e, legendItem, legend) => {
                    const index = legendItem.index;
                    const ci = legend.chart;
                    // Check if the methods exist (good practice)
                    if (ci.isDatasetVisible(0) && typeof ci.getDataVisibility === 'function') {
                        // Toggle the visibility of the data point at the clicked index
                        ci.toggleDataVisibility(index);
                    }
                    // Update the chart to reflect the changes
                    ci.update();
                }
            },
            tooltip: { // Tooltip remains the same
                 callbacks: {
                    label: function(context) {
                        let label = context.label || '';
                        if (label) label += ': ';
                        if (context.parsed !== null) label += context.parsed;
                         const total = context.dataset.data.reduce((acc, value) => acc + value, 0);
                         const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) + '%' : '0%';
                         label += ` (${percentage})`;
                        return label;
                    }
                }
            }
        }
    };

    // -- Department Chart Options --
    const departmentChartData = {
        labels: departmentSummaryList.map(d => d?.name ?? 'Unknown Dept'),
        datasets: [{
            label: 'Employees',
            data: departmentSummaryList.map(d => d?.employee_count || 0),
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderColor: 'rgba(37, 99, 235, 1)',
            borderWidth: 1, borderRadius: 4,
        }],
    };
    const departmentChartOptions = {
        responsive: true, maintainAspectRatio: false,
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        plugins: { legend: { display: false } }
    };

    // --- Render Dashboard ---
    return (
        <SupervisorLayout>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Supervisor Dashboard</h1>
                <p className="text-gray-600">Welcome back! Overview of your team and organization.</p>
            </div>

            {/* Summary Cards (Larger Padding restored) */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                 {[
                     { Icon: FiUsers, label: "Total Emp.", value: attendanceSummary.total_employees, color: "blue" },
                     { Icon: FiUserCheck, label: "Present", value: attendanceSummary.present, color: "green" },
                     { Icon: FiClock, label: "Late", value: attendanceSummary.late, color: "yellow" },
                     { Icon: FiUserX, label: "Absent/Leave", value: (attendanceSummary.absent || 0) + (attendanceSummary.on_leave || 0), color: "red" }
                 ].map((item, index) => (
                      // Added back p-6 for larger cards
                     <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                         <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{item.label}</p>
                                 {/* Adjusted text size for more impact */}
                                <p className="text-3xl font-semibold text-gray-800 mt-1">{item.value || 0}</p>
                             </div>
                             {/* Icon styling */}
                            <div className={`p-3 rounded-full bg-${item.color}-100 text-${item.color}-600`}>
                                 <item.Icon className="h-6 w-6" />
                            </div>
                         </div>
                     </div>
                 ))}
             </div>

            {/* Charts (Smaller Containers) */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
                {/* Attendance Chart & Separate Numbers */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6 flex flex-col">
                    <h2 className="text-lg font-semibold text-gray-800 mb-1">Today's Attendance</h2>
                    <p className="text-sm text-gray-500 ">{format(new Date(), 'MMMM d, yyyy')}</p>
                    {/* Chart Container (Smaller) */}
                    <div className="relative h-32 w-full mx-auto mb-1flex-grow"> {/* Reduced height again */}
                         <Pie ref={pieChartRef} data={attendanceChartData} options={attendanceChartOptions} />
                    </div>
                    {/* Numbers Displayed Below Chart */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 mt-4 border-t border-gray-100">
                         {attendanceDataPoints.map((item) => (
                            <div key={item.label} className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <span className={`w-3 h-3 rounded-full mr-2 ${item.bgColor}`}></span>
                                    <span className="text-gray-600">{item.label}</span>
                                </div>
                                <span className="font-medium text-gray-800">{item.value}</span>
                             </div>
                         ))}
                     </div>
                    {/* Link */}
                    <div className="mt-auto text-center pt-4">
                        <Link to="/supervisor/attendance" className="text-sm text-primary-600 hover:text-primary-700 font-medium"> View Details → </Link>
                    </div>
                </div>

                {/* Department Chart (Smaller Container) */}
                 <div className="lg:col-span-3 bg-white rounded-lg shadow-sm p-6">
                     <h2 className="text-lg font-semibold text-gray-800 mb-4">Employees by Department</h2>
                      {/* Chart Container (Smaller) */}
                     <div style={{ height: '220px' }}> {/* Reduced height */}
                         <Bar data={departmentChartData} options={departmentChartOptions} />
                     </div>
                     {/* Link */}
                     <div className="mt-4 text-center">
                          <Link to="/supervisor/settings" className="text-sm text-primary-600 hover:text-primary-700 font-medium"> Manage Departments → </Link>
                    </div>
                 </div>
            </div>

            {/* Leave & Employee Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Pending Leaves */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Pending Leave Requests</h2>
                        <Link to="/supervisor/leaves" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all ({pendingLeavesList.length})</Link>
                    </div>
                    {pendingLeavesList.length === 0 ? (
                         <p className="text-gray-500 text-center py-6 italic">No pending requests.</p>
                     ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                             {pendingLeavesList.slice(0, 4).map((leave) => (
                                 <div key={leave.id} className="flex items-center p-3 bg-gray-50 rounded border border-gray-200 gap-3">
                                      {/* Profile Pic/Initial */}
                                     {leave.profile_image ? <img src={`${import.meta.env.VITE_APP_API_URL}${leave.profile_image}`} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" /> : <span className="flex-shrink-0 h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">{leave.first_name?.charAt(0)}{leave.last_name?.charAt(0)}</span>}
                                      <div className="flex-grow">
                                          <p className="font-medium text-sm">{leave.first_name} {leave.last_name}</p>
                                          <div className="text-xs text-gray-600">
                                              <span className="font-semibold">{leave.leave_type}</span> • {format(new Date(leave.start_date), 'MMM d')} - {format(new Date(leave.end_date), 'MMM d')} ({leave.total_days}d)
                                          </div>
                                      </div>
                                  </div>                             ))}
                         </div>
                     )}
                 </div>


                {/* On Leave Today */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                     <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold text-gray-800">On Leave Today</h2>
                     </div>
                     {onLeaveTodayList.length === 0 ? (
                          <p className="text-gray-500 text-center py-6 italic">No employees have approved leave for today.</p>
                     ) : (
                         <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                             {onLeaveTodayList.map((employee) => (
                                 <div key={employee.id} className="flex items-center p-3 bg-blue-50 rounded border border-blue-200 gap-3">
                                     {employee.profile_image ? <img src={`${import.meta.env.VITE_APP_API_URL}${employee.profile_image}`} alt={`${employee.first_name} ${employee.last_name}`} className="h-8 w-8 rounded-full object-cover flex-shrink-0" /> : <span className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-200 flex items-center justify-center text-xs font-medium text-blue-700">{employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}</span>}
                                     <div className="flex-grow">
                                         {/* ** Display employee details, link to profile ** */}
                                         <Link to={`/supervisor/employees/${employee.id}`} className="font-medium text-sm hover:text-primary-700">
                                             {employee.first_name} {employee.last_name}
                                         </Link>
                                         <p className="text-xs text-blue-700">{employee.leave_type}</p>
                                          {/* ** Do NOT display leave request details here ** */}
                                     </div>
                                 </div>                             ))}
                         </div>
                     )}
                 </div>
             </div>

           {/* Recent hires and Project summary */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Recent Hires */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                     <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold text-gray-800">Recent Hires</h2>
                         <Link to="/supervisor/employees" className="text-sm text-primary-600 hover:text-primary-700 font-medium">View all →</Link>
                     </div>
                     {recentHiresList.length === 0 ? (
                          <p className="text-gray-500 text-center py-6 italic">No recent hires found.</p>
                      ) : (
                         <div className="space-y-3">
                             {recentHiresList.map((employee) => (
                                 <div key={employee.id} className="flex items-center py-3 border-b border-gray-100 last:border-0 gap-3">
                                     {employee.profile_image ? <img src={`${import.meta.env.VITE_APP_API_URL}${employee.profile_image}`} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" /> : <span className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">{employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}</span>}
                                     <div className="flex-grow">
                                         <p className="font-medium text-sm">{employee.first_name} {employee.last_name}</p>
                                         <p className="text-xs text-gray-500">{employee.designation} • {employee.department}</p>
                                     </div>
                                     <div className="text-right text-xs text-gray-500">
                                         Joined: {format(new Date(employee.hire_date), 'MMM d, yyyy')}
                                     </div>
                                 </div>                             ))}
                         </div>
                     )}
                 </div>
                {/* Project Summary */}
                 <div className="bg-white rounded-lg shadow-sm p-6">
                     <div className="flex justify-between items-center mb-4">
                         <h2 className="text-lg font-semibold text-gray-800">Project Summary</h2>
                         <Link to="/supervisor/projects" className="text-sm text-primary-600 hover:text-primary-700 font-medium">Manage projects →</Link>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                          {projectSummaryList.length === 0 ? (
                               <p className="text-gray-500 text-center py-4 col-span-2 italic">No project data available.</p>
                           ) : (
                             projectSummaryList.map((project, index) => (
                                 <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                     <div className={`w-3 h-3 rounded-full mb-2 ${
                                         project.status === 'completed' ? 'bg-green-500' :
                                         project.status === 'in-progress' ? 'bg-blue-500' :
                                         project.status === 'planning' ? 'bg-purple-500' :
                                         project.status === 'on-hold' ? 'bg-yellow-500' : 'bg-gray-500'
                                     }`}></div>
                                      <p className="text-2xl font-semibold text-gray-800">{project.count}</p>
                                     <p className="text-sm text-gray-600 capitalize">{project.status.replace('-', ' ')}</p>
                                 </div>
                             ))
                          )}
                    </div>
                </div>
            </div>

        </SupervisorLayout>
    );
};

export default SupervisorDashboard;