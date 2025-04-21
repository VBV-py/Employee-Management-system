// src/pages/supervisor/Projects.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';
import { 
  FiBriefcase, 
  FiCalendar, 
  FiUsers, 
  FiEdit,
  FiPlus,
  FiSearch,
  FiFilter
} from 'react-icons/fi';

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  
  // Filters
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });

  // New project modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    status: 'planning'
  });
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchProjects();
  }, [filters.status, filters.search]);
  
  const fetchProjects = async () => {
    setLoading(true);
    try {
      // In a real application, you would include search and filter parameters
      const response = await api.get('/projects');
      
      let filteredProjects = response.data || [];
      
      // Apply client-side filtering (in a real app, this would be done on the server)
      if (filters.status) {
        filteredProjects = filteredProjects.filter(project => project.status === filters.status);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProjects = filteredProjects.filter(project => 
          project.name.toLowerCase().includes(searchLower) || 
          (project.description && project.description.toLowerCase().includes(searchLower))
        );
      }
      
      setProjects(filteredProjects);
    } catch (error) {
      console.error('Error fetching projects:', error);
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
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmitNewProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await api.post('/projects', newProject);
      
      // Add new project to list
      setProjects(prev => [
        {
          id: response.data.id,
          ...newProject,
          total_members: 0
        },
        ...prev
      ]);
      
      // Reset form
      setNewProject({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'planning'
      });
      
      setShowAddModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert(error.response?.data?.message || 'Error creating project');
    } finally {
      setSubmitting(false);
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
  
  if (loading && projects.length === 0) {
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600">Manage and track all projects</p>
        </div>
        
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          <FiPlus className="mr-2 -ml-1 h-5 w-5" />
          New Project
        </button>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Projects
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="search"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Search by project name or description"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status Filter
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="planning">Planning</option>
              <option value="in-progress">In Progress</option>
              <option value="on-hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FiBriefcase className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">No projects found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filters.search || filters.status 
              ? "No projects match your search criteria. Try adjusting your filters."
              : "Get started by creating your first project."}
          </p>
          {!filters.search && !filters.status && (
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            >
              <FiPlus className="mr-2 -ml-1 h-5 w-5" />
              Create First Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link 
              to={`/supervisor/projects/${project.id}`}
              key={project.id} 
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('-', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
                
                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center">
                    <FiCalendar className="mr-1 h-4 w-4" />
                    {project.start_date ? format(new Date(project.start_date), 'MMM d, yyyy') : 'Not set'}
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="mr-1 h-4 w-4" />
                    {project.total_members} member{project.total_members !== 1 && 's'}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {project.end_date 
                    ? `Due: ${format(new Date(project.end_date), 'MMM d, yyyy')}` 
                    : 'No end date set'}
                </span>
                <Link
        to={`/supervisor/projects/${project.id}/edit`} // Use the 'to' prop for the destination URL
        onClick={(e) => {
            // Prevent the click from navigating the parent Link (the whole card)
            e.stopPropagation();
        }}
        className="text-primary-600 hover:text-primary-900 p-1 rounded-full hover:bg-primary-50" // Apply same styling
        title="Edit project"
    >
        <FiEdit className="h-4 w-4" /> {/* Icon inside the Link */}
    </Link>
              </div>
            </Link>
          ))}
        </div>
      )}
      
      {/* New Project Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div>
                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Create New Project
                    </h3>
                    
                    <form onSubmit={handleSubmitNewProject} className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={newProject.name}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Enter project name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows="3"
                          value={newProject.description}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Project description (optional)"
                        ></textarea>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                            Start Date
                          </label>
                          <input
                            type="date"
                            id="start_date"
                            name="start_date"
                            value={newProject.start_date}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
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
                            value={newProject.end_date}
                            min={newProject.start_date}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select
                          id="status"
                          name="status"
                          value={newProject.status}
                          onChange={handleInputChange}
                          className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                          <option value="planning">Planning</option>
                          <option value="in-progress">In Progress</option>
                          <option value="on-hold">On Hold</option>
                          <option value="completed">Completed</option>
                        </select>
                      </div>
                      
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          disabled={submitting || !newProject.name}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm disabled:bg-gray-300"
                        >
                          {submitting ? 'Creating...' : 'Create Project'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddModal(false)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SupervisorLayout>
  );
};

export default Projects;