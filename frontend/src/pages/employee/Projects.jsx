// src/pages/employee/Projects.jsx
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';
import { FiBriefcase, FiClock, FiUser, FiCalendar, FiCheckCircle } from 'react-icons/fi';

const Projects = () => {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const response = await api.get('/projects');
        setProjects(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching projects:', error);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const fetchProjectDetails = async (id) => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProjectDetails(response.data);
    } catch (error) {
      console.error('Error fetching project details:', error);
    }
  };

  const handleProjectClick = (project) => {
    setSelectedProject(project);
    fetchProjectDetails(project.id);
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
        <h1 className="text-2xl font-bold text-gray-800">My Projects</h1>
        <p className="text-gray-600">View your assigned projects</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <FiBriefcase className="mr-2" /> Assigned Projects
              </h3>
            </div>

            <div className="overflow-y-auto max-h-[600px]">
              {projects.length === 0 ? (
                <div className="p-6 text-center text-gray-600">
                  No projects assigned to you yet.
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {projects.map((project) => (
                    <li key={project.id}>
                      <button
                        className={`w-full text-left p-4 hover:bg-gray-50 ${
                          selectedProject && selectedProject.id === project.id ? 'bg-primary-50' : ''
                        }`}
                        onClick={() => handleProjectClick(project)}
                      >
                        <div className="flex justify-between">
                        <p className="font-medium text-gray-900">{project.name}</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              project.status
                            )}`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">Role: {project.assignment_role}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedProject && projectDetails ? (
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">{projectDetails.project.name}</h3>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      projectDetails.project.status
                    )}`}
                  >
                    {projectDetails.project.status}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Project Details</h4>
                  <p className="text-gray-700 mb-4">{projectDetails.project.description || 'No description available.'}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center">
                      <FiCalendar className="text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-gray-700">{projectDetails.project.start_date ? 
                          format(new Date(projectDetails.project.start_date), 'MMM d, yyyy') : 'Not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <FiClock className="text-gray-400 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="text-gray-700">{projectDetails.project.end_date ? 
                          format(new Date(projectDetails.project.end_date), 'MMM d, yyyy') : 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Team Members</h4>
                  {projectDetails.members.length === 0 ? (
                    <p className="text-gray-600">No team members assigned to this project yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {projectDetails.members.map((member) => (
                        <div key={member.assignment_id} className="flex items-center bg-gray-50 p-3 rounded-lg">
                          {member.profile_image ? (
                            <img
                              src={`${import.meta.env.VITE_APP_API_URL}${member.profile_image}`}
                              alt={`${member.first_name} ${member.last_name}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
                              {member.first_name.charAt(0)}
                              {member.last_name.charAt(0)}
                            </div>
                          )}
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {member.first_name} {member.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{member.role}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm h-full flex items-center justify-center p-12 text-center">
              <div>
                <FiBriefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Project Selected</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Select a project from the list to view its details, team members, and your role in it.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </EmployeeLayout>
  );
};

export default Projects;