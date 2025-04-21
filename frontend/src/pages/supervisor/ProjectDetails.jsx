// src/pages/supervisor/ProjectDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';
import { 
  FiBriefcase, 
  FiCalendar, 
  FiUser, 
  FiEdit, 
  FiUserPlus, 
  FiUserX, 
  FiArrowLeft,
  FiCheck,
  FiX
} from 'react-icons/fi';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [newMember, setNewMember] = useState({
    employee_id: '',
    role: '',
    start_date: '',
    end_date: ''
  });
  
  useEffect(() => {
    const fetchProjectDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/projects/${id}`);
        setProject(response.data.project);
        setMembers(response.data.members);
      } catch (error) {
        console.error('Error fetching project details:', error);
        if (error.response?.status === 404) {
          navigate('/supervisor/projects');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectDetails();
  }, [id, navigate]);
  
  const fetchAvailableEmployees = async () => {
    try {
      // Get all employees not already in the project
      const response = await api.get('/employees', { params: { limit: 100 } });
      const currentMemberIds = members.map(member => member.employee_id);
      const filtered = response.data.employees.filter(emp => 
        !currentMemberIds.includes(emp.id) && emp.is_active
      );
      setAvailableEmployees(filtered);
      
      // Set default employee if available
      if (filtered.length > 0) {
        setNewMember(prev => ({
          ...prev,
          employee_id: filtered[0].id
        }));
      }
    } catch (error) {
      console.error('Error fetching available employees:', error);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitNewMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await api.post(`/projects/${id}/assign`, newMember);
      
      // Refresh project members
      const response = await api.get(`/projects/${id}`);
      setMembers(response.data.members);
      
      // Reset form
      setNewMember({
        employee_id: '',
        role: '',
        start_date: '',
        end_date: ''
      });
      
      setShowAddMemberForm(false);
    } catch (error) {
      console.error('Error adding member to project:', error);
      alert(error.response?.data?.message || 'Error adding member to project');
    } finally {
      setSubmitting(false);
    }
  };
  
  const removeMember = async (assignmentId) => {
    if (!confirm('Are you sure you want to remove this member from the project?')) return;
    
    try {
      await api.delete(`/projects/${id}/assignments/${assignmentId}`);
      
      // Update local state
      setMembers(members.filter(member => member.assignment_id !== assignmentId));
    } catch (error) {
      console.error('Error removing member from project:', error);
      alert(error.response?.data?.message || 'Error removing member from project');
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-purple-100 text-purple-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
            to="/supervisor/projects"
            className="mr-4 text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Project Details</h1>
            <p className="text-gray-600">View and manage project information</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Link
            to={`/supervisor/projects/${id}/edit`}
            className="px-4 py-2 flex items-center text-indigo-600 bg-indigo-50 rounded-md hover:bg-indigo-100"
          >
            <FiEdit className="h-4 w-4 mr-2" />
            Edit Project
          </Link>
        </div>
      </div>
      
      {/* Project Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">{project.name}</h2>
          <span className={`px-2.5 py-1 inline-flex items-center rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Description</h3>
          <p className="text-gray-700">
            {project.description || 'No description provided.'}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-blue-100 mr-3">
                <FiCalendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Start Date</p>
                <p className="font-medium">
                  {project.start_date ? format(new Date(project.start_date), 'MMMM d, yyyy') : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-purple-100 mr-3">
                <FiCalendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">End Date</p>
                <p className="font-medium">
                  {project.end_date ? format(new Date(project.end_date), 'MMMM d, yyyy') : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-green-100 mr-3">
                <FiUser className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Team Size</p>
                <p className="font-medium">{members.length} members</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="rounded-full p-2 bg-yellow-100 mr-3">
                <FiBriefcase className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium">{format(new Date(project.created_at), 'MMMM d, yyyy')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Team Members */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiUser className="mr-2" /> Team Members
          </h3>
          <button 
            onClick={() => {
              setShowAddMemberForm(!showAddMemberForm);
              if (!showAddMemberForm) {
                fetchAvailableEmployees();
              }
            }}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          >
            {showAddMemberForm ? (
              <>
                <FiX className="mr-2" /> Cancel
              </>
            ) : (
              <>
                <FiUserPlus className="mr-2" /> Add Member
              </>
            )}
          </button>
        </div>
        
        {showAddMemberForm && (
          <div className="bg-gray-50 p-6 mb-6 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-4">Add Team Member</h4>
            <form onSubmit={handleSubmitNewMember}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700 mb-1">
                    Employee
                  </label>
                  <select
                    id="employee_id"
                    name="employee_id"
                    value={newMember.employee_id}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  >
                    {availableEmployees.length === 0 ? (
                      <option value="">No available employees</option>
                    ) : (
                      availableEmployees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.first_name} {employee.last_name} ({employee.designation_name})
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role in Project
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={newMember.role}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    placeholder="e.g., Developer, Designer, Tester"
                  />
                </div>
                
                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={newMember.start_date}
                    onChange={handleInputChange}
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
                    value={newMember.end_date}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    min={newMember.start_date}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || !newMember.employee_id || !newMember.role || availableEmployees.length === 0}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {submitting ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <FiCheck className="mr-2" />
                      Add Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {members.length === 0 ? (
          <div className="text-center py-8">
            <FiUser className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-4">
              This project doesn't have any team members assigned to it yet.
            </p>
            {!showAddMemberForm && (
              <button 
                onClick={() => {
                  setShowAddMemberForm(true);
                  fetchAvailableEmployees();
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiUserPlus className="mr-2" />
                Add Your First Team Member
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <div key={member.assignment_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {member.profile_image ? (
                      <img 
                        src={`${import.meta.env.VITE_APP_API_URL}${member.profile_image}`} 
                        alt={`${member.first_name} ${member.last_name}`}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-medium">{member.first_name.charAt(0)}{member.last_name.charAt(0)}</span>
                      </div>
                    )}
                    <div className="ml-3">
                      <h4 className="font-medium text-gray-900">{member.first_name} {member.last_name}</h4>
                      <p className="text-sm text-gray-500">{member.department}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMember(member.assignment_id)}
                    className="text-red-500 hover:text-red-700"
                    title="Remove from project"
                  >
                    <FiUserX className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mt-3 pl-13">
                  <div className="bg-gray-100 rounded px-2 py-1 inline-block text-sm text-gray-700 font-medium">
                    {member.role}
                  </div>
                  
                  {(member.start_date || member.end_date) && (
                    <div className="mt-2 text-xs text-gray-500">
                      {member.start_date && (
                        <div>Start: {format(new Date(member.start_date), 'MMM d, yyyy')}</div>
                      )}
                      {member.end_date && (
                        <div>End: {format(new Date(member.end_date), 'MMM d, yyyy')}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SupervisorLayout>
  );
};

export default ProjectDetails;