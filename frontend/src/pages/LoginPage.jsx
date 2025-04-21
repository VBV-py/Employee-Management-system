// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { FiMail, FiLock, FiUser, FiLoader, FiAlertCircle, FiLogIn } from 'react-icons/fi';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, isAuthenticated, user } = useAuth();

    useEffect(() => {
        // Redirect if already logged in
        if (isAuthenticated) {
            navigate(user.is_supervisor ? '/supervisor/dashboard' : '/employee/dashboard');
        }
    }, [isAuthenticated, navigate, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);
            if (!result.success) {
                setError(result.message);
            }
            // Navigation happens inside the useEffect hook based on isAuthenticated changing
        } catch (err) {
            setError('An unexpected error occurred. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        // --- MODIFIED BACKGROUND ---
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-xl shadow-xl border border-gray-200">
                {/* Logo/Header Section */}
                <div className='text-center'>
                    <div className="inline-block p-3 bg-primary-100 rounded-sm  mb-4">
                        {/* --- ICON CHANGED --- */}
                        <FiUser className="h-10 w-10 text-primary-600 " />
                    </div>
                    {/* --- HEADING TEXT CHANGED --- */}
                    <h2 className="text-3xl font-bold text-center text-gray-900">
                        Employee Management System
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Sign in to access your account.
                    </p>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start space-x-3">
                        <FiAlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                         <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {/* Login Form (remains the same as the previous light-mode version) */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {/* Email Input */}
                    <div className="relative">
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                           <FiMail className="h-5 w-5 text-gray-400" />
                         </div>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                            placeholder="Email address"
                        />
                    </div>

                    {/* Password Input */}
                     <div className="relative">
                         <label htmlFor="password" className="sr-only">Password</label>
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FiLock className="h-5 w-5 text-gray-400" />
                          </div>
                         <input
                             id="password"
                             name="password"
                             type="password"
                             autoComplete="current-password"
                             required
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                             placeholder="Password"
                         />
                     </div>

                    {/* Forgot Password Link */}
                    <div className="text-sm text-right">
                        <Link to="/#" // Change "#" to your actual password reset request route when implemented
                           className="font-medium text-primary-600 hover:text-primary-500">
                            Forgot your password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-60 disabled:cursor-not-allowed transition duration-150 ease-in-out"
                        >
                            {loading ? (
                                <>
                                    <FiLoader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                  
                                    <FiLogIn className="-ml-1 mr-2 h-5 w-5" />
                                    SIGN IN
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;