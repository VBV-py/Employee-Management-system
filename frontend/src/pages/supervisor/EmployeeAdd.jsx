// src/pages/supervisor/EmployeeAdd.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { FiUserPlus, FiSave, FiLoader, FiX, FiArrowLeft } from 'react-icons/fi';

const EmployeeAdd = () => {
    const navigate = useNavigate();
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        address: '',
        hire_date: '',
        department_id: '',
        designation_id: '',
        role_id: '',
        employee_type_id: '',
        reports_to: '', // Optional
        birth_date: '', // Optional
        gender: '',       // Optional
        initial_salary: ''
    });

    // Dropdown data state
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [supervisors, setSupervisors] = useState([]); // For 'reports_to'

    // Fetch data for dropdowns on component mount
    useEffect(() => {
        const fetchData = async () => {
            setLoadingData(true);
            setError(''); // Clear previous errors
            try {
                const [
                    deptRes,
                    desigRes,
                    roleRes,
                    empTypeRes,
                    supervisorRes // Fetch employees who *could* be supervisors
                ] = await Promise.all([
                    api.get('/admin/departments'),
                    api.get('/admin/designations'),
                    api.get('/admin/roles'),
                    api.get('/admin/employee-types'),
                    api.get('/employees', { params: { limit: 1000, is_active: 1,is_supervisor: true } }) // Fetch active employees as potential supervisors
                ]);

                const departmentsData = deptRes.data || [];
                const designationsData = desigRes.data || [];
                const rolesData = roleRes.data || [];
                const empTypesData = empTypeRes.data || [];
                const supervisorsData = supervisorRes.data.employees || [];

                setDepartments(departmentsData);
                setDesignations(designationsData);
                setRoles(rolesData);
                setEmployeeTypes(empTypesData);
                setSupervisors(supervisorsData);

                // Set default dropdown values if data exists
                setFormData(prev => ({
                    ...prev,
                    department_id: departmentsData.length > 0 ? departmentsData[0].id : '',
                    designation_id: designationsData.length > 0 ? designationsData[0].id : '',
                    role_id: rolesData.length > 0 ? rolesData[0].id : '', // Consider finding a specific 'Employee' role if needed
                    employee_type_id: empTypesData.length > 0 ? empTypesData[0].id : ''
                }));

            } catch (err) {
                console.error("Error fetching dropdown data:", err);
                setError("Failed to load necessary data for the form. Please ensure the backend is running and accessible.");
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        // Prepare payload, ensure is_supervisor is false
        const payload = {
            ...formData,
            initial_salary: formData.initial_salary,
            reports_to: formData.reports_to || null, // Send null if empty string
            birth_date: formData.birth_date || null,
            gender: formData.gender || null,
            is_supervisor: false // Explicitly set to false for adding an employee via this form
        };

        // Basic password validation example (add more robust validation if needed)
        if (!payload.password || payload.password.length < 8) { setError('Password required (min 8 chars).'); setSubmitting(false); return; }
        if (!payload.initial_salary || isNaN(parseFloat(payload.initial_salary)) || parseFloat(payload.initial_salary) <= 0) { setError('Valid Initial Salary is required.'); setSubmitting(false); return; }
        if (!payload.hire_date) { setError('Hire Date is required.'); setSubmitting(false); return; }
        // Add checks for required dropdowns if needed
        if (!payload.department_id || !payload.designation_id || !payload.role_id || !payload.employee_type_id) { setError('Dept, Designation, Role, Type are required.'); setSubmitting(false); return; }

        try {
            // Using /api/auth/register as requested for now
            await api.post('/auth/register', payload);
            alert('Employee added successfully!');
            navigate('/supervisor/employees'); // Navigate back to the list
        } catch (err) {
            console.error('Error adding employee:', err);
            // Improve error message presentation
            const apiErrorMessage = err.response?.data?.message || 'An unexpected error occurred.';
            const detailedError = err.response?.data?.error ? ` Details: ${err.response.data.error}` : '';
            setError(`${apiErrorMessage}${detailedError}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingData) {
        return (
            <SupervisorLayout>
                <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin h-12 w-12 text-primary-500" />
                    <p className="ml-3 text-gray-600">Loading form data...</p>
                </div>
            </SupervisorLayout>
        );
    }

     return (
         <SupervisorLayout>
             <div className="mb-6 flex items-center">
                  <Link
                     to="/supervisor/employees"
                     className="mr-4 text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                   >
                     <FiArrowLeft className="h-5 w-5" />
                   </Link>
                 <div>
                     <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                         <FiUserPlus className="mr-3 text-primary-600" /> Add New Employee
                     </h1>
                     <p className="text-gray-600">Enter the details for the new employee.</p>
                 </div>
             </div>

             <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                 {error && (
                     <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded flex items-center justify-between">
                         <span>{error}</span>
                         <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                             <FiX size={18}/>
                         </button>
                     </div>
                 )}
                 <form onSubmit={handleSubmit} className="space-y-6">
                     {/* Personal Information */}
                     <fieldset className="border-t border-gray-200 pt-6">
                         <legend className="text-lg font-medium text-gray-900 mb-4">Personal Information</legend>
                         <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                             <div className="sm:col-span-3">
                                 <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                                 <input type="text" name="first_name" id="first_name" required value={formData.first_name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3" />
                             </div>
                             <div className="sm:col-span-3">
                                 <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                 <input type="text" name="last_name" id="last_name" required value={formData.last_name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3" />
                             </div>
                             <div className="sm:col-span-4">
                                 <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                 <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3" />
                             </div>
                              <div className="sm:col-span-2">
                                 <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                                 <input type="password" name="password" id="password" required value={formData.password} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3" placeholder="Min 8 characters"/>
                              </div>
                              <div className="sm:col-span-3">
                                 <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                                 <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3" />
                              </div>
                              <div className="sm:col-span-3">
                                 <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Birth Date</label>
                                 <input type="date" name="birth_date" id="birth_date" value={formData.birth_date} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3" />
                              </div>
                              <div className="sm:col-span-3">
                                 <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label>
                                  <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3">
                                      <option value="">Select Gender</option>
                                      <option value="male">Male</option>
                                      <option value="female">Female</option>
                                      <option value="other">Other</option>
                                  </select>
                              </div>
                              <div className="sm:col-span-6">
                                 <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                 <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3"></textarea>
                              </div>
                          </div>
                      </fieldset>

                      {/* Job Information */}
                      <fieldset className="border-t border-gray-200 pt-6">
                          <legend className="text-lg font-medium text-gray-900 mb-4">Job Information</legend>
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                              <div className="sm:col-span-3">
                                  <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">Hire Date <span className="text-red-500">*</span></label>
                                  <input type="date" name="hire_date" id="hire_date" required value={formData.hire_date} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3" />
                              </div>
                              <div className="sm:col-span-3">
                                 <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label>
                                 <select id="department_id" name="department_id" required value={formData.department_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3">
                                    <option value="" disabled>Select Department</option>
                                     {departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                 </select>
                             </div>
                             <div className="sm:col-span-3">
                                 <label htmlFor="designation_id" className="block text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label>
                                 <select id="designation_id" name="designation_id" required value={formData.designation_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3">
                                     <option value="" disabled>Select Designation</option>
                                     {designations.map(desig => <option key={desig.id} value={desig.id}>{desig.name}</option>)}
                                 </select>
                             </div>
                             <div className="sm:col-span-3">
                                 <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label>
                                 <select id="role_id" name="role_id" required value={formData.role_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3">
                                     <option value="" disabled>Select Role</option>
                                     {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
                                 </select>
                             </div>
                             <div className="sm:col-span-3">
                                 <label htmlFor="employee_type_id" className="block text-sm font-medium text-gray-700">Employee Type <span className="text-red-500">*</span></label>
                                 <select id="employee_type_id" name="employee_type_id" required value={formData.employee_type_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3">
                                     <option value="" disabled>Select Employee Type</option>
                                     {employeeTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}
                                 </select>
                             </div>
                              <div className="sm:col-span-3">
                                  <label htmlFor="reports_to" className="block text-sm font-medium text-gray-700">Reports To (Supervisor)</label>
                                  <select id="reports_to" name="reports_to" value={formData.reports_to} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-3 px-3">
                                      <option value="">None</option>
                                      {supervisors.map(sup => <option key={sup.id} value={sup.id}>{sup.first_name} {sup.last_name}</option>)}
                                  </select>
                              </div>
                              <div className="sm:col-span-3">
                                  <label htmlFor="initial_salary" className="block text-sm font-medium text-gray-700">Initial Salary (Annual) <span className="text-red-500">*</span></label>
                                  <input
                                     type="number"
                                     step="0.01"
                                     min="0"
                                     name="initial_salary"
                                     id="initial_salary"
                                     required
                                     value={formData.initial_salary} // Bind to state
                                     onChange={handleInputChange}
                                     className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3" // Using smaller py-2
                                     placeholder="e.g., 60000"
                                  />
                              </div>
                          </div>
                      </fieldset>

                      <div className="pt-6 flex justify-end space-x-3">
                         <Link
                              to="/supervisor/employees"
                              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                          >
                              <FiX className="mr-2 -ml-1 h-5 w-5" />
                              Cancel
                          </Link>
                          <button
                              type="submit"
                              disabled={submitting || loadingData} // Disable if loading data too
                              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                          >
                              {submitting ? (
                                  <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                              ): (
                                  <FiSave className="-ml-1 mr-2 h-5 w-5" />
                              )}
                              {submitting ? 'Saving...' : 'Save Employee'}
                          </button>
                      </div>
                  </form>
              </div>
          </SupervisorLayout>
      );
  };

  export default EmployeeAdd;