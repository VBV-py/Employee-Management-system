// src/pages/employee/Leave.jsx
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout.jsx';
import api from '../../services/api.js';
import { format, differenceInCalendarDays, addDays } from 'date-fns';
import { FiFileText, FiCalendar, FiCheck, FiX, FiClock } from 'react-icons/fi';

const Leave = () => {
  const [loading, setLoading] = useState(true);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [leaveBalances, setLeaveBalances] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newLeaveRequest, setNewLeaveRequest] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });
  
  useEffect(() => {
    const fetchLeaveData = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId') || 'me';
        
        const [leavesResponse, typesResponse] = await Promise.all([
          api.get(`/employees/${userId}/leaves`),
          api.get('/leaves/types')
        ]);
        
        setLeaveRequests(leavesResponse.data.requests || []);
        setLeaveBalances(leavesResponse.data.balances || []);
        setLeaveTypes(typesResponse.data || []);
        
        if (typesResponse.data && typesResponse.data.length > 0) {
          setNewLeaveRequest(prev => ({
            ...prev,
            leave_type_id: typesResponse.data[0].id
          }));
        }
      } catch (error) {
        console.error('Error fetching leave data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLeaveData();
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewLeaveRequest(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const calculateTotalDays = () => {
    if (!newLeaveRequest.start_date || !newLeaveRequest.end_date) return 0;
    
    const start = new Date(newLeaveRequest.start_date);
    const end = new Date(newLeaveRequest.end_date);
    
    if (start > end) return 0;
    
    return differenceInCalendarDays(end, start) + 1;
  };
  
  const getLeaveBalance = () => {
    if (!newLeaveRequest.leave_type_id) return null;
    
    const balance = leaveBalances.find(
      balance => balance.leave_type_id === parseInt(newLeaveRequest.leave_type_id)
    );
    
    return balance ? balance.remaining_days : 0;
  };
  
  const getLeaveName = (typeId) => {
    const leaveType = leaveTypes.find(type => type.id === typeId);
    return leaveType ? leaveType.name : 'Unknown';
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post('/leaves', newLeaveRequest);
      
      // Refresh the leave data
      const userId = localStorage.getItem('userId') || 'me';
      const response = await api.get(`/employees/${userId}/leaves`);
      
      setLeaveRequests(response.data.requests || []);
      setLeaveBalances(response.data.balances || []);
      
      // Reset form
      setNewLeaveRequest({
        leave_type_id: leaveTypes.length > 0 ? leaveTypes[0].id : '',
        start_date: '',
        end_date: '',
        reason: ''
      });
      
      setShowApplyForm(false);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      alert(error.response?.data?.message || 'Error submitting leave request');
    } finally {
      setSubmitting(false);
    }
  };
  
  const cancelLeaveRequest = async (id) => {
    try {
      await api.patch(`/leaves/${id}/cancel`);
      
      // Refresh the leave data
      const userId = localStorage.getItem('userId') || 'me';
      const response = await api.get(`/employees/${userId}/leaves`);
      
      setLeaveRequests(response.data.requests || []);
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      alert(error.response?.data?.message || 'Error cancelling leave request');
    }
  };
  
  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      </EmployeeLayout>
    );
  }
  
  return (
    <EmployeeLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-gray-600">Apply for and manage your leave requests</p>
      </div>
      
      {/* Leave balance */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiCalendar className="mr-2" /> Leave Balance
          </h3>
          <button 
            onClick={() => setShowApplyForm(!showApplyForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          >
            {showApplyForm ? 'Cancel' : 'Apply for Leave'}
          </button>
        </div>
        
        {leaveBalances.length === 0 ? (
          <p className="text-gray-600">No leave balance information available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {leaveBalances.map((balance) => (
              <div key={balance.id} className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium">{balance.leave_type}</p>
                <div className="flex items-end mt-2">
                  <p className="text-2xl font-bold text-primary-600">{balance.remaining_days}</p>
                  <p className="ml-1 text-gray-600">/ {balance.total_days}</p>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {balance.used_days} days used
                </p>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                  <div 
                    className={`h-2 rounded-full ${
                      (balance.remaining_days / balance.total_days) > 0.6
                        ? 'bg-green-500'
                        : (balance.remaining_days / balance.total_days) > 0.3
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${(balance.used_days / balance.total_days) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Apply for leave form */}
      {showApplyForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-primary-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Apply for Leave</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="leave_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Leave Type
                </label>
                <select
                  id="leave_type_id"
                  name="leave_type_id"
                  value={newLeaveRequest.leave_type_id}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                >
                  {leaveTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} (Balance: {
                        leaveBalances.find(balance => balance.leave_type_id === type.id)?.remaining_days || 0
                      } days)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={newLeaveRequest.start_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={newLeaveRequest.end_date}
                  onChange={handleInputChange}
                  min={newLeaveRequest.start_date || new Date().toISOString().split('T')[0]}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                />
              </div>
              
              <div className="flex items-end">
                <div className="bg-blue-50 p-3 rounded-lg w-full">
                  <p className="text-sm text-gray-600">Total Days</p>
                  <p className="text-lg font-semibold text-blue-700">{calculateTotalDays()}</p>
                  <div className="mt-1 text-xs text-gray-500">
                    Available Balance: <span className="font-medium">{getLeaveBalance()}</span>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  id="reason"
                  name="reason"
                  rows="3"
                  value={newLeaveRequest.reason}
                  onChange={handleInputChange}
                  required
                  className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  placeholder="Please provide a reason for your leave request"
                ></textarea>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                type="submit"
                disabled={submitting || calculateTotalDays() === 0 || calculateTotalDays() > getLeaveBalance()}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Leave requests history */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiFileText className="mr-2" /> Leave History
          </h3>
        </div>
        
        {leaveRequests.length === 0 ? (
          <div className="p-6 text-center text-gray-600">
            No leave requests found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
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
                {leaveRequests.map((request) => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.leave_type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(request.start_date), 'MMM d, yyyy')}
                        {request.start_date !== request.end_date && 
                          ` - ${format(new Date(request.end_date), 'MMM d, yyyy')}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.total_days}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        request.status === 'approved' ? 'bg-green-100 text-green-800' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {format(new Date(request.created_at), 'MMM d, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {request.status === 'pending' && (
                        <button 
                          onClick={() => cancelLeaveRequest(request.id)}
                          className="text-red-600 hover:text-red-800 flex items-center justify-end ml-auto"
                        >
                          <FiX className="mr-1" /> Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default Leave;