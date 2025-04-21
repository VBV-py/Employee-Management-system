// src/pages/employee/Documents.jsx
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout.jsx';
import api from '../../services/api.js';
import { format } from 'date-fns';
import { 
  FiFolder, 
  FiFile, 
  FiUpload, 
  FiDownload, 
  FiTrash2,
  FiX 
} from 'react-icons/fi';

const Documents = () => {
  const [loading, setLoading] = useState(true);
  const [documents, setDocuments] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [documentData, setDocumentData] = useState({
    document_type: 'Educational Certificate',
    title: '',
    file: null
  });
  
  const documentTypes = [
    'Educational Certificate',
    'Experience Certificate',
    'Identity Proof',
    'Address Proof',
    'Resume/CV',
    'Health Certificate',
    'Other'
  ];
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await api.get('/documents');
      setDocuments(response.data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDocumentData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentData(prev => ({
        ...prev,
        file: e.target.files[0]
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!documentData.file) {
      alert('Please select a file to upload.');
      return;
    }
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('document_type', documentData.document_type);
      formData.append('title', documentData.title);
      formData.append('document', documentData.file);
      
      await api.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      fetchDocuments();
      resetForm();
    } catch (error) {
      console.error('Error uploading document:', error);
      alert(error.response?.data?.message || 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };
  
  const deleteDocument = async (id) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter(doc => doc.id !== id));
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(error.response?.data?.message || 'Error deleting document');
    }
  };
  
  const resetForm = () => {
    setDocumentData({
      document_type: 'Educational Certificate',
      title: '',
      file: null
    });
    setShowUploadForm(false);
  };
  
  const getDocumentIcon = (documentType) => {
    switch (documentType) {
      case 'Educational Certificate':
        return <FiFile className="h-8 w-8 text-blue-500" />;
      case 'Experience Certificate':
        return <FiFile className="h-8 w-8 text-green-500" />;
      case 'Identity Proof':
        return <FiFile className="h-8 w-8 text-red-500" />;
      case 'Address Proof':
        return <FiFile className="h-8 w-8 text-yellow-500" />;
      case 'Resume/CV':
        return <FiFile className="h-8 w-8 text-purple-500" />;
      case 'Health Certificate':
        return <FiFile className="h-8 w-8 text-pink-500" />;
      default:
        return <FiFile className="h-8 w-8 text-gray-500" />;
    }
  };
  
  const getFileExtension = (filename) => {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase();
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
        <h1 className="text-2xl font-bold text-gray-800">My Documents</h1>
        <p className="text-gray-600">Upload and manage your documents</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <FiFolder className="mr-2" /> Documents
          </h3>
          <button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center"
          >
            {showUploadForm ? <FiX className="mr-2" /> : <FiUpload className="mr-2" />}
            {showUploadForm ? 'Cancel' : 'Upload Document'}
          </button>
        </div>
        
        {showUploadForm && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6 border border-gray-200">
            <h4 className="text-md font-medium text-gray-800 mb-4">Upload New Document</h4>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="document_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    id="document_type"
                    name="document_type"
                    value={documentData.document_type}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                  >
                    {documentTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={documentData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-md border border-gray-300 shadow-sm p-2 focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
                    placeholder="E.g., Bachelor's Degree Certificate"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                    Document File
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {documentData.file ? (
                        <div>
                          <p className="text-sm text-gray-600">
                            Selected file: <span className="font-medium">{documentData.file.name}</span> ({Math.round(documentData.file.size / 1024)} KB)
                          </p>
                          <button
                            type="button"
                            onClick={() => setDocumentData(prev => ({ ...prev, file: null }))}
                            className="mt-2 text-sm text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <>
                          <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PDF, PNG, JPG, DOCX up to 5MB
                          </p>
                          </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={uploading || !documentData.file}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      Upload Document
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {documents.length === 0 ? (
          <div className="text-center p-12">
            <FiFolder className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-4">
              You haven't uploaded any documents yet. Documents help you keep your important files organized.
            </p>
            {!showUploadForm && (
              <button 
                onClick={() => setShowUploadForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
              >
                <FiUpload className="mr-2" />
                Upload Your First Document
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((document) => (
              <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {getDocumentIcon(document.document_type)}
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-gray-900">{document.title}</h4>
                      <p className="text-xs text-gray-500">{document.document_type}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <a 
                      href={`${import.meta.env.VITE_APP_API_URL}${document.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-gray-700"
                      title="View Document"
                    >
                      <FiDownload className="h-4 w-4" />
                    </a>
                    <button 
                      onClick={() => deleteDocument(document.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete Document"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-4 pt-2 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    Uploaded: {format(new Date(document.uploaded_at), 'MMM d, yyyy')}
                  </div>
                  <div className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {getFileExtension(document.file_path)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </EmployeeLayout>
  );
};

export default Documents;