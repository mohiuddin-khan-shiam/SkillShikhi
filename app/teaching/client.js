"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import '../styles.css';
import NotificationsPanel from '../components/NotificationsPanel';
import { DEMO_USERS } from '../../lib/demoData';
import { clientStore } from '../../lib/clientStore';

export default function TeachingRequestsClient() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("received");
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [user, setUser] = useState(null);

    // Check authentication status with demo fallback
    useEffect(() => {
        const token = Cookies.get('token') || localStorage.getItem('token');
        const currentUser = clientStore.getCurrentUser() || DEMO_USERS.alex;
        setUser(currentUser);

        // Fetch user data if real API available
        const fetchUserData = async () => {
            if (!token) return;
            try {
                const response = await fetch('/api/user/profile', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    const userData = await response.json();
                    if (userData?.user) setUser(userData.user);
                }
            } catch (error) {
                console.warn('Fallback to demo persona in teaching requests');
            }
        };

        fetchUserData();
    }, [router]);

    // Fetch teaching requests
    useEffect(() => {
        const fetchRequests = async () => {
            setIsLoading(true);
            setError("");
            
            try {
                const token = Cookies.get('token') || localStorage.getItem('token') || 'demo_token';
                const response = await fetch(`/api/teaching-requests?type=${activeTab}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (response.ok && data.requests) {
                    setRequests(data.requests);
                } else {
                    setRequests([
                        {
                            _id: 'req_1',
                            skill: 'Neural Networks & PyTorch',
                            status: 'pending',
                            date: '2026-10-28',
                            time: '18:00',
                            message: 'Looking for guidance on PyTorch autograd and backprop optimization.',
                            requester: DEMO_USERS.alex,
                            teacher: DEMO_USERS.sarah,
                        }
                    ]);
                }
            } catch (error) {
                console.warn("Using demo teaching requests:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchRequests();
    }, [activeTab]);
    
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    
    const handleStatusChange = async (requestId, newStatus) => {
        try {
            setRequests(prev => prev.map(req => req._id === requestId ? { ...req, status: newStatus } : req));
            setSuccessMessage(`Request successfully marked as ${newStatus}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error("Error updating teaching request:", error);
            setError("Failed to update status");
        }
    };
    
    return (
        <div className="teaching-requests-container">
            <header className="profile-header">
                <Link href="/" className="logo-link">
                    <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                </Link>
                <div className="header-actions">
                    <Link href="/sessions" className="nav-link">
                        📅 Classroom & Sessions
                    </Link>
                    <Link href="/profile" className="back-button">
                        Back to Profile
                    </Link>
                </div>
            </header>

            <div className="container py-4">
                <div className="teaching-header mb-4">
                    <h1 className="text-2xl font-bold">Teaching Requests</h1>
                    <p className="text-gray-600">Coordinate peer tutoring and 1-on-1 skill mentorship</p>
                </div>

                {successMessage && (
                    <div className="alert alert-success p-3 rounded mb-4 bg-green-50 text-green-700 border border-green-200">
                        {successMessage}
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger p-3 rounded mb-4 bg-red-50 text-red-700 border border-red-200">
                        {error}
                    </div>
                )}

                <div className="teaching-tabs flex gap-4 border-b border-gray-200 mb-6">
                    <button
                        className={`tab-btn py-2 px-4 font-medium border-b-2 transition ${activeTab === 'received' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
                        onClick={() => handleTabChange('received')}
                    >
                        Requests Received ({requests.length})
                    </button>
                    <button
                        className={`tab-btn py-2 px-4 font-medium border-b-2 transition ${activeTab === 'sent' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500'}`}
                        onClick={() => handleTabChange('sent')}
                    >
                        Requests Sent
                    </button>
                </div>

                {isLoading ? (
                    <div className="loading-state py-8 text-center text-gray-500">Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div className="empty-state py-12 text-center bg-white rounded-xl shadow-sm p-8">
                        <p className="text-gray-500 mb-4">No {activeTab} teaching requests at the moment.</p>
                        <Link href="/skills" className="btn btn-primary px-4 py-2 bg-indigo-600 text-white rounded-lg">
                            Explore Mentors & Skills
                        </Link>
                    </div>
                ) : (
                    <div className="requests-list grid gap-4">
                        {requests.map((req) => (
                            <div key={req._id} className="request-card bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-lg text-gray-900">{req.skill}</span>
                                        <span className={`status-badge text-xs px-2.5 py-0.5 rounded-full font-medium ${req.status === 'accepted' ? 'bg-green-100 text-green-800' : req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {req.status?.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        With: <strong className="text-indigo-600">{req.requester?.name || req.teacher?.name || 'Peer Learner'}</strong>
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        📅 {req.date || 'TBD'} at {req.time || 'Flexible'}
                                    </p>
                                    {req.message && (
                                        <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-2.5 rounded border border-gray-100">
                                            "{req.message}"
                                        </p>
                                    )}
                                </div>
                                <div className="request-actions flex gap-2">
                                    {req.status === 'pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleStatusChange(req._id, 'accepted')}
                                                className="btn-accept px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                                            >
                                                Accept Request
                                            </button>
                                            <button 
                                                onClick={() => handleStatusChange(req._id, 'rejected')}
                                                className="btn-reject px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
                                            >
                                                Decline
                                            </button>
                                        </>
                                    )}
                                    {req.status === 'accepted' && (
                                        <Link 
                                            href={`/chat`}
                                            className="btn-chat px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                                        >
                                            Message Tutor
                                        </Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
