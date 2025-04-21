// src/pages/employee/Profile.jsx
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout.jsx'; // Correct Layout
import api from '../../services/api.js';
import { format } from 'date-fns';
import {
    // Icons from original form
    FiUser, FiPhone, FiMapPin, FiUpload, FiSave, FiLoader,
    // Icons needed for display
    FiMail, FiCalendar, FiBriefcase, FiUsers, FiAward, FiAlertCircle, // Added Award, AlertCircle
    FiSmile // Added for Gender/DOB
} from 'react-icons/fi';

const Profile = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState(null); // Holds ALL profile data
    const [skills, setSkills] = useState([]);    // Holds skills specifically
    const [formData, setFormData] = useState({ // Holds ONLY editable fields
        phone: '',
        address: '',
        emergency_contact: '',
        profile_image: null
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [error, setError] = useState(''); // Added error state

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            setError('');
            try {
                // Use /employees/me to get full details including skills
                const response = await api.get('/employees/me');

                if (!response.data || !response.data.employee) {
                     throw new Error("Could not fetch profile data.");
                }

                const userData = response.data.employee;
                 const userSkills = response.data.skills || []; // Get skills

                setProfile(userData); // Store all fetched data
                setSkills(userSkills); // Store skills separately

                // Set initial EDITABLE form data
                setFormData({
                    phone: userData.phone || '',
                    address: userData.address || '',
                    emergency_contact: userData.emergency_contact || '',
                    profile_image: null // Always reset file input state
                });

                if (userData.profile_image) {
                    setPreviewImage(`${import.meta.env.VITE_APP_API_URL}${userData.profile_image}`);
                } else {
                    setPreviewImage(null);
                }

            } catch (err) {
                console.error('Error fetching profile data:', err);
                setError(err.response?.data?.message || err.message || 'Failed to load profile.');
             } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, []); // Fetch only on initial load

    const handleInputChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 5 * 1024 * 1024) { alert("File too large (max 5MB)"); return; }
            setFormData(prev => ({ ...prev, profile_image: file }));
            const reader = new FileReader();
            reader.onloadend = () => { setPreviewImage(reader.result); };
            reader.readAsDataURL(file);
        }
    };

    // handleSubmit remains mostly the same, sends only editable fields
    const handleSubmit = async (e) => {
         e.preventDefault();
         setSaving(true); setError('');
         try {
             const formPayload = new FormData();
             let changesMade = false;

             // Only append changed ALLOWED fields
             if (formData.phone !== (profile?.phone || '')) { formPayload.append('phone', formData.phone); changesMade = true; }
             if (formData.address !== (profile?.address || '')) { formPayload.append('address', formData.address); changesMade = true; }
             if (formData.emergency_contact !== (profile?.emergency_contact || '')) { formPayload.append('emergency_contact', formData.emergency_contact); changesMade = true; }
             if (formData.profile_image instanceof File) { // Check if it's actually a File object
                 formPayload.append('profileImage', formData.profile_image); changesMade = true;
             }


             if (changesMade) {
                // Endpoint is correct: PATCH /employees/me resolves on backend
                 const response = await api.patch('/employees/me', formPayload, { headers: { 'Content-Type': 'multipart/form-data' } });

                 // Update profile state with the newly saved data from response
                 setProfile(prev => ({...prev, ...(response.data.updated || {})}));

                 // Update form state to reflect saved data & clear file input
                  setFormData(prev => ({
                     ...prev,
                     phone: response.data.updated?.phone ?? prev.phone,
                     address: response.data.updated?.address ?? prev.address,
                     emergency_contact: response.data.updated?.emergency_contact ?? prev.emergency_contact,
                     profile_image: null
                  }));

                 // Update preview image if it changed
                 if (response.data.updated?.profile_image) {
                     setPreviewImage(`${import.meta.env.VITE_APP_API_URL}${response.data.updated.profile_image}`);
                 }

                 alert('Profile updated successfully!');
             } else {
                 // If only profile image was selected but nothing else changed,
                 // reset the file input state and preview
                 if (formData.profile_image instanceof File) {
                     setFormData(prev => ({...prev, profile_image: null}));
                     setPreviewImage(profile?.profile_image ? `${import.meta.env.VITE_APP_API_URL}${profile.profile_image}` : null);
                 }
                 alert('No changes detected to save.');
             }
         } catch (err) {
             console.error('Error updating profile:', err);
             setError(err.response?.data?.message || 'Error updating profile');
             // Reset preview on error if file was selected
             if (formData.profile_image instanceof File) {
                setPreviewImage(profile?.profile_image ? `${import.meta.env.VITE_APP_API_URL}${profile.profile_image}` : null);
                 setFormData(prev => ({...prev, profile_image: null}));
             }
         } finally { setSaving(false); }
     };

    // --- Loading and Error States ---
    if (loading) {
        return ( <EmployeeLayout><div className="flex justify-center items-center h-64"><FiLoader className="animate-spin h-12 w-12 text-primary-500" /></div></EmployeeLayout> );
    }
    if (!profile && !loading) { // Check after loading finishes
        return ( <EmployeeLayout> <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3"> <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" /> <p className="text-sm text-red-700">{error || 'Could not load profile data.'}</p> </div> </EmployeeLayout> );
    }
     // Extra guard if profile somehow still null
     if (!profile) return <EmployeeLayout><div>Loading profile details...</div></EmployeeLayout>;

    // --- Render Component ---
    return (
        <EmployeeLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-600">View and update your personal information</p>
            </div>

            {/* Error Display Area */}
            {error && !loading && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 border border-red-200 rounded flex items-center justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-700 hover:text-red-900"> <FiX size={18}/> </button>
                </div>
            )}

            {/* ** MODIFIED 2-Column Layout ** */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* --- Column 1: Profile Image & Read-only Details --- */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Profile Card */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="flex flex-col items-center text-center">
                             {/* Image/Upload */}
                             <div className="relative mb-4 group">
                                {previewImage ? (<img src={previewImage} alt={`${profile.first_name} ${profile.last_name}`} className="h-32 w-32 rounded-full object-cover border-4 border-white shadow"/>) : (<div className="h-32 w-32 rounded-full bg-primary-100 flex items-center justify-center shadow"><span className="text-3xl text-primary-600 font-semibold">{profile.first_name?.charAt(0)}{profile.last_name?.charAt(0)}</span></div>)}
                                <label htmlFor="profile_image" className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow cursor-pointer hover:bg-gray-50 transition-colors"> <FiUpload className="h-4 w-4 text-gray-600" /> <input type="file" id="profile_image" name="profile_image" onChange={handleFileChange} accept="image/*" className="sr-only"/> </label>
                             </div>
                             {/* Basic Info */}
                             <h2 className="text-xl font-bold text-gray-900">{profile.first_name} {profile.last_name}</h2>
                             <p className="text-gray-600">{profile.designation_name}</p>
                             <p className="mt-1 text-sm text-gray-500">{profile.employee_id}</p>
                        </div>
                    </div>

                     {/* Contact & Job Info Card (Read Only) */}
                     <div className="bg-white rounded-lg shadow-sm p-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">My Information</h3>
                         <div className="space-y-4">
                              {/* Displaying data from `profile` state */}
                              <div className="flex items-start"> <FiMail className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Email</p> <p className="font-medium">{profile.email}</p> </div> </div>
                              {/* Read-only phone */}
                               <div className="flex items-start"> <FiPhone className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Phone</p> <p className="font-medium">{profile.phone || '-'}</p> </div> </div>
                                <div className="flex items-start"> <FiUsers className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Department</p> <p className="font-medium">{profile.department_name}</p> </div> </div>
                              <div className="flex items-start"> <FiBriefcase className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Role</p> <p className="font-medium">{profile.role_name}</p> </div> </div>
                              <div className="flex items-start"> <FiCalendar className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Hire Date</p> <p className="font-medium">{format(new Date(profile.hire_date), 'MMMM d, yyyy')}</p> </div> </div>
                               <div className="flex items-start"> <FiSmile className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Birth Date</p> <p className="font-medium">{profile.birth_date ? format(new Date(profile.birth_date), 'MMMM d, yyyy') : '-'}</p> </div> </div>
                               <div className="flex items-start"> <FiUser className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Gender</p> <p className="font-medium capitalize">{profile.gender || '-'}</p> </div> </div>
                               {/* Read-only Address */}
                              <div className="flex items-start"> <FiMapPin className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Address</p> <p className="font-medium">{profile.address || '-'}</p> </div> </div>
                               {/* Read-only Emergency Contact */}
                               <div className="flex items-start"> <FiUser className="h-4 w-4 text-gray-400 mt-1 mr-3 flex-shrink-0" /> <div className="text-sm"> <p className="text-xs text-gray-500">Emergency Contact</p> <p className="font-medium whitespace-pre-wrap">{profile.emergency_contact || '-'}</p> </div> </div>
                          </div>
                    </div>
                </div>{/* End Column 1 */}

                {/* --- Column 2: Edit Form & Skills --- */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Edit Form (Limited Fields) */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4">Update Contact Details</h3>
                         <form onSubmit={handleSubmit}>
                             <div className="space-y-6">
                                  <div>
                                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1"> Phone Number </label>
                                      <div className="relative mt-1 rounded-md shadow-sm">
                                           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><FiPhone className="h-5 w-5 text-gray-400"/></div>
                                           <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 pl-10 focus:border-primary-500 focus:ring-primary-500 py-2 px-3 sm:text-sm" placeholder="(123) 456-7890"/>
                                       </div>
                                   </div>
                                   <div>
                                       <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1"> Address </label>
                                       <div className="mt-1">
                                            <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3 sm:text-sm" placeholder="123 Main St..."></textarea>
                                       </div>
                                   </div>
                                    <div>
                                       <label htmlFor="emergency_contact" className="block text-sm font-medium text-gray-700 mb-1"> Emergency Contact </label>
                                       <div className="mt-1">
                                            <textarea name="emergency_contact" id="emergency_contact" rows="2" value={formData.emergency_contact} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2 px-3 sm:text-sm" placeholder="Name, Relationship, Phone"></textarea>
                                       </div>
                                       <p className="mt-1 text-xs text-gray-500"> Provide name, relationship, and phone number. </p>
                                   </div>
                                  <div className="pt-4 flex justify-end">
                                      <button type="submit" disabled={saving || loading} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                                           {saving ? <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5"/> : <FiSave className="-ml-1 mr-2 h-5 w-5" />} {saving ? 'Saving...' : 'Save Changes'}
                                       </button>
                                   </div>
                             </div>
                          </form>
                     </div>

                     {/* --- Skills Display Section --- */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <FiAward className="mr-2 text-blue-500" /> My Skills
                         </h3>
                         {skills.length === 0 ? (
                             <p className="text-gray-500 italic">No skills listed. Skills are managed by your supervisor.</p>
                         ) : (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {skills.map((skill) => (
                                     <div key={skill.employee_skill_id || skill.skill_id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                          {/* Skill Name */}
                                         <h4 className="font-medium text-gray-800">{skill.skill_name}</h4>
                                         <div className="mt-2">
                                              {/* Proficiency Bar & Label */}
                                               <div title={`Proficiency: ${skill.proficiency_level}`} className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                   <div className={`h-1.5 rounded-full ${ skill.proficiency_level === 'expert' ? 'bg-green-500 w-full' : skill.proficiency_level === 'advanced' ? 'bg-blue-500 w-3/4' : skill.proficiency_level === 'intermediate' ? 'bg-yellow-500 w-1/2' : 'bg-red-500 w-1/4' }`}></div>
                                               </div>
                                               <div className="flex justify-between text-xs text-gray-500">
                                                    <span className="capitalize">{skill.proficiency_level}</span>
                                                     
                                                </div>
                                           </div>
                                     </div>
                                  ))}
                              </div>
                         )}
                    </div>
                </div> 
            </div> 
        </EmployeeLayout>
    );
};

export default Profile;