// src/pages/supervisor/Leaves.jsx
import React, { useState, useEffect } from 'react';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { format, parseISO, differenceInBusinessDays } from 'date-fns';
import { 
  FiCalendar, 
  FiUser, 
  FiClock, 
  FiFilter, 
  FiCheck, 
  FiX,
  FiInfo,
  FiMessageCircle,
  FiSearch
} from 'react-icons/fi';

const Leaves = () => {
  const [loading, setLoading] = useState(true);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [approvedLeaves, setApprovedLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [calendarView, setCalendarView] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Leave detail modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [comment, setComment] = useState('');

  // Filters
  const [filters, setFilters] = useState({
    status: 'pending',
    department: '',
    leave_type: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    const fetchDepartmentsAndTypes = async () => {
      try {
        const [deptResponse, typesResponse] = await Promise.all([
          api.get('/admin/departments'),
          api.get('/leaves/types')
        ]);
        setDepartments(deptResponse.data);
        setLeaveTypes(typesResponse.data);
      } catch (error) {
        console.error('Error fetching departments and leave types:', error);
      }
    };
    
    fetchDepartmentsAndTypes();
    fetchLeaves();
  }, [filters.status, filters.department, filters.leave_type, filters.month, filters.year]);
  
  const fetchLeaves = async () => {
    setLoading(true);
    try {
      if (filters.status === 'pending') {
        const response = await api.get('/leaves/pending', {
          params: { department: filters.department, leave_type: filters.leave_type }
        });
        setPendingLeaves(response.data);
      } else {
        const response = await api.get('/leaves/calendar', {
          params: { 
            department: filters.department,
            year: filters.year,
            month: filters.month
          }
        });
        setApprovedLeaves(response.data);
      }
    } catch (error) {
      console.error('Error fetching leave data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const processLeaveRequest = async (id, status) => {
    if (status === 'rejected' && !comment.trim()) {
      alert('Please provide a comment explaining why the leave is rejected.');
      return;
    }
    
    setProcessing(true);
    try {
      await api.patch(`/leaves/${id}/process`, {
        status,
        comment: comment.trim() || (status === 'approved' ? 'Approved by supervisor' : '')
      });
      
      // Remove from pending leaves list
      setPendingLeaves(pendingLeaves.filter(leave => leave.id !== id));
      
      setShowDetailModal(false);
      setComment('');
      setSelectedLeave(null);
    } catch (error) {
      console.error('Error processing leave request:', error);
      alert(error.response?.data?.message || 'Error processing leave request');
    } finally {
      setProcessing(false);
    }
  };
  
  const openLeaveDetail = (leave) => {
    setSelectedLeave(leave);
    setComment('');
    setShowDetailModal(true);
  };

  const getLeaveTypeColor = (leaveType) => {
    // Assign colors to different leave types
    const typeColors = {
      'Annual Leave': 'bg-green-100 text-green-800',
      'Sick Leave': 'bg-red-100 text-red-800',
      'Personal Leave': 'bg-yellow-100 text-yellow-800',
      'Maternity Leave': 'bg-pink-100 text-pink-800',
      'Paternity Leave': 'bg-blue-100 text-blue-800'
    };
    
    return typeColors[leaveType] || 'bg-gray-100 text-gray-800';
  };
  
  const getMonthText = (monthNum) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[monthNum - 1];
  };
  
  if (loading) {
    return (
      <SupervisorLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </SupervisorLayout>
    );
  }
  
  return (
    <SupervisorLayout>
      <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-gray-600">Review and manage employee leave requests</p>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              View
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="pending">Pending Requests</option>
              <option value="approved">Leave Calendar</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={filters.department}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>
          
          {filters.status === 'pending' && (
            <div>
              <label htmlFor="leave_type" className="block text-sm font-medium text-gray-700 mb-1">
                Leave Type
              </label>
              <select
                id="leave_type"
                name="leave_type"
                value={filters.leave_type}
                onChange={handleFilterChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">All Types</option>
                {leaveTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          )}
          
          {filters.status === 'approved' && (
            <>
              <div>
                <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  id="month"
                  name="month"
                  value={filters.month}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i+1} value={i+1}>{getMonthText(i+1)}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={filters.year}
                  onChange={handleFilterChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
              
              <div>
                <button
                  onClick={() => setCalendarView(!calendarView)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {calendarView ? 'List View' : 'Calendar View'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Pending Leave Requests */}
      {filters.status === 'pending' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Pending Leave Requests
              {pendingLeaves.length > 0 && (
                <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {pendingLeaves.length}
                </span>
              )}
            </h3>
          </div>
          
          {pendingLeaves.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FiCalendar className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No pending leave requests</h3>
              <p className="mt-1 text-sm text-gray-500">There are no pending leave requests to review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {leave.profile_image ? (
                            <img 
                              src={`${import.meta.env.VITE_APP_API_URL}${leave.profile_image}`} 
                              alt={`${leave.first_name} ${leave.last_name}`}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-xs text-primary-600 font-medium">
                                {leave.first_name.charAt(0)}{leave.last_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {leave.first_name} {leave.last_name}
                            </div>
                            <div className="text-xs text-gray-500">{leave.department}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                          {leave.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(leave.start_date), 'MMM d, yyyy')}
                          {leave.start_date !== leave.end_date && 
                            ` - ${format(new Date(leave.end_date), 'MMM d, yyyy')}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.total_days}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {format(new Date(leave.created_at), 'MMM d, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => openLeaveDetail(leave)}
                            className="text-primary-600 hover:text-primary-900"
                            title="View Details"
                          >
                            <FiInfo className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => processLeaveRequest(leave.id, 'approved')}
                            className="text-green-600 hover:text-green-900"
                            title="Approve"
                          >
                            <FiCheck className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => openLeaveDetail(leave)}
                            className="text-red-600 hover:text-red-900"
                            title="Reject"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Leave Calendar/List */}
      {filters.status === 'approved' && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              {`Approved Leaves - ${getMonthText(filters.month)} ${filters.year}`}
            </h3>
          </div>
          
          {approvedLeaves.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <FiCalendar className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">No approved leaves</h3>
              <p className="mt-1 text-sm text-gray-500">There are no approved leaves for the selected period.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Days
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {approvedLeaves.map((leave) => (
                    <tr key={leave.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {leave.profile_image ? (
                            <img 
                              src={`${import.meta.env.VITE_APP_API_URL}${leave.profile_image}`} 
                              alt={`${leave.first_name} ${leave.last_name}`}
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-xs text-primary-600 font-medium">
                                {leave.first_name.charAt(0)}{leave.last_name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {leave.first_name} {leave.last_name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLeaveTypeColor(leave.leave_type)}`}>
                          {leave.leave_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(leave.start_date), 'MMM d, yyyy')}
                          {leave.start_date !== leave.end_date && 
                            ` - ${format(new Date(leave.end_date), 'MMM d, yyyy')}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.total_days}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{leave.department}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      
      {/* Leave Detail Modal */}
      {showDetailModal && selectedLeave && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div>
                  <div className="mt-3 sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                      Leave Request Details
                    </h3>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <div className="flex items-center mb-3">
                        {selectedLeave.profile_image ? (
                          <img 
                            src={`${import.meta.env.VITE_APP_API_URL}${selectedLeave.profile_image}`} 
                            alt={`${selectedLeave.first_name} ${selectedLeave.last_name}`}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-sm text-primary-600 font-medium">
                              {selectedLeave.first_name.charAt(0)}{selectedLeave.last_name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {selectedLeave.first_name} {selectedLeave.last_name}
                          </div>
                          <div className="text-xs text-gray-500">{selectedLeave.department}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Leave Type</p>
                          <p className="text-sm font-medium text-gray-900">{selectedLeave.leave_type}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Total Days</p>
                          <p className="text-sm font-medium text-gray-900">{selectedLeave.total_days}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Start Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(selectedLeave.start_date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">End Date</p>
                          <p className="text-sm font-medium text-gray-900">
                            {format(new Date(selectedLeave.end_date), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Reason</p>
                        <p className="text-sm text-gray-900 mt-1 bg-white p-2 rounded border border-gray-200">
                          {selectedLeave.reason || 'No reason provided.'}
                        </p>
                      </div>
                      
                      <div className="mt-3">
                        <p className="text-xs text-gray-500">Applied On</p>
                        <p className="text-sm font-medium text-gray-900">
                          {format(new Date(selectedLeave.created_at), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Comment field (for rejection) */}
                    <div className="mb-4">
                      <label htmlFor="comment" className=" block text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <FiMessageCircle className="mr-1" />
                        Comment (required for rejection)
                      </label>
                      <textarea
                        id="comment"
                        name="comment"
                        rows="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Add a comment (required for rejection)"
                      ></textarea>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => processLeaveRequest(selectedLeave.id, 'approved')}
                  disabled={processing}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processing ? 'Processing...' : 'Approve'}
                </button>
                <button
                  type="button"
                  onClick={() => processLeaveRequest(selectedLeave.id, 'rejected')}
                  disabled={processing}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  {processing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </SupervisorLayout>
  );
};

export default Leaves;