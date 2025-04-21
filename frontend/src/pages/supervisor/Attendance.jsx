// src/pages/supervisor/Attendance.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';
import {
    FiCalendar,
    FiClock,
    FiFilter,
    FiChevronLeft,
    FiChevronRight,
    FiUser, // Keep FiUser for profile pics/initials
    FiCheck, // Might be used in future actions/modals
    FiX,     // Might be used in future actions/modals
    FiEdit,
    FiDownload,
    FiLoader, // Keep FiLoader
    FiAlertCircle // Keep FiAlertCircle
} from 'react-icons/fi';

const Attendance = () => {
    const [loading, setLoading] = useState(true);
    const [dailyAttendanceInfo, setDailyAttendanceInfo] = useState({
        records: [],
        missing: [],
        date: null
    });
    const [departments, setDepartments] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [summary, setSummary] = useState({
        total_employees: 0,
        present_count: 0,
        late_count: 0,
        absent_count: 0,
        on_leave_count: 0 // Data might still be fetched, just not displayed in this box
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [currentRecord, setCurrentRecord] = useState(null);
    const [error, setError] = useState('');

    const [filters, setFilters] = useState({ department: '' });
    const [editForm, setEditForm] = useState({ status: '', note: '' });
    const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchAllData = async () => {
            // setLoading(true); // Set loading at start is good
            setError('');
            const dateParam = format(currentDate, 'yyyy-MM-dd');
            try {
                // Fetch departments only once initially
                if (departments.length === 0 && isMounted) {
                    const deptResponse = await api.get('/admin/departments');
                    if (isMounted) setDepartments(deptResponse.data || []);
                }

                // Fetch daily attendance data
                if(isMounted){
                    const response = await api.get('/attendance/daily', {
                        params: { date: dateParam, department: filters.department }
                    });
                    if (isMounted) {
                        setDailyAttendanceInfo({
                            records: response.data.records || [],
                            missing: response.data.missing || [],
                            date: response.data.date
                        });
                        setSummary(response.data.summary || { total_employees: 0, present_count: 0, late_count: 0, absent_count: 0, on_leave_count: 0 });
                    }
                }
            } catch (err) {
                console.error('Error fetching attendance page data:', err);
                if (isMounted) setError(`Failed to load data: ${err.message}`);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        setLoading(true); // Set loading before fetch starts
        fetchAllData();

        return () => { isMounted = false; };
    }, [currentDate, filters.department]); // Rerun when date or department filter changes

    const handleFilterChange = (e) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const goToPreviousDay = () => { setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 1); return d; }); };
    const goToNextDay = () => { setCurrentDate(prev => { const todayStr = format(new Date(), 'yyyy-MM-dd'); if (format(prev, 'yyyy-MM-dd') < todayStr) { const d = new Date(prev); d.setDate(d.getDate() + 1); return d; } return prev; }); };
    const goToToday = () => { setCurrentDate(new Date()); };
    const handleEditRecord = (record) => { setCurrentRecord(record); setEditForm({ status: record.status, note: record.note || '' }); setShowEditModal(true); setError(''); };
    const handleFormChange = (e) => { setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleSubmitEdit = async (e) => {
        e.preventDefault();
        if (!currentRecord) return;
        setIsSubmittingEdit(true);
        setError('');
        try {
            await api.patch(`/attendance/${currentRecord.id}`, editForm);
            setDailyAttendanceInfo(prev => ({...prev, records: prev.records.map(r => r.id === currentRecord.id ? { ...r, ...editForm } : r)}));
            setShowEditModal(false);
            setCurrentRecord(null);
        } catch (err) {
            console.error('Error updating attendance record:', err);
            setError(err.response?.data?.message || 'Error updating record');
        } finally {
            setIsSubmittingEdit(false);
        }
    };

    const markEmployeeAbsent = async (employeeId) => {
        const employee = (dailyAttendanceInfo.missing || []).find(emp => emp.employee_id === employeeId);
        if (!employee || !confirm(`Mark ${employee.first_name} ${employee.last_name} as absent for ${format(currentDate, 'MMM d, yyyy')}?`)) return;
        setError('');
       try {
           const dateParam = format(currentDate, 'yyyy-MM-dd');
           await api.post('/attendance/mark-absent', { employee_id: employeeId, date: dateParam, note: 'Marked Absent by Supervisor' });
           fetchAttendanceData(); // Re-fetch after marking absent
       } catch (err) {
           console.error('Error marking absent:', err);
           setError(err.response?.data?.message || 'Error marking absent');
       }
   };

    const exportAttendanceData = () => { alert('Export functionality placeholder.'); };

    if (loading) {
        return <SupervisorLayout><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin h-12 w-12 text-primary-500" /></div></SupervisorLayout>;
    }

    return (
        <SupervisorLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
                <p className="text-gray-600">Track daily employee attendance</p>
            </div>

            {/* Error Display */}
            {error && (
                 <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded flex items-center justify-between">
                     <span>{error}</span>
                     <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                         <FiX size={18}/>
                     </button>
                 </div>
             )}

            {/* Date and filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Date Navigation */}
                    <div className="flex items-center justify-center md:justify-start space-x-2 md:space-x-4">
                        <button onClick={goToPreviousDay} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"> <FiChevronLeft className="h-5 w-5" /> </button>
                        <div className="text-center">
                            <h2 className="text-lg md:text-xl font-semibold text-gray-800"> {format(currentDate, 'EEEE, MMM d, yyyy')} </h2>
                            {format(currentDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
                                <button onClick={goToToday} className="mt-2 md:ml-1 px-3 py-1 text-sm text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500"> Go to Today </button>
                            )}
                        </div>
                         <button onClick={goToNextDay} disabled={format(currentDate, 'yyyy-MM-dd') >= format(new Date(), 'yyyy-MM-dd')} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500"> <FiChevronRight className="h-5 w-5" /> </button>
                    </div>
                    {/* Filters & Export */}
                    <div className="flex items-center justify-center md:justify-end space-x-3">
                      {/* Dept Filter */}
                        <div className="relative">
                           <select id="department" name="department" value={filters.department} onChange={handleFilterChange} className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-8 pr-8 text-sm shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500">
                              <option value="">All Departments</option>
                              {departments.map((dept) => (<option key={dept.id} value={dept.id}>{dept.name}</option>))}
                            </select>
                           <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none"> <FiFilter className="h-4 w-4 text-gray-400" /> </div>
                        </div>
                         {/* Export Button */}
                         <button onClick={exportAttendanceData} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"> <FiDownload className="-ml-1 mr-1.5 h-4 w-4" /> Export </button>
                    </div>
                </div>
            </div>

            {/* Attendance summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Summary</h3>
              
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"> {/* Use grid-cols-4 or sm:grid-cols-4 */}
                    <div className="bg-gray-50 p-7 rounded-lg border border-gray-100">
                        <p className="text-lg text-gray-600">Total Tracked</p> {/* Changed Label */}
                         {/* Calculate total from summary */}
                        <p className="text-2xl font-bold text-gray-800">
                            {(summary?.present_count || 0) + (summary?.late_count || 0) + (summary?.absent_count || 0) + (summary?.on_leave_count || 0)}
                             {/* If you want based on total_employees use summary?.total_employees */}
                         </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <p className="text-lg text-green-700">Present</p>
                        <p className="text-2xl font-bold text-green-600">{summary?.present_count || 0}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <p className="text-lg text-yellow-700">Late</p>
                        <p className="text-2xl font-bold text-yellow-600">{summary?.late_count || 0}</p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <p className="text-lg text-red-700">Absent</p>
                        <p className="text-2xl font-bold text-red-600">{summary?.absent_count || 0}</p>
                    </div>
                   
                </div>
            </div>

           {/* Attendances list */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
                 <div className="px-6 py-4 border-b border-gray-200">
                     <h3 className="text-lg font-semibold text-gray-800">Attendance Log</h3>
                 </div>
                 {(dailyAttendanceInfo.records || []).length === 0 ? (
                    <div className="px-6 py-10 text-center text-gray-500 italic"> No checked-in records found for this date. </div>
                  ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Employee </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Check In </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Check Out </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Status </th>
                                    <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Note </th>
                                    <th scope="col" className="relative px-4 sm:px-6 py-3"> <span className="sr-only">Edit</span> </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {(dailyAttendanceInfo.records || []).map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50">
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                {record.profile_image ? <img src={`${import.meta.env.VITE_APP_API_URL}${record.profile_image}`} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">{record.first_name?.charAt(0)}{record.last_name?.charAt(0)}</span>}
                                                <div className="ml-3">
                                                    <div className="text-sm font-medium text-gray-900">{record.first_name} {record.last_name}</div>
                                                    <div className="text-xs text-gray-500">{record.department_name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.check_in ? format(new Date(record.check_in), 'h:mm a') : '-'}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.check_out ? format(new Date(record.check_out), 'h:mm a') : '-'}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${ record.status === 'present' ? 'bg-green-100 text-green-800' : record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : record.status === 'absent' ? 'bg-red-100 text-red-800' : record.status === 'half-day' ? 'bg-orange-100 text-orange-800' : record.status === 'on-leave' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={record.note || ''}>{record.note || '-'}</td>
                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleEditRecord(record)} className="text-primary-600 hover:text-primary-800 p-1" title="Edit Record"> <FiEdit className="h-4 w-4" /> </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                   </div>
                )}
           </div>

           {/* Missing employees list */}
           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                 <div className="px-6 py-4 border-b border-gray-200">
                     <h3 className="text-lg font-semibold text-gray-800">Employees Not Logged / Absent</h3>
                 </div>
                 {(dailyAttendanceInfo.missing || []).length === 0 ? (
                     <div className="px-6 py-10 text-center text-gray-500 italic"> All active employees have an attendance record or are not marked missing. </div>
                   ) : (
                     <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Employee </th>
                                      <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Department </th>
                                      <th scope="col" className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"> Actions </th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                 {(dailyAttendanceInfo.missing || []).map((employee) => (
                                      <tr key={employee.employee_id} className="hover:bg-gray-50">
                                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                 {employee.profile_image ? <img src={`${import.meta.env.VITE_APP_API_URL}${employee.profile_image}`} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span H className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">{employee.first_name?.charAt(0)}{employee.last_name?.charAt(0)}</span>}
                                                 <div className="ml-3">
                                                     <div className="text-sm font-medium text-gray-900">{employee.first_name} {employee.last_name}</div>
                                                 </div>
                                             </div>
                                         </td>
                                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{employee.department_name}</td>
                                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                             <button onClick={() => markEmployeeAbsent(employee.employee_id)} className="text-red-600 hover:text-red-800 font-medium px-2 py-1 hover:bg-red-50 rounded"> Mark Absent </button>
                                         </td>
                                      </tr>
                                 ))}
                             </tbody>
                         </table>
                     </div>
                 )}
            </div>

            {/* Edit Attendance Modal */}
            {showEditModal && currentRecord && (
                <div className="fixed z-50 inset-0 overflow-y-auto"> {/* Increased z-index */}
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        {/* Background overlay */}
                         <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                             <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                         </div>
                         {/* Modal panel */}
                         <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">​</span>
                         <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                              <form onSubmit={handleSubmitEdit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                                             <FiEdit className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                             <h3 className="text-lg leading-6 font-medium text-gray-900"> Edit Attendance Record </h3>
                                            <div className="mt-2"> <p className="text-sm text-gray-500"> Update status/note for {currentRecord?.first_name} {currentRecord?.last_name}. </p> </div>
                                             {/* Error display within modal */}
                                              {error && (
                                                 <div className="mt-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-sm"> {error} </div>
                                             )}
                                             {/* Form Fields */}
                                             <div className="mt-4 space-y-4">
                                                 <div>
                                                     <label htmlFor="status" className="block text-sm font-medium text-gray-700"> Status </label>
                                                     <select id="status" name="status" value={editForm.status} onChange={handleFormChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                                                        <option value="present">Present</option> <option value="late">Late</option> <option value="absent">Absent</option> <option value="half-day">Half Day</option> <option value="on-leave">On Leave</option>
                                                      </select>
                                                 </div>
                                                 <div>
                                                     <label htmlFor="note" className="block text-sm font-medium text-gray-700"> Note </label>
                                                     <textarea id="note" name="note" rows="3" value={editForm.note} onChange={handleFormChange} className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" placeholder="Optional note"></textarea>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                     <button type="submit" disabled={isSubmittingEdit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"> {isSubmittingEdit ? 'Saving...' : 'Save'} </button>
                                     <button type="button" onClick={() => { setShowEditModal(false); setError(''); }} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"> Cancel </button>
                                 </div>
                              </form>
                          </div>
                     </div>
                 </div>
             )}
        </SupervisorLayout>
    );
};

export default Attendance;