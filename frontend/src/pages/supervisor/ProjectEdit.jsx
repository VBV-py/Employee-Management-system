// src/pages/supervisor/ProjectEdit.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SupervisorLayout from '../../components/layouts/SupervisorLayout.jsx';
import api from '../../services/api.js';
import { FiSave, FiX, FiLoader, FiArrowLeft } from 'react-icons/fi';

const ProjectEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [project, setProject] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'planning'
    });
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjectData = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await api.get(`/projects/${id}`);
                const projectData = response.data.project;
                // Format dates for input fields
                setProject({
                    ...projectData,
                    start_date: projectData.start_date ? projectData.start_date.split('T')[0] : '',
                    end_date: projectData.end_date ? projectData.end_date.split('T')[0] : ''
                });
            } catch (err) {
                console.error('Error fetching project data:', err);
                setError('Failed to load project data. Please try again.');
                if (err.response?.status === 404) {
                    navigate('/supervisor/projects'); // Redirect if not found
                }
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [id, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProject(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            // Prepare data for PATCH request (only send necessary fields)
            const updateData = {
                name: project.name,
                description: project.description,
                start_date: project.start_date || null, // Send null if empty
                end_date: project.end_date || null,     // Send null if empty
                status: project.status
            };

            await api.patch(`/projects/${id}`, updateData);
            alert('Project updated successfully!');
            navigate(`/supervisor/projects/${id}`); // Navigate back to details view
        } catch (err) {
            console.error('Error updating project:', err);
            setError(err.response?.data?.message || 'Failed to update project.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SupervisorLayout>
                <div className="flex justify-center items-center h-64">
                    <FiLoader className="animate-spin h-12 w-12 text-primary-500" />
                </div>
            </SupervisorLayout>
        );
    }

    return (
        <SupervisorLayout>
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                  <Link
                    to={`/supervisor/projects/${id}`}
                    className="mr-4 text-gray-600 hover:text-gray-900"
                  >
                    <FiArrowLeft className="h-5 w-5" />
                  </Link>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">Edit Project</h1>
                    <p className="text-gray-600">Update details for: {project?.name || '...'}</p>
                 </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={project.name}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        />
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={project.description}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="start_date"
                                name="start_date"
                                value={project.start_date}
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
                                value={project.end_date}
                                min={project.start_date} // Prevent end date being before start date
                                onChange={handleInputChange}
                                className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                            Status <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="status"
                            name="status"
                            required
                            value={project.status}
                            onChange={handleInputChange}
                            className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        >
                            <option value="planning">Planning</option>
                            <option value="in-progress">In Progress</option>
                            <option value="on-hold">On Hold</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <Link
                            to={`/supervisor/projects/${id}`}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <FiX className="mr-2 -ml-1 h-5 w-5" />
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting || loading || !project.name}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                            ): (
                                <FiSave className="-ml-1 mr-2 h-5 w-5" />
                            )}
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </SupervisorLayout>
    );
};

export default ProjectEdit;