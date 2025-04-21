// src/pages/supervisor/Settings.jsx
import React, { useState, useEffect } from 'react';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import {
    FiSettings,
    FiUsers,
    FiLayers,
    FiBriefcase,
    FiCalendar,
    FiPlus,
    FiEdit,
    FiSave,
    FiX,
    FiLoader // Added for loading indicators
} from 'react-icons/fi';

const Settings = () => {
    // Active settings tab
    const [activeTab, setActiveTab] = useState('departments');

    // Data states
    const [departments, setDepartments] = useState([]);
    const [designations, setDesignations] = useState([]);
    const [roles, setRoles] = useState([]);
    const [employeeTypes, setEmployeeTypes] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);

    // Loading states
    const [loading, setLoading] = useState({
        departments: false,
        designations: false,
        roles: false,
        employeeTypes: false,
        leaveTypes: false,
    });

    // Add/Edit Form States
    const [showForms, setShowForms] = useState({
        department: false,
        designation: false,
        role: false,
        employeeType: false,
        leaveType: false,
    });

    // Current editing item
    const [currentDepartment, setCurrentDepartment] = useState({ id: null, name: '', description: '' });
    const [currentDesignation, setCurrentDesignation] = useState({ id: null, name: '', description: '' });
    const [currentRole, setCurrentRole] = useState({ id: null, name: '', description: '' });
    const [currentEmployeeType, setCurrentEmployeeType] = useState({ id: null, name: '', description: '' });
    const [currentLeaveType, setCurrentLeaveType] = useState({ id: null, name: '', default_days: 0, description: '' });

    // Submitting states
    const [submitting, setSubmitting] = useState({
        department: false,
        designation: false,
        role: false,
        employeeType: false,
        leaveType: false,
    });

     // --- Generic State Update Functions ---
     const setLoadingState = (tab, isLoading) => setLoading(prev => ({ ...prev, [tab]: isLoading }));
     const setSubmittingState = (tab, isSubmitting) => setSubmitting(prev => ({ ...prev, [tab]: isSubmitting }));
     const setShowFormState = (tab, show) => setShowForms(prev => ({ ...prev, [tab]: show }));


    useEffect(() => {
        // Automatically fetch data for the active tab when it changes
        switch (activeTab) {
            case 'departments':
                if (departments.length === 0) fetchDepartments(); // Fetch only if not loaded
                break;
            case 'designations':
                if (designations.length === 0) fetchDesignations();
                break;
            case 'roles':
                if (roles.length === 0) fetchRoles();
                break;
            case 'employee-types':
                if (employeeTypes.length === 0) fetchEmployeeTypes();
                break;
            case 'leave-types':
                if (leaveTypes.length === 0) fetchLeaveTypes();
                break;
            default:
                break;
        }
    }, [activeTab]); // Re-run effect when activeTab changes

    // --- Fetch functions ---
    const fetchDepartments = async () => {
        setLoadingState('departments', true);
        try {
            const response = await api.get('/admin/departments');
            setDepartments(response.data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        } finally {
            setLoadingState('departments', false);
        }
    };

    const fetchDesignations = async () => {
        setLoadingState('designations', true);
        try {
            const response = await api.get('/admin/designations');
            setDesignations(response.data || []);
        } catch (error) {
            console.error('Error fetching designations:', error);
        } finally {
            setLoadingState('designations', false);
        }
    };

    const fetchRoles = async () => {
        setLoadingState('roles', true);
        try {
            const response = await api.get('/admin/roles');
            setRoles(response.data || []);
        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoadingState('roles', false);
        }
    };

    const fetchEmployeeTypes = async () => {
        setLoadingState('employeeTypes', true);
        try {
            const response = await api.get('/admin/employee-types');
            setEmployeeTypes(response.data || []);
        } catch (error) {
            console.error('Error fetching employee types:', error);
        } finally {
            setLoadingState('employeeTypes', false);
        }
    };

    const fetchLeaveTypes = async () => {
        setLoadingState('leaveTypes', true);
        try {
            const response = await api.get('/admin/leave-types');
            setLeaveTypes(response.data || []);
        } catch (error) {
            console.error('Error fetching leave types:', error);
        } finally {
            setLoadingState('leaveTypes', false);
        }
    };

    // --- Form submission handlers ---
    const handleDepartmentSubmit = async (e) => {
        e.preventDefault();
        setSubmittingState('department', true);
        try {
            if (currentDepartment.id) {
                await api.patch(`/admin/departments/${currentDepartment.id}`, currentDepartment);
            } else {
                await api.post('/admin/departments', currentDepartment);
            }
            setShowFormState('department', false);
            fetchDepartments(); // Refresh list
        } catch (error) {
            console.error('Error saving department:', error);
            alert(error.response?.data?.message || 'Error saving department');
        } finally {
            setSubmittingState('department', false);
        }
    };

    const handleDesignationSubmit = async (e) => {
        e.preventDefault();
        setSubmittingState('designation', true);
        try {
            if (currentDesignation.id) {
                await api.patch(`/admin/designations/${currentDesignation.id}`, currentDesignation);
            } else {
                await api.post('/admin/designations', currentDesignation);
            }
            setShowFormState('designation', false);
            fetchDesignations();
        } catch (error) {
            console.error('Error saving designation:', error);
            alert(error.response?.data?.message || 'Error saving designation');
        } finally {
            setSubmittingState('designation', false);
        }
    };

    const handleRoleSubmit = async (e) => {
        e.preventDefault();
        setSubmittingState('role', true);
         try {
             if (currentRole.id) {
                 await api.patch(`/admin/roles/${currentRole.id}`, currentRole);
             } else {
                 await api.post('/admin/roles', currentRole);
             }
             setShowFormState('role', false);
             fetchRoles(); // Refresh the list
         } catch (error) {
             console.error('Error saving role:', error);
             alert(error.response?.data?.message || 'Error saving role');
         } finally {
             setSubmittingState('role', false);
        }
    };

    const handleEmployeeTypeSubmit = async (e) => {
        e.preventDefault();
        setSubmittingState('employeeType', true);
        try {
            if (currentEmployeeType.id) {
                await api.patch(`/admin/employee-types/${currentEmployeeType.id}`, currentEmployeeType);
            } else {
                await api.post('/admin/employee-types', currentEmployeeType);
            }
            setShowFormState('employeeType', false);
            fetchEmployeeTypes(); // Refresh the list
        } catch (error) {
            console.error('Error saving employee type:', error);
            alert(error.response?.data?.message || 'Error saving employee type');
        } finally {
            setSubmittingState('employeeType', false);
        }
    };

    const handleLeaveTypeSubmit = async (e) => {
        e.preventDefault();
        setSubmittingState('leaveType', true);
        try {
            const payload = {...currentLeaveType, default_days : Number(currentLeaveType.default_days) || 0 }
            if (currentLeaveType.id) {
                await api.patch(`/admin/leave-types/${currentLeaveType.id}`, payload);
            } else {
                await api.post('/admin/leave-types', payload);
            }
            setShowFormState('leaveType', false);
            fetchLeaveTypes(); // Refresh the list
        } catch (error) {
            console.error('Error saving leave type:', error);
            alert(error.response?.data?.message || 'Error saving leave type');
        } finally {
            setSubmittingState('leaveType', false);
        }
    };


    // --- Input change handlers ---
    const handleDepartmentChange = (e) => {
        const { name, value } = e.target;
        setCurrentDepartment(prev => ({ ...prev, [name]: value }));
    };

    const handleDesignationChange = (e) => {
        const { name, value } = e.target;
        setCurrentDesignation(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (e) => {
        const { name, value } = e.target;
        setCurrentRole(prev => ({ ...prev, [name]: value }));
    };

    const handleEmployeeTypeChange = (e) => {
        const { name, value } = e.target;
        setCurrentEmployeeType(prev => ({ ...prev, [name]: value }));
    };

    const handleLeaveTypeChange = (e) => {
        const { name, value } = e.target;
        setCurrentLeaveType(prev => ({ ...prev, [name]: value }));
    };

    // --- Edit item handlers ---
    const editDepartment = (department) => {
        setCurrentDepartment({ ...department });
        setShowFormState('department', true);
    };

    const editDesignation = (designation) => {
        setCurrentDesignation({ ...designation });
        setShowFormState('designation', true);
    };

    const editRole = (role) => {
        setCurrentRole({ ...role });
        setShowFormState('role', true);
    };

    const editEmployeeType = (type) => {
        setCurrentEmployeeType({ ...type });
        setShowFormState('employeeType', true);
    };

    const editLeaveType = (type) => {
        setCurrentLeaveType({ ...type });
        setShowFormState('leaveType', true);
    };

    // --- Helper to render loading or empty state ---
     const renderLoadingOrEmpty = (isLoading, dataArray, sectionName, icon) => {
         if (isLoading) {
             return (
                 <div className="flex justify-center py-8">
                     <FiLoader className="animate-spin h-8 w-8 text-primary-500" />
                 </div>
             );
         }
         if (!dataArray || dataArray.length === 0) {
             return (
                 <div className="text-center py-8 bg-gray-50 rounded-lg">
                      {icon}
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No {sectionName} found</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by adding the first {sectionName.toLowerCase().slice(0,-1)}.</p>
                 </div>
             );
         }
         return null; // Return null if data exists and is not loading
     };


    return (
        <SupervisorLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600">Configure and manage system settings</p>
            </div>

            {/* Settings Tabs */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('departments')}
                            className={`flex-shrink-0 py-4 px-6 text-sm font-medium flex items-center ${
                            activeTab === 'departments'
                                ? 'border-b-2 border-primary-500 text-primary-600'
                                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FiLayers className="h-5 w-5 mr-2" />
                            Departments
                        </button>

                        <button
                            onClick={() => setActiveTab('designations')}
                            className={`flex-shrink-0 py-4 px-6 text-sm font-medium flex items-center ${
                            activeTab === 'designations'
                                ? 'border-b-2 border-primary-500 text-primary-600'
                                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FiBriefcase className="h-5 w-5 mr-2" />
                            Designations
                        </button>

                        <button
                             onClick={() => setActiveTab('roles')}
                             className={`flex-shrink-0 py-4 px-6 text-sm font-medium flex items-center ${
                             activeTab === 'roles'
                                 ? 'border-b-2 border-primary-500 text-primary-600'
                                 : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                             }`}
                         >
                            <FiSettings className="h-5 w-5 mr-2" />
                            Roles
                        </button>

                        <button
                            onClick={() => setActiveTab('employee-types')}
                            className={`flex-shrink-0 py-4 px-6 text-sm font-medium flex items-center ${
                            activeTab === 'employee-types'
                                ? 'border-b-2 border-primary-500 text-primary-600'
                                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FiUsers className="h-5 w-5 mr-2" />
                            Employee Types
                        </button>

                        <button
                            onClick={() => setActiveTab('leave-types')}
                             className={`flex-shrink-0 py-4 px-6 text-sm font-medium flex items-center ${
                             activeTab === 'leave-types'
                                 ? 'border-b-2 border-primary-500 text-primary-600'
                                 : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                             }`}
                         >
                            <FiCalendar className="h-5 w-5 mr-2" />
                            Leave Types
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {/* Departments Tab */}
                    {activeTab === 'departments' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-800">Manage Departments</h2>
                                <button
                                    onClick={() => {
                                        setCurrentDepartment({ id: null, name: '', description: '' });
                                        setShowFormState('department', true);
                                    }}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                                >
                                    <FiPlus className="mr-2 -ml-1 h-5 w-5" />
                                    Add Department
                                </button>
                            </div>

                            {showForms.department && (
                                <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                    <h3 className="text-md font-medium text-gray-800 mb-4">
                                        {currentDepartment.id ? 'Edit Department' : 'Add New Department'}
                                    </h3>
                                    <form onSubmit={handleDepartmentSubmit}>
                                        {/* Form fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor="dept_name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                                <input type="text" id="dept_name" name="name" value={currentDepartment.name} onChange={handleDepartmentChange} required className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                            </div>
                                            <div>
                                                <label htmlFor="dept_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                <input type="text" id="dept_description" name="description" value={currentDepartment.description} onChange={handleDepartmentChange} className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                            </div>
                                        </div>
                                        {/* Buttons */}
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <button type="button" onClick={() => setShowFormState('department', false)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><FiX className="mr-2 -ml-1 h-5 w-5" />Cancel</button>
                                            <button type="submit" disabled={submitting.department || !currentDepartment.name} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"><FiSave className="mr-2 -ml-1 h-5 w-5" />{submitting.department ? 'Saving...' : 'Save'}</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {renderLoadingOrEmpty(loading.departments, departments, 'Departments', <FiLayers className="mx-auto h-12 w-12 text-gray-300" />) || (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        {/* Table Head */}
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                                            </tr>
                                        </thead>
                                        {/* Table Body */}
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {departments.map((dept) => (
                                                <tr key={dept.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dept.name}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.description || '-'}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dept.employee_count || 0}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button onClick={() => editDepartment(dept)} className="text-indigo-600 hover:text-indigo-900"><FiEdit className="h-5 w-5" /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Designations Tab */}
                    {activeTab === 'designations' && (
                         <div>
                             <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-lg font-semibold text-gray-800">Manage Designations</h2>
                                 <button onClick={() => { setCurrentDesignation({ id: null, name: '', description: '' }); setShowFormState('designation', true);}}
                                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                     <FiPlus className="mr-2 -ml-1 h-5 w-5" /> Add Designation
                                 </button>
                             </div>
                             {showForms.designation && (
                                 <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                      <h3 className="text-md font-medium text-gray-800 mb-4"> {currentDesignation.id ? 'Edit Designation' : 'Add New Designation'} </h3>
                                      <form onSubmit={handleDesignationSubmit}>
                                          {/* Form Fields */}
                                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                     <label htmlFor="desig_name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                                     <input type="text" id="desig_name" name="name" value={currentDesignation.name} onChange={handleDesignationChange} required className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                                </div>
                                                <div>
                                                     <label htmlFor="desig_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                     <input type="text" id="desig_description" name="description" value={currentDesignation.description} onChange={handleDesignationChange} className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                                 </div>
                                            </div>
                                          {/* Buttons */}
                                          <div className="mt-4 flex justify-end space-x-3">
                                              <button type="button" onClick={() => setShowFormState('designation', false)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><FiX className="mr-2 -ml-1 h-5 w-5" />Cancel</button>
                                              <button type="submit" disabled={submitting.designation || !currentDesignation.name} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"><FiSave className="mr-2 -ml-1 h-5 w-5" />{submitting.designation ? 'Saving...' : 'Save'}</button>
                                           </div>
                                       </form>
                                  </div>
                             )}
                              {renderLoadingOrEmpty(loading.designations, designations, 'Designations', <FiBriefcase className="mx-auto h-12 w-12 text-gray-300" />) || (
                                 <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                              {designations.map((desig) => (
                                                  <tr key={desig.id}>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{desig.name}</td>
                                                      <td className="px-6 py-4 text-sm text-gray-500">{desig.description || '-'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{desig.employee_count || 0}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => editDesignation(desig)} className="text-indigo-600 hover:text-indigo-900"><FiEdit className="h-5 w-5" /></button></td>
                                                   </tr>
                                               ))}
                                           </tbody>
                                       </table>
                                   </div>
                             )}
                         </div>
                     )}

                    {/* Roles Tab */}
                    {activeTab === 'roles' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-semibold text-gray-800">Manage Roles</h2>
                                <button onClick={() => { setCurrentRole({ id: null, name: '', description: '' }); setShowFormState('role', true);}}
                                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                    <FiPlus className="mr-2 -ml-1 h-5 w-5" /> Add Role
                                </button>
                            </div>
                             {showForms.role && (
                                 <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                    <h3 className="text-md font-medium text-gray-800 mb-4">{currentRole.id ? 'Edit Role' : 'Add New Role'}</h3>
                                    <form onSubmit={handleRoleSubmit}>
                                        {/* Form Fields */}
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                   <label htmlFor="role_name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                                   <input type="text" id="role_name" name="name" value={currentRole.name} onChange={handleRoleChange} required className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                               </div>
                                              <div>
                                                  <label htmlFor="role_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                  <input type="text" id="role_description" name="description" value={currentRole.description} onChange={handleRoleChange} className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                              </div>
                                          </div>
                                        {/* Buttons */}
                                        <div className="mt-4 flex justify-end space-x-3">
                                            <button type="button" onClick={() => setShowFormState('role', false)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><FiX className="mr-2 -ml-1 h-5 w-5" />Cancel</button>
                                            <button type="submit" disabled={submitting.role || !currentRole.name} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"><FiSave className="mr-2 -ml-1 h-5 w-5" />{submitting.role ? 'Saving...' : 'Save'}</button>
                                         </div>
                                     </form>
                                  </div>
                             )}
                              {renderLoadingOrEmpty(loading.roles, roles, 'Roles', <FiSettings className="mx-auto h-12 w-12 text-gray-300" />) || (
                                 <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                           <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                               {roles.map((role) => (
                                                  <tr key={role.id}>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{role.name}</td>
                                                      <td className="px-6 py-4 text-sm text-gray-500">{role.description || '-'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{role.employee_count || 0}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => editRole(role)} className="text-indigo-600 hover:text-indigo-900"><FiEdit className="h-5 w-5" /></button></td>
                                                   </tr>
                                               ))}
                                           </tbody>
                                       </table>
                                    </div>
                             )}
                         </div>
                    )}

                    {/* Employee Types Tab */}
                     {activeTab === 'employee-types' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-lg font-semibold text-gray-800">Manage Employee Types</h2>
                                 <button onClick={() => { setCurrentEmployeeType({ id: null, name: '', description: '' }); setShowFormState('employeeType', true); }}
                                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                     <FiPlus className="mr-2 -ml-1 h-5 w-5" /> Add Employee Type
                                 </button>
                             </div>
                             {showForms.employeeType && (
                                 <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                     <h3 className="text-md font-medium text-gray-800 mb-4">{currentEmployeeType.id ? 'Edit Employee Type' : 'Add New Employee Type'}</h3>
                                     <form onSubmit={handleEmployeeTypeSubmit}>
                                         {/* Form Fields */}
                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                     <label htmlFor="et_name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                                     <input type="text" id="et_name" name="name" value={currentEmployeeType.name} onChange={handleEmployeeTypeChange} required className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                                 </div>
                                                 <div>
                                                     <label htmlFor="et_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                    <input type="text" id="et_description" name="description" value={currentEmployeeType.description} onChange={handleEmployeeTypeChange} className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                                 </div>
                                             </div>
                                         {/* Buttons */}
                                          <div className="mt-4 flex justify-end space-x-3">
                                              <button type="button" onClick={() => setShowFormState('employeeType', false)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><FiX className="mr-2 -ml-1 h-5 w-5" />Cancel</button>
                                              <button type="submit" disabled={submitting.employeeType || !currentEmployeeType.name} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"><FiSave className="mr-2 -ml-1 h-5 w-5" />{submitting.employeeType ? 'Saving...' : 'Save'}</button>
                                          </div>
                                      </form>
                                  </div>
                              )}
                             {renderLoadingOrEmpty(loading.employeeTypes, employeeTypes, 'Employee Types', <FiUsers className="mx-auto h-12 w-12 text-gray-300" />) || (
                                 <div className="overflow-x-auto">
                                     <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                                         <tbody className="bg-white divide-y divide-gray-200">
                                              {employeeTypes.map((type) => (
                                                 <tr key={type.id}>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.name}</td>
                                                     <td className="px-6 py-4 text-sm text-gray-500">{type.description || '-'}</td>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.employee_count || 0}</td>
                                                     <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => editEmployeeType(type)} className="text-indigo-600 hover:text-indigo-900"><FiEdit className="h-5 w-5" /></button></td>
                                                  </tr>
                                              ))}
                                          </tbody>
                                      </table>
                                  </div>
                              )}
                         </div>
                     )}

                    {/* Leave Types Tab */}
                    {activeTab === 'leave-types' && (
                        <div>
                             <div className="flex justify-between items-center mb-6">
                                 <h2 className="text-lg font-semibold text-gray-800">Manage Leave Types</h2>
                                 <button onClick={() => { setCurrentLeaveType({ id: null, name: '', default_days: 0, description: '' }); setShowFormState('leaveType', true); }}
                                     className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                                     <FiPlus className="mr-2 -ml-1 h-5 w-5" /> Add Leave Type
                                 </button>
                            </div>
                             {showForms.leaveType && (
                                 <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
                                     <h3 className="text-md font-medium text-gray-800 mb-4">{currentLeaveType.id ? 'Edit Leave Type' : 'Add New Leave Type'}</h3>
                                     <form onSubmit={handleLeaveTypeSubmit}>
                                         {/* Form Fields */}
                                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div>
                                                     <label htmlFor="lt_name" className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                                                     <input type="text" id="lt_name" name="name" value={currentLeaveType.name} onChange={handleLeaveTypeChange} required className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                                 </div>
                                                <div>
                                                    <label htmlFor="lt_default_days" className="block text-sm font-medium text-gray-700 mb-1">Default Days <span className="text-red-500">*</span></label>
                                                    <input type="number" id="lt_default_days" name="default_days" value={currentLeaveType.default_days} onChange={handleLeaveTypeChange} required min="0" className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3"/>
                                                  </div>
                                                <div className="md:col-span-3">
                                                    <label htmlFor="lt_description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                     <input type="text" id="lt_description" name="description" value={currentLeaveType.description} onChange={handleLeaveTypeChange} className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3" />
                                                 </div>
                                             </div>
                                         {/* Buttons */}
                                          <div className="mt-4 flex justify-end space-x-3">
                                              <button type="button" onClick={() => setShowFormState('leaveType', false)} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><FiX className="mr-2 -ml-1 h-5 w-5" />Cancel</button>
                                              <button type="submit" disabled={submitting.leaveType || !currentLeaveType.name || currentLeaveType.default_days===undefined} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"><FiSave className="mr-2 -ml-1 h-5 w-5" />{submitting.leaveType ? 'Saving...' : 'Save'}</button>
                                           </div>
                                       </form>
                                   </div>
                             )}
                              {renderLoadingOrEmpty(loading.leaveTypes, leaveTypes, 'Leave Types', <FiCalendar className="mx-auto h-12 w-12 text-gray-300" />) || (
                                 <div className="overflow-x-auto">
                                      <table className="min-w-full divide-y divide-gray-200">
                                          <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Default Days</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th><th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th></tr></thead>
                                          <tbody className="bg-white divide-y divide-gray-200">
                                              {leaveTypes.map((type) => (
                                                 <tr key={type.id}>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{type.name}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{type.default_days}</td>
                                                      <td className="px-6 py-4 text-sm text-gray-500">{type.description || '-'}</td>
                                                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><button onClick={() => editLeaveType(type)} className="text-indigo-600 hover:text-indigo-900"><FiEdit className="h-5 w-5" /></button></td>
                                                 </tr>
                                             ))}
                                         </tbody>
                                     </table>
                                 </div>
                             )}
                         </div>
                     )}
                </div>
            </div>
        </SupervisorLayout>
    );
};

export default Settings;