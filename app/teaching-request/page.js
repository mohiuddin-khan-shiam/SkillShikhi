'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import '../styles.css';
import NotificationsPanel from '../components/NotificationsPanel';
import Cookies from 'js-cookie';

// Wrapper component that uses searchParams
function TeachingRequestContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Get parameters from URL
    const skillName = searchParams.get('skillName') || '';
    const teacherId = searchParams.get('teacherId') || '';
    const teacherName = searchParams.get('teacherName') || 'this teacher';
    
    const [requestData, setRequestData] = useState({
        skill: skillName,
        message: '',
        preferredDate: ''
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Redirect if any required params are missing
    useEffect(() => {
        if (!skillName || !teacherId) {
            router.push('/skills');
        }
    }, [skillName, teacherId, router]);
    
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRequestData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const token = Cookies.get('token');
            if (!token) {
                setError('You must be logged in to send a teaching request');
                setLoading(false);
                return;
            }
            
            const response = await fetch('/api/teaching-requests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    toUserId: teacherId,
                    skill: requestData.skill,
                    message: requestData.message,
                    preferredDate: requestData.preferredDate || null
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                setSuccess(`Teaching request sent to ${teacherName} successfully!`);
                // Reset form
                setRequestData({
                    skill: skillName,
                    message: '',
                    preferredDate: ''
                });
                
                // Redirect after a delay
                setTimeout(() => {
                    router.push('/teaching');
                }, 2000);
            } else {
                setError(data.error || 'Failed to send teaching request');
            }
        } catch (error) {
            console.error('Error sending teaching request:', error);
            setError('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };
    
    const handleBack = () => {
        router.back();
    };
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={handleBack}
                        className="mr-4 p-2 rounded-full hover:bg-gray-200 transition"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Request Teaching Session</h1>
                </div>
                
                <div className="flex items-center">
                    <NotificationsPanel />
                </div>
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">
                        Request a teaching session from {teacherName}
                    </h2>
                    <p className="text-gray-600">
                        Fill out the form below to request {teacherName} to teach you about {skillName}.
                    </p>
                </div>
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="skill" className="block text-gray-700 font-medium mb-2">
                            Skill
                        </label>
                        <input
                            type="text"
                            id="skill"
                            name="skill"
                            value={requestData.skill}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            readOnly={!!skillName}
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="message" className="block text-gray-700 font-medium mb-2">
                            Message (Optional)
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={requestData.message}
                            onChange={handleInputChange}
                            placeholder="Tell the teacher what you'd like to learn and why"
                            rows="4"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>
                    
                    <div className="mb-6">
                        <label htmlFor="preferredDate" className="block text-gray-700 font-medium mb-2">
                            Preferred Date (Optional)
                        </label>
                        <input
                            type="datetime-local"
                            id="preferredDate"
                            name="preferredDate"
                            value={requestData.preferredDate}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                            Select a date and time when you'd like to have the teaching session
                        </p>
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="mr-4 px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                            disabled={loading}
                        >
                            {loading ? 'Sending...' : 'Send Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
} 