// src/pages/supervisor/EmployeeEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns'; // Import format
import { FiSave, FiLoader, FiX, FiArrowLeft } from 'react-icons/fi';

const EmployeeEdit = () => {
    const { id } = useParams(); // Get employee ID from URL
    const employeeIdBeingEdited = parseInt(id); // Ensure it's a number
    const navigate = useNavigate();
    const [loadingData, setLoadingData] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Form state - Keep your original fields
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        hire_date: '', // Keeping as requested
        department_id: '',
        designation_id: '',
        role_id: '',
        employee_type_id: '',
        reports_to: '',
        birth_date: '', // Keeping as requested
        gender: '', // Keeping as requested
        is_supervisor: false,
        // is_active: true
    });

    // Dropdown data state
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [supervisors, setSupervisors] = useState([]); // This will hold only actual supervisors

    // Fetch existing employee data and dropdown data
    useEffect(() => {
        // Ensure employeeIdBeingEdited is a valid number before proceeding
        if (isNaN(employeeIdBeingEdited)) {
             setError("Invalid Employee ID.");
             setLoadingData(false);
             return; // Stop fetching if ID is invalid
         }

        const fetchData = async () => {
            setLoadingData(true);
            setError('');
            try {
                const [
                    empRes,
                    deptRes,
                    desigRes,
                    roleRes,
                    empTypeRes,
                    supervisorRes // Fetch potential supervisors
                ] = await Promise.all([
                    api.get(`/employees/${employeeIdBeingEdited}`), // Fetch specific employee data
                    api.get('/admin/departments'),
                    api.get('/admin/designations'),
                    api.get('/admin/roles'),
                    api.get('/admin/employee-types'),
                    // --- MINIMAL CHANGE 1: Modify API call for Supervisors ---
                    api.get('/employees', { params: { limit: 10000, is_active: 1, is_supervisor: true } })
                ]);

                const employeeData = empRes.data?.employee;
                if (!employeeData) throw new Error(`Employee not found.`);

                const departmentsData = deptRes.data || [];
                const designationsData = desigRes.data || [];
                const rolesData = roleRes.data || [];
                const empTypesData = empTypeRes.data || [];
                // Filter self happens automatically now due to the API call only returning supervisors,
                // unless the person being edited IS a supervisor themselves
                const supervisorsData = (supervisorRes.data.employees || []).filter(emp => emp.id !== employeeIdBeingEdited);


                setDepartments(departmentsData);
                setDesignations(designationsData);
                setRoles(rolesData);
                setEmployeeTypes(empTypesData);
                setSupervisors(supervisorsData); // This list now only contains active supervisors (excluding self)

                // Populate form with existing data - Use format for dates
                setFormData({
                    first_name: employeeData.first_name || '',
                    last_name: employeeData.last_name || '',
                    phone: employeeData.phone || '',
                    address: employeeData.address || '',
                    hire_date: employeeData.hire_date ? format(new Date(employeeData.hire_date), 'yyyy-MM-dd') : '', // Format date
                    department_id: employeeData.department_id || '',
                    designation_id: employeeData.designation_id || '',
                    role_id: employeeData.role_id || '',
                    employee_type_id: employeeData.employee_type_id || '',
                    reports_to: employeeData.reports_to || '', // This might be null or an ID
                    birth_date: employeeData.birth_date ? format(new Date(employeeData.birth_date), 'yyyy-MM-dd') : '', // Format date
                    gender: employeeData.gender || '',
                    is_supervisor: !!employeeData.is_supervisor, // Ensure boolean
                    // is_active: employeeData.is_active === undefined ? true : !!employeeData.is_active // Ensure boolean
                });

            } catch (err) {
                console.error("Error fetching data:", err);
                setError(err.response?.data?.message || err.message || "Failed to load data.");
                 if (err.response?.status === 404) {
                    // navigate('/supervisor/employees'); // Optional redirect
                }
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [employeeIdBeingEdited, navigate]); // Depend on employeeIdBeingEdited

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => {
            const updatedFormData = { ...prev, [name]: newValue };

            // --- MINIMAL CHANGE 2: Clear reports_to if becoming supervisor ---
             if (name === 'is_supervisor' && newValue === true) {
                 updatedFormData.reports_to = ''; // Clear for select dropdown
             }

            return updatedFormData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

         // Prepare payload
        const payload = {
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.phone || null,
            address: formData.address || null,
           
            department_id: formData.department_id,
            designation_id: formData.designation_id,
            role_id: formData.role_id,
            employee_type_id: formData.employee_type_id,
            // --- MINIMAL CHANGE 3: Set reports_to based on is_supervisor ---
            reports_to: formData.is_supervisor ? null : (formData.reports_to || null), // Send null if supervisor or if 'None' is selected
            is_supervisor: formData.is_supervisor,
            // is_active: formData.is_active // Assuming PATCH handler accepts this
        };
        // Remove hire_date if not editable
        // delete payload.hire_date;

        console.log("Submitting Edit Payload:", payload);

        try {
            await api.patch(`/employees/${employeeIdBeingEdited}`, payload);
            alert('Employee updated successfully!');
            navigate(`/supervisor/employees/${employeeIdBeingEdited}`);
        } catch (err) {
            console.error('Error updating employee:', err);
             setError(err.response?.data?.message || 'Failed to update employee.');
        } finally {
            setSubmitting(false);
        }
    };

    // --- JSX ---
    if (loadingData) { return <SupervisorLayout><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin h-12 w-12 text-primary-500" /></div></SupervisorLayout>; }

    return (
         <SupervisorLayout>
             <div className="mb-6 flex items-center">
                 <Link to={`/supervisor/employees`} className="mr-4 p-1 rounded-full hover:bg-gray-100"> <FiArrowLeft className="h-5 w-5 text-gray-600"/> </Link>
                  <div>
                      <h1 className="text-2xl font-bold text-gray-800">Edit Employee</h1>
                      {!loadingData && formData.first_name && <p className="text-gray-600">Updating: {formData.first_name} {formData.last_name}</p>}
                  </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">

                      {/* Personal Info Fieldset */}
                      <fieldset className="border-t border-gray-200 pt-6">
                          <legend className="text-lg font-medium text-gray-900 mb-4">Personal Information</legend>
                          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                               {/* Use py-2 for original smaller size */}
                              <div className="sm:col-span-3"> <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label> <input type="text" name="first_name" id="first_name" required value={formData.first_name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3" /> </div>
                              <div className="sm:col-span-3"> <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label> <input type="text" name="last_name" id="last_name" required value={formData.last_name} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3" /> </div>
                              <div className="sm:col-span-3"> <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label> <input type="tel" name="phone" id="phone" value={formData.phone || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3" /> </div>
                              <div className="sm:col-span-3"> <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700">Birth Date</label> <input type="date" name="birth_date" id="birth_date" value={formData.birth_date} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3" /> </div>
                              <div className="sm:col-span-3"> <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Gender</label> <select id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3"><option value="">Select</option><option value="male">Male</option><option value="female">Female</option><option value="other">Other</option></select></div>
                              <div className="sm:col-span-6"> <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label> <textarea name="address" id="address" rows="3" value={formData.address || ''} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3"></textarea> </div>
                          </div>
                       </fieldset>

                      {/* Job Info Fieldset */}
                       <fieldset className="border-t border-gray-200 pt-6">
                           <legend className="text-lg font-medium text-gray-900 mb-4">Job Information</legend>
                           <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                               <div className="sm:col-span-3"> <label htmlFor="hire_date" className="block text-sm font-medium text-gray-700">Hire Date</label> <input type="date" name="hire_date" id="hire_date" readOnly value={formData.hire_date} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3 bg-gray-100 cursor-not-allowed" title="Hire date cannot be changed" /> </div>
                               <div className="sm:col-span-3"></div> {/* Spacer */}
                               <div className="sm:col-span-3"> <label htmlFor="department_id" className="block text-sm font-medium text-gray-700">Department <span className="text-red-500">*</span></label> <select id="department_id" name="department_id" required value={formData.department_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3">{departments.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}</select> </div>
                               <div className="sm:col-span-3"> <label htmlFor="designation_id" className="block text-sm font-medium text-gray-700">Designation <span className="text-red-500">*</span></label> <select id="designation_id" name="designation_id" required value={formData.designation_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3">{designations.map(desig => <option key={desig.id} value={desig.id}>{desig.name}</option>)}</select> </div>
                               <div className="sm:col-span-3"> <label htmlFor="role_id" className="block text-sm font-medium text-gray-700">Role <span className="text-red-500">*</span></label> <select id="role_id" name="role_id" required value={formData.role_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3">{roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</select> </div>
                               <div className="sm:col-span-3"> <label htmlFor="employee_type_id" className="block text-sm font-medium text-gray-700">Employee Type <span className="text-red-500">*</span></label> <select id="employee_type_id" name="employee_type_id" required value={formData.employee_type_id} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3">{employeeTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select> </div>

                               {/* --- MINIMAL CHANGE 4: Conditional Rendering for Reports To --- */}
                               {!formData.is_supervisor && (
                                   <div className="sm:col-span-3">
                                       <label htmlFor="reports_to" className="block text-sm font-medium text-gray-700">Reports To (Supervisor)</label>
                                       <select
                                           id="reports_to"
                                           name="reports_to"
                                           value={formData.reports_to || ''} // Handle potential null value
                                           onChange={handleInputChange}
                                           className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3"
                                       >
                                           <option value="">None</option>
                                           {supervisors.map(sup => (
                                               <option key={sup.id} value={sup.id}>
                                                   {sup.first_name} {sup.last_name}
                                               </option>
                                           ))}
                                       </select>
                                   </div>
                               )}
                               {/* --- END CONDITIONAL RENDERING --- */}

                               <div className={`sm:col-span-3 flex items-center ${formData.is_supervisor ? 'sm:col-start-1' : ''} pt-1`}> {/* Adjust position if reports_to is hidden */}
                                   <div className="relative flex items-start">
                                       <div className="flex h-5 items-center mt-1">
                                           <input id="is_supervisor" name="is_supervisor" type="checkbox" checked={formData.is_supervisor} onChange={handleInputChange} className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"/>
                                       </div>
                                       <div className="ml-3 text-sm">
                                           <label htmlFor="is_supervisor" className="font-medium text-gray-700">Is Supervisor?</label>
                                       </div>
                                   </div>
                               </div>
                                
                            </div>
                        </fieldset>

                       {/* Submit/Cancel Buttons */}
                       <div className="pt-6 flex justify-end space-x-3">
                            <Link to={`/supervisor/employees/${employeeIdBeingEdited}`} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"> <FiX className="mr-2 -ml-1 h-5 w-5" /> Cancel </Link>
                            <button type="submit" disabled={submitting || loadingData} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                 {submitting ? <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" /> : <FiSave className="-ml-1 mr-2 h-5 w-5" />} {submitting ? 'Saving...' : 'Save Changes'}
                            </button>
                       </div>
                   </form>
               </div>
           </SupervisorLayout>
      );
 };

 export default EmployeeEdit;