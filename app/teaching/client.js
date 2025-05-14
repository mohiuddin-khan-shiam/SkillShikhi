"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import '../styles.css';
import NotificationsPanel from '../components/NotificationsPanel';

export default function TeachingRequestsClient() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("received");
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [user, setUser] = useState(null);

    // Check authentication status
    useEffect(() => {
        const token = Cookies.get('token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Fetch user data
        const fetchUserData = async () => {
            try {
                const response = await fetch('/api/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    setUser(userData.user);
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Failed to authenticate user');
            }
        };

        fetchUserData();
    }, [router]);

    // Fetch teaching requests
    useEffect(() => {
        const fetchRequests = async () => {
            if (!user) return;
            
            setIsLoading(true);
            setError("");
            
            try {
                const token = Cookies.get('token');
                const response = await fetch(`/api/teaching-requests?type=${activeTab}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    setRequests(data.requests || []);
                } else {
                    setError(data.error || "Failed to fetch requests");
                }
            } catch (error) {
                console.error("Error fetching teaching requests:", error);
                setError("An unexpected error occurred");
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchRequests();
    }, [activeTab, user]);
    
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };
    
    const handleStatusChange = async (requestId, newStatus) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch('/api/teaching-requests', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    requestId,
                    status: newStatus
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Update the request in the local state
                setRequests(prevRequests => 
                    prevRequests.map(req => 
                        req._id === requestId ? { ...req, status: newStatus } : req
                    )
                );
                
                setSuccessMessage(`Request ${newStatus} successfully!`);
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            } else {
                setError(data.error || `Failed to ${newStatus} request`);
            }
        } catch (error) {
            console.error(`Error ${newStatus} request:`, error);
            setError("An unexpected error occurred");
        }
    };
    
    const formatDate = (dateString) => {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Teaching Requests</h1>
                <div className="flex items-center">
                    <NotificationsPanel />
                </div>
            </div>
            
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {successMessage}
                </div>
            )}
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="flex border-b">
                    <button
                        className={`px-6 py-3 font-medium ${activeTab === "received" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        onClick={() => handleTabChange("received")}
                    >
                        Received Requests
                    </button>
                    <button
                        className={`px-6 py-3 font-medium ${activeTab === "sent" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                        onClick={() => handleTabChange("sent")}
                    >
                        Sent Requests
                    </button>
                </div>
                
                <div className="p-4">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="text-gray-500 mb-4">
                                {activeTab === "received" 
                                    ? "You haven't received any teaching requests yet." 
                                    : "You haven't sent any teaching requests yet."}
                            </div>
                            {activeTab === "sent" && (
                                <Link href="/skills" className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                                    Find Skills to Learn
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {requests.map((request) => (
                                <div key={request._id} className="border rounded-lg p-4 hover:shadow-md transition">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start">
                                            <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
                                                <img 
                                                    src={activeTab === "received" 
                                                        ? (request.fromUser?.profile?.picture || "/images/default-avatar.png")
                                                        : (request.toUser?.profile?.picture || "/images/default-avatar.png")}
                                                    alt="Profile"
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">
                                                    {activeTab === "received" 
                                                        ? request.fromUser?.name || "Unknown User"
                                                        : request.toUser?.name || "Unknown User"}
                                                </h3>
                                                <p className="text-gray-600 text-sm">
                                                    {activeTab === "received" 
                                                        ? "Wants to learn from you"
                                                        : "You requested to learn from"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                            <span className="text-gray-500 text-sm mt-1">
                                                {formatDate(request.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4">
                                        <div className="bg-gray-50 p-3 rounded-lg">
                                            <h4 className="font-medium mb-1">Skill: <span className="text-blue-600">{request.skill}</span></h4>
                                            {request.message && (
                                                <p className="text-gray-700">"{request.message}"</p>
                                            )}
                                            {request.preferredDate && (
                                                <p className="text-gray-600 text-sm mt-2">
                                                    Preferred Date: {formatDate(request.preferredDate)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {activeTab === "received" && request.status === "pending" && (
                                        <div className="mt-4 flex justify-end space-x-2">
                                            <button
                                                onClick={() => handleStatusChange(request._id, "rejected")}
                                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                                            >
                                                Decline
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(request._id, "accepted")}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    )}
                                    
                                    {(request.status === "accepted") && (
                                        <div className="mt-4 flex justify-end">
                                            <button
                                                onClick={() => handleStatusChange(request._id, "completed")}
                                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                                            >
                                                Mark as Completed
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getStatusColor(status) {
    switch (status) {
        case 'pending':
            return 'bg-yellow-100 text-yellow-800';
        case 'accepted':
            return 'bg-green-100 text-green-800';
        case 'rejected':
            return 'bg-red-100 text-red-800';
        case 'completed':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}
