"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Cookies from "js-cookie";
import '../styles.css';
import NotificationsPanel from '../components/NotificationsPanel';

export default function TeachingRequestsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("received");
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        if (!session) {
            return;
        }
        fetchRequests(activeTab);
    }, [session, activeTab]);

    const fetchRequests = async (type) => {
        try {
            setIsLoading(true);
            setError("");
            const token = Cookies.get("token");
            
            if (!token) {
                setError("Authentication token not found. Please sign in again.");
                setIsLoading(false);
                return;
            }

            const response = await fetch(`/api/teaching-requests?type=${type}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch teaching requests");
            }

            const data = await response.json();
            setRequests(data);
        } catch (error) {
            console.error("Error fetching teaching requests:", error);
            setError(error.message || "Failed to fetch teaching requests");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (requestId, status) => {
        try {
            setError("");
            setSuccessMessage("");
            const token = Cookies.get("token");
            
            if (!token) {
                setError("Authentication token not found. Please sign in again.");
                return;
            }

            const response = await fetch("/api/teaching-requests", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ requestId, status }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update request status to ${status}`);
            }

            // Update the request in the local state
            setRequests(requests.map(req => 
                req._id === requestId ? { ...req, status } : req
            ));

            setSuccessMessage(`Request ${status} successfully!`);
            
            // Refresh the list after a short delay
            setTimeout(() => {
                fetchRequests(activeTab);
            }, 1000);
        } catch (error) {
            console.error(`Error updating request status to ${status}:`, error);
            setError(error.message || `Failed to update request status to ${status}`);
        }
    };

    const handleViewProfile = (userId) => {
        router.push(`/user/${userId}`);
    };

    const getStatusClass = (status) => {
        switch (status) {
            case "pending":
                return "bg-yellow-100 text-yellow-800";
            case "accepted":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const renderReceivedRequests = () => {
        if (requests.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No teaching requests received yet.
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {requests.map((request) => (
                    <div key={request._id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex items-start space-x-4">
                            <div 
                                className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200"
                                onClick={() => handleViewProfile(request.fromUser._id)}
                                style={{ cursor: "pointer" }}
                            >
                                <Image
                                    src={request.fromUser.profile?.picture || "/placeholder-user.png"}
                                    alt={request.fromUser.name}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            {request.fromUser.name}
                                        </h3>
                                        <p className="text-sm text-blue-600 font-medium">
                                            Skill: {request.skill}
                                        </p>
                                        {request.message && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                "{request.message}"
                                            </p>
                                        )}
                                        {request.preferredDate && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Preferred date: {formatDate(request.preferredDate)}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Requested on {formatDate(request.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${getStatusClass(
                                            request.status
                                        )}`}
                                    >
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </div>

                                {request.status === "pending" && (
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => handleUpdateStatus(request._id, "accepted")}
                                            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(request._id, "rejected")}
                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                                        >
                                            Decline
                                        </button>
                                    </div>
                                )}

                                {request.status === "accepted" && (
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => handleUpdateStatus(request._id, "completed")}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                        >
                                            Mark as Completed
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderSentRequests = () => {
        if (requests.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    You haven't sent any teaching requests yet.
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {requests.map((request) => (
                    <div key={request._id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="flex items-start space-x-4">
                            <div 
                                className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-200"
                                onClick={() => handleViewProfile(request.toUser._id)}
                                style={{ cursor: "pointer" }}
                            >
                                <Image
                                    src={request.toUser.profile?.picture || "/placeholder-user.png"}
                                    alt={request.toUser.name}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium text-gray-900">
                                            To: {request.toUser.name}
                                        </h3>
                                        <p className="text-sm text-blue-600 font-medium">
                                            Skill: {request.skill}
                                        </p>
                                        {request.message && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                "{request.message}"
                                            </p>
                                        )}
                                        {request.preferredDate && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                Preferred date: {formatDate(request.preferredDate)}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            Sent on {formatDate(request.createdAt)}
                                        </p>
                                    </div>
                                    <span
                                        className={`text-xs px-2 py-1 rounded-full ${getStatusClass(
                                            request.status
                                        )}`}
                                    >
                                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                </div>

                                {request.status === "accepted" && (
                                    <div className="mt-3 flex space-x-2">
                                        <button
                                            onClick={() => handleUpdateStatus(request._id, "completed")}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                                        >
                                            Mark as Completed
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center">
                    <button
                        onClick={() => router.push("/profile")}
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
                    <h1 className="text-2xl font-bold text-gray-800">Teaching Requests</h1>
                </div>
                
                <Link href="/skills" className="text-blue-600 hover:text-blue-800 transition">
                    Find skills to learn
                </Link>
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

            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <div className="flex border-b">
                    <button
                        className={`px-4 py-3 w-1/2 text-center ${
                            activeTab === "received"
                                ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                        onClick={() => setActiveTab("received")}
                    >
                        Received Requests
                    </button>
                    <button
                        className={`px-4 py-3 w-1/2 text-center ${
                            activeTab === "sent"
                                ? "text-blue-600 border-b-2 border-blue-600 font-medium"
                                : "text-gray-600 hover:text-gray-800"
                        }`}
                        onClick={() => setActiveTab("sent")}
                    >
                        Sent Requests
                    </button>
                </div>

                <div className="p-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : activeTab === "received" ? (
                        renderReceivedRequests()
                    ) : (
                        renderSentRequests()
                    )}
                </div>
            </div>
        </div>
    );
} 