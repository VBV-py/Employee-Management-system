// src/pages/supervisor/EmployeeDetails.jsx
import React, { useState, useEffect,useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { format,startOfDay } from 'date-fns';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiBriefcase,
  FiEdit,
  FiUserX,
  FiUserCheck,
  FiArrowLeft, FiAward, FiPlus, FiTrash2, FiX, FiLoader, FiAlertCircle, FiFile, FiDownload,
  FiDollarSign,FiSave

} from 'react-icons/fi';

const EmployeeDetails = () => {
  const { id } = useParams();
  const employeeId = parseInt(id); // Added for clarity and safety
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
 
  const [additionalData, setAdditionalData] = useState({
    projects: [],
    documents: [],
    performance_reviews: [],
    attendance_summary: {}
  });
  // State specifically for skills
  const [employeeSkills, setEmployeeSkills] = useState([]);
  const todayDateString = useMemo(() => format(startOfDay(new Date()), 'yyyy-MM-dd'), []);
  // --- Default active tab is now 'skills' ---
  const [activeTab, setActiveTab] = useState('skills');
  const [error, setError] = useState(''); // Added error state



  const [showAddSalaryForm, setShowAddSalaryForm] = useState(false);
  const [newSalaryRecord, setNewSalaryRecord] = useState({ amount: '', effective_date: '', reason: '' });
  const [isAddingSalary, setIsAddingSalary] = useState(false);
  const [addSalaryError, setAddSalaryError] = useState('');
  const [percentageHike, setPercentageHike] = useState(null);

  // --- State for Adding Skills ---
  const [showAddSkillForm, setShowAddSkillForm] = useState(false);
  const [newSkill, setNewSkill] = useState({ skill_name: '', proficiency_level: 'beginner' });
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [addSkillError, setAddSkillError] = useState('');

  useEffect(() => {
    if (isNaN(employeeId)) { setError("Invalid Employee ID."); setLoading(false); return; }
    fetchEmployeeDetails(); // Initial fetch for employee details + skills etc.
  }, [employeeId]); // Only re-run if employeeId changes



  useEffect(() => {
    const fetchEmployeeDetails = async () => {
     
      if (isNaN(employeeId)) return; // Guard
         setLoading(true); // Indicate loading during refetch
         setError('');
      try {
        const response = await api.get(`/employees/${id}`);
        // console.log("API response for /employees/:id :", response.data);
        setEmployee(response.data.employee);
        setAdditionalData({
          skills: response.data.skills || [],
          projects: response.data.projects || [],
          documents: response.data.documents || [],
          performance_reviews: response.data.performance_reviews || [],
          attendance_summary: response.data.attendance_summary || {}
        });
      } catch (error) {
        console.error('Error fetching employee details:', error);
        if (error.response?.status === 404) {
          navigate('/supervisor/employees');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id, navigate,employeeId]);
  const fetchEmployeeDetails = async () => {
    setLoading(true); setError('');
    try {
        const response = await api.get(`/employees/${employeeId}`);
        if (!response.data || !response.data.employee) throw new Error(`Employee not found.`);

        setEmployee(response.data.employee);
        setEmployeeSkills(response.data.skills || []);
        setAdditionalData({
            projects: response.data.projects || [],
            documents: response.data.documents || [],
            performance_reviews: response.data.performance_reviews || [],
            attendance_summary: response.data.attendance_summary || {}
        });
    } catch (err) { console.error('Fetch Details Error:', err); setError(err.response?.data?.message || err.message || "Failed to load data."); }
    finally { setLoading(false); }
};

  const handleNewSalaryChange = (e) => {
    const { name, value } = e.target;
    setNewSalaryRecord(prev => ({ ...prev, [name]: value }));
    // Calculate percentage hike if amount changes
    if (name === 'amount' && employee?.current_salary != null && parseFloat(employee.current_salary) > 0) {
      const newAmount = parseFloat(value);
      const currentSalary = parseFloat(employee.current_salary);
      if (!isNaN(newAmount) && newAmount > 0 && currentSalary > 0) {
        const hike = (((newAmount - currentSalary) / currentSalary) * 100);
        setPercentageHike(hike.toFixed(1));
      } else { setPercentageHike(null); }
    } else if (name === 'amount') { setPercentageHike(null); }
  };

  const handleAddSalarySubmit = async (e) => {
    e.preventDefault();
    setAddSalaryError(''); // Clear previous errors

    const { amount, effective_date, reason } = newSalaryRecord;

    // --- Frontend Validation ---
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        setAddSalaryError('Please enter a valid positive salary amount.'); return;
    }
    if (!effective_date) {
        setAddSalaryError('Effective Date is required.'); return;
    }

    const selectedDate = startOfDay(new Date(effective_date + 'T00:00:00')); // Ensure comparison at start of day
    const today = startOfDay(new Date());

    if (selectedDate < today) {
        setAddSalaryError('Effective Date cannot be in the past.');
        return; 
    }
    // --- End Date Check ---

    setIsAddingSalary(true);
    try {
      const payload = {
        amount: parseFloat(newSalaryRecord.amount),
        effective_date: newSalaryRecord.effective_date,
        reason: newSalaryRecord.reason || null
      };
      const response = await api.post(`/employees/${employeeId}/salary-history`, payload);
   
      await fetchEmployeeDetails();
      setEmployee(prev => ({ ...prev, current_salary: payload.amount }));
      setShowAddSalaryForm(false);
      setNewSalaryRecord({ amount: '', effective_date: '', reason: '' }); // Reset form
      setPercentageHike(null); // Reset hike display
    } catch (error) {
      console.error('Error adding salary record:', error);
      setAddSalaryError(error.response?.data?.message || 'Failed to add salary record.');
    } finally { setIsAddingSalary(false); }
  };

  const formatCurrency = (amount) => { if (amount == null || isNaN(amount)) return '-'; return parseFloat(amount).toLocaleString('en-US', { style: 'currency', currency: 'INR' }); };

  const toggleEmployeeStatus = async () => {
    try {
      await api.patch(`/employees/${id}/status`, {
        is_active: !employee.is_active
      });

      // Update local state
      setEmployee({
        ...employee,
        is_active: !employee.is_active
      });
    } catch (error) {
      console.error('Error toggling employee status:', error);
      alert(error.response?.data?.message || 'Error changing employee status');
    }
  };
  const handleNewSkillChange = (e) => {
    const { name, value } = e.target;
    setNewSkill(prev => ({ ...prev, [name]: value }));
  };
  const handleAddSkillSubmit = async (e) => {
    e.preventDefault();
    if (!newSkill.skill_name || !newSkill.skill_name.trim()) {
      setAddSkillError('Skill name cannot be empty.'); return;
    }
    setIsAddingSkill(true); setAddSkillError('');
    try {
      const payload = {
        skill_name: newSkill.skill_name.trim(),
        proficiency_level: newSkill.proficiency_level
      };
      const response = await api.post(`/employees/${employeeId}/skills`, payload); // Using correct endpoint
      // Optimistic update: Add response data to ensure we have the correct ids
      setEmployeeSkills(prevSkills => {
        if (!prevSkills.some(s => s.employee_skill_id === response.data.addedSkill.employee_skill_id)) {
          return [...prevSkills, response.data.addedSkill];
        }
        return prevSkills; // Avoid adding duplicate if already added somehow
      });
      setShowAddSkillForm(false);
      setNewSkill({ skill_name: '', proficiency_level: 'beginner' }); // Reset form
    } catch (error) {
      console.error('Error adding skill:', error);
      setAddSkillError(error.response?.data?.message || 'Failed to add skill.');
    } finally { setIsAddingSkill(false); }
  };
  const handleRemoveSkill = async (employeeSkillIdToRemove) => {
    if (!confirm('Are you sure you want to remove this skill?')) return;

    try {
      await api.delete(`/employees/${employeeId}/skills/${employeeSkillIdToRemove}`); // Using correct endpoint
      setEmployeeSkills(prevSkills => prevSkills.filter(skill => skill.employee_skill_id !== employeeSkillIdToRemove));
    } catch (error) {
      console.error('Error removing skill:', error);
      alert(error.response?.data?.message || 'Failed to remove skill.');
    }
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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/supervisor/employees"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Employee Profile</h1>
            <p className="text-gray-600">View and manage employee details</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/supervisor/employees/${id}/edit`}
            className="px-4 py-2 flex items-center text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
          >
            <FiEdit className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <button
            onClick={toggleEmployeeStatus}
            className={`px-4 py-2 flex items-center rounded-md ${employee.is_active
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-green-600 bg-green-50 hover:bg-green-100'
              }`}
          >
            {employee.is_active ? (
              <>
                <FiUserX className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <FiUserCheck className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </button>
        </div>
      </div>

      {/* Employee Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 flex flex-col sm:flex-row gap-6">
        <div className="sm:w-1/3 flex flex-col items-center">
          {employee.profile_image ? (
            <img
              src={`${import.meta.env.VITE_APP_API_URL}${employee.profile_image}`}
              alt={`${employee.first_name} ${employee.last_name}`}
              className="h-48 w-48 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div className="h-48 w-48 rounded-full bg-primary-100 flex items-center justify-center shadow-md">
              <span className="text-5xl text-primary-600 font-semibold">
                {employee.first_name.charAt(0)}{employee.last_name.charAt(0)}
              </span>
            </div>
          )}

          <h2 className="mt-4 text-xl font-bold text-center">
            {employee.first_name} {employee.last_name}
          </h2>
          <p className="text-gray-600 text-center">{employee.designation_name}</p>
          <p className="mt-1 text-sm text-center text-gray-500">{employee.employee_id}</p>

          <div className="mt-4 w-full">
            <span className={`block w-full text-center py-1 rounded-full text-xs font-medium ${employee.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
              {employee.is_active ? 'Active' : 'Inactive'}
            </span>

            {employee.is_supervisor ? (
              <span className="block w-full text-center py-1 mt-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                Supervisor
              </span>
            ) : null}
          </div>
        </div>

        <div className="sm:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div className="rounded-full p-2 bg-blue-100 mr-3">
              <FiMail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="font-medium">{employee.email}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="rounded-full p-2 bg-green-100 mr-3">
              <FiPhone className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="font-medium">{employee.phone || 'Not specified'}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="rounded-full p-2 bg-purple-100 mr-3">
              <FiUsers className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Department</p>
              <p className="font-medium">{employee.department_name}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="rounded-full p-2 bg-yellow-100 mr-3">
              <FiBriefcase className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Role</p>
              <p className="font-medium">{employee.role_name}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="rounded-full p-2 bg-pink-100 mr-3">
              <FiCalendar className="h-5 w-5 text-pink-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Hire Date</p>
              <p className="font-medium">{format(new Date(employee.hire_date), 'MMMM d, yyyy')}</p>
            </div>
          </div>

          <div className="flex items-center">
            <div className="rounded-full p-2 bg-indigo-100 mr-3">
              <FiCalendar className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Birth Date</p>
              <p className="font-medium">
                {employee.birth_date ? format(new Date(employee.birth_date), 'MMMM d, yyyy') : 'Not specified'}
              </p>
            </div>
          </div>

          {employee.address && (
            <div className="flex items-start md:col-span-2">
              <div className="rounded-full p-2 bg-gray-100 mr-3 mt-1">
                <FiMapPin className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-medium">{employee.address}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8  overflow-x-auto">
          <button
            className={`pb-4 px-1 ${activeTab === 'skills'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } font-medium text-sm`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'projects'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } font-medium text-sm`}
            onClick={() => setActiveTab('projects')}
          >
            Projects
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'attendance'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } font-medium text-sm`}
            onClick={() => setActiveTab('attendance')}
          >
            Attendance & Leaves
          </button>
          <button
            className={`pb-4 px-1 ${activeTab === 'documents'
              ? 'border-b-2 border-primary-500 text-primary-600'
              : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } font-medium text-sm`}
            onClick={() => setActiveTab('documents')}
          >
            Documents
          </button>
          <button onClick={() => setActiveTab('compensation')} className={`pb-4 px-1 whitespace-nowrap ${activeTab === 'compensation' ? 'border-b-2 border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} font-medium text-sm`}> Compensation </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-lg shadow-sm p-6 min-h-[250px]">
        {/* --- RENAMED: Condition changed from 'profile' to 'skills' --- */}
        {activeTab === 'skills' && (
          <div>
            {/* --- Skills Section UI Placed Here --- */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <FiAward className="mr-2 text-blue-500" /> Skills & Proficiency
              </h3>
              <button
                onClick={() => { setShowAddSkillForm(prev => !prev); setAddSkillError(''); }}
                className={`inline-flex items-center px-3  py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${showAddSkillForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'text-white bg-primary-600 hover:bg-primary-700'}`}
              >
                {showAddSkillForm ? <FiX className="h-4 w-4 mr-1" /> : <FiPlus className="h-4 w-4 hr-1" />}
                {showAddSkillForm ? 'Cancel' : 'Add Skill'}
              </button>
            </div>

            {/* Add Skill Form */}
            {showAddSkillForm && (
              <form onSubmit={handleAddSkillSubmit} className="mb-6 p-4 bg-gray-50 rounded-md border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* Skill Name Input */}
                  <div className="md:col-span-1">
                    <label htmlFor="skill_name" className="block text-sm font-medium text-gray-700 mb-1">Skill Name <span className="text-red-500">*</span></label>
                    <input type="text" id="skill_name" name="skill_name" value={newSkill.skill_name} onChange={handleNewSkillChange} required className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3 text-sm" placeholder="e.g., Communication" />
                  </div>
                  {/* Proficiency Select */}
                  <div>
                    <label htmlFor="proficiency_level" className="block text-sm font-medium text-gray-700 mb-1">Proficiency</label>
                    <select id="proficiency_level" name="proficiency_level" value={newSkill.proficiency_level} onChange={handleNewSkillChange} required className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3 text-sm">
                      <option value="beginner">Beginner</option> <option value="intermediate">Intermediate</option> <option value="advanced">Advanced</option> <option value="expert">Expert</option>
                    </select>
                  </div>
                  {/* Submit Button */}
                  <div>
                    <button type="submit" disabled={isAddingSkill || !newSkill.skill_name.trim()} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 w-full">
                      {isAddingSkill ? (<FiLoader className="animate-spin mr-2" />) : (<FiPlus className="mr-1" />)} {isAddingSkill ? 'Adding...' : 'Add Skill'}
                    </button>
                  </div>
                </div>
                {addSkillError && <p className="text-red-600 text-sm mt-2">{addSkillError}</p>}
              </form>
            )}

            {/* Display Employee Skills (Using original profile tab UI) */}
            {!loading && (!additionalData.skills || additionalData.skills.length === 0) ? (
              <p className="text-gray-500 italic">No skills recorded for this employee.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(additionalData.skills || []).map((skill) => (
                  // Using employee_skill_id which should be returned from backend
                  <div key={skill.employee_skill_id || skill.id} className="relative bg-gray-50 rounded-lg p-4 group border border-gray-100">
                    {/* Display skill_name - check your API response structure if this is correct */}
                    <h4 className="font-medium text-gray-800">{skill.skill_name || skill.name}</h4>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="w-full">
                        {/* Proficiency Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${skill.proficiency_level === 'expert' ? 'bg-green-500 w-full' : skill.proficiency_level === 'advanced' ? 'bg-blue-500 w-3/4' : skill.proficiency_level === 'intermediate' ? 'bg-yellow-500 w-1/2' : 'bg-red-500 w-1/4'}`}></div>
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-gray-500 capitalize">{skill.proficiency_level}</span>

                        </div>
                      </div>
                    </div>
                    {/* Delete Button */}
                    <button onClick={() => handleRemoveSkill(skill.employee_skill_id)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-red-100" title="Remove Skill">
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

        {activeTab === 'projects' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Assigned Projects</h3>
            {additionalData.projects.length === 0 ? (
              <p className="text-gray-500">No projects assigned to this employee.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {additionalData.projects.map((project) => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.project_name}</h4>
                        <p className="text-sm text-gray-600 mt-1">Role: {project.role}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.project_status === 'completed' ? 'bg-green-100 text-green-800' :
                          project.project_status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            project.project_status === 'planning' ? 'bg-purple-100 text-purple-800' :
                              project.project_status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                        }`}>
                        {project.project_status}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Start:</span>{' '}
                        {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not specified'}
                      </div>
                      <div className="mx-2">|</div>
                      <div>
                        <span className="font-medium">End:</span>{' '}
                        {project.end_date ? format(new Date(project.end_date), 'MMM d, yyyy') : 'Not specified'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Present</p>
                <p className="text-2xl font-bold text-green-600">
                  {additionalData.attendance_summary?.present_count || 0}
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Late</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {additionalData.attendance_summary?.late_count || 0}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Absent</p>
                <p className="text-2xl font-bold text-red-600">
                  {additionalData.attendance_summary?.absent_count || 0}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">On Leave</p>
                <p className="text-2xl font-bold text-blue-600">
                  {additionalData.attendance_summary?.leave_count || 0}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Leave Information</h3>
              <Link
                to={`/supervisor/leaves?employee_id=${employee.id}`}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View Leave History →
              </Link>
            </div>
            <Link
              to={`/supervisor/attendance?employee_id=${employee.id}`}
              className="mt-4 inline-block text-sm text-primary-600 hover:text-primary-700"
            >
              View Detailed Attendance →
            </Link>
          </div>
        )}

        {activeTab === 'documents' && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Employee Documents</h3>
            {additionalData.documents.length === 0 ? (
              <p className="text-gray-500">No documents uploaded for this employee.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {additionalData.documents.map((document) => (
                  <div key={document.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start">
                      <div className="rounded-full p-2 bg-primary-100 mr-3">
                        <FiFile className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{document.title}</h4>
                        <p className="text-sm text-gray-600">{document.document_type}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded: {format(new Date(document.uploaded_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <a
                        href={`${import.meta.env.VITE_APP_API_URL}${document.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <FiDownload className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {/* --- Compensation Tab --- */}
        {activeTab === 'compensation' && (
                     <div>
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="text-lg font-medium text-gray-900 flex items-center"> <FiDollarSign className="mr-2 text-green-500" /> Salary Management </h3>
                                {/* Button to toggle Add Salary form */}
                                <button onClick={() => {setShowAddSalaryForm(prev => !prev); setAddSalaryError('');}} className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm ${showAddSalaryForm ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'text-white bg-green-600 hover:bg-green-700'}`}>
                                    {showAddSalaryForm ? <FiX className="h-4 w-4 mr-1"/> : <FiPlus className="h-4 w-4 mr-1" />} {showAddSalaryForm ? 'Cancel Entry' : 'Add Salary Entry'}
                                </button>
                            </div>

                            {/* Current Salary Display (Hide if Manager viewing self - Replace ROLE_ID 2 C with your Manager Role ID) */}
                           {/* {!(loggedInUser?.id === employeeId && loggedInUser?.role_id === 2) && ( */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                                 <p className="text-sm text-blue-700">Current Salary (Annual)</p>
                                 <p className="text-xl font-semibold text-blue-800">{formatCurrency(employee?.current_salary)}</p>
                                 {employee?.current_salary == null && <p className="text-xs text-gray-500 italic mt-1">No salary set.</p>}
                            </div>
                           {/* )} */}


                           {/* Add Salary Form */}
                           {showAddSalaryForm && (
                                <form onSubmit={handleAddSalarySubmit} className="mb-6 p-4 bg-green-50 rounded-md border border-green-200">
                                   <h4 className="text-md font-medium text-gray-800 mb-4">Add New Salary Record</h4>
                                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start"> {/* Changed items-end */}
                                       {/* Amount Input */}
                                        <div className="md:col-span-1">
                                           <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">New Amount (Annual) <span className="text-red-500">*</span></label>
                                            <input type="number" step="0.01" min="0" id="amount" name="amount" value={newSalaryRecord.amount} onChange={handleNewSalaryChange} required className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3 text-sm" placeholder="e.g., 65000.00" />
                                            {/* Percentage Hike Display */}
                                            {percentageHike !== null && employee?.current_salary != null && (
                                               <p className={`text-xs mt-1 ${percentageHike >= 0 ? 'text-green-600' : 'text-red-600'}`}> Hike: {percentageHike >= 0 ? '+' : ''}{percentageHike}% </p>
                                             )}
                                        </div>
                                       {/* Effective Date Input */}
                                       <div>
                                            <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700 mb-1">Effective Date <span className="text-red-500">*</span></label>
                                             <input type="date" id="effective_date" name="effective_date" value={newSalaryRecord.effective_date} onChange={handleNewSalaryChange} required min={todayDateString} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3 text-sm" />
                                         </div>
                                        {/* Reason Input */}
                                         <div className="md:col-span-3">
                                             <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason / Note</label>
                                             <input type="text" id="reason" name="reason" value={newSalaryRecord.reason} disabled={isAddingSalary || !newSalaryRecord.amount || !newSalaryRecord.effective_date || newSalaryRecord.effective_date < todayDateString} onChange={handleNewSalaryChange} className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 py-2 px-3 text-sm" placeholder="e.g., Annual Review, Promotion" />
                                         </div>
                                        {/* Submit Button */}
                                         <div className="md:col-span-3 flex justify-end mt-2"> {/* Added mt-2 */}
                                             <button type="submit" disabled={isAddingSalary || !newSalaryRecord.amount || !newSalaryRecord.effective_date} className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50">
                                                  {isAddingSalary ? <FiLoader className="animate-spin mr-2"/> : <FiSave className="mr-1 mt-[0.1rem] h-4 w-4"/>} {isAddingSalary ? 'Saving...' : 'Save Salary'}
                                             </button>
                                          </div>
                                     </div>
                                     {addSalaryError && <p className="text-red-600 text-sm mt-2">{addSalaryError}</p>}
                              </form>
                           )}

                           {/* Salary History Table */}
                            
                      </div>
                  )}


            </div>
        </SupervisorLayout>
  );
};

export default EmployeeDetails;