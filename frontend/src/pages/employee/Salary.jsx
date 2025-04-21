// src/pages/employee/Salary.jsx
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';
import { FiDollarSign, FiCalendar, FiAlertCircle, FiLoader,FiX } from 'react-icons/fi';

const formatCurrency = (amount) => {
    if (amount == null || isNaN(amount)) return '-';
    return parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'INR' }); // Adjust locale/currency
};

const SalaryPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentSalary, setCurrentSalary] = useState(null);
    const [salaryHistory, setSalaryHistory] = useState([]);

    useEffect(() => {
        const fetchSalaryData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch both current salary (from profile) and history
                const [profileResponse, historyResponse] = await Promise.all([
                    api.get('/employees/me'), // Gets current salary among other details
                    api.get('/employees/me/salary-history')
                ]);

                if (profileResponse.data?.employee) {
                    setCurrentSalary(profileResponse.data.employee.current_salary);
                } else {
                    console.warn("Could not fetch current salary from profile data.");
                }

                setSalaryHistory(historyResponse.data || []);

            } catch (err) {
                console.error('Error fetching salary data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load salary information.');
            } finally {
                setLoading(false);
            }
        };

        fetchSalaryData();
    }, []); // Fetch only on mount

    if (loading) {
        return <EmployeeLayout><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin h-12 w-12 text-primary-500" /></div></EmployeeLayout>;
    }

    return (
        <EmployeeLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Salary Information</h1>
                <p className="text-gray-600">View your current salary and compensation history.</p>
            </div>

            {error && (
                 <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded flex items-center justify-between">
                     <span>{error}</span>
                     <button onClick={() => setError('')} className="text-red-700 hover:text-red-900"> <FiX size={18}/> </button>
                 </div>
             )}

            {/* Current Salary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                 <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                     <FiDollarSign className="mr-2 text-green-500"/> Current Salary
                 </h3>
                 <p className="text-3xl font-bold text-green-600">
                     {formatCurrency(currentSalary)}
                     <span className="text-base font-normal text-gray-500 ml-1">(Annual)</span>
                  </p>
                  {currentSalary == null && !loading && <p className="text-sm text-gray-500 italic mt-2">Current salary information not available.</p>}
            </div>


            {/* Salary History Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                   <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                       <FiCalendar className="mr-2 text-blue-500"/> Salary History
                   </h3>
                </div>

                 {salaryHistory.length === 0 && !loading ? (
                      <div className="px-6 py-10 text-center text-gray-500 italic"> No salary history found. </div>
                  ) : (
                     <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                             <thead className="bg-gray-50">
                                 <tr>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Effective Date </th>
                                     <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"> Amount (Annual) </th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Reason / Note </th>
                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"> Recorded On </th>
                                  </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                  {(salaryHistory || []).map((entry) => (
                                       <tr key={entry.id} className="hover:bg-gray-50">
                                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{format(new Date(entry.effective_date), 'MMM d, yyyy')}</td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{formatCurrency(entry.amount)}</td>
                                           <td className="px-6 py-4 text-sm text-gray-600 max-w-md" title={entry.reason || ''}>{entry.reason || '-'}</td>
                                           <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(entry.created_at), 'MMM d, yyyy')}</td>
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

export default SalaryPage;