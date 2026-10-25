'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import '../../styles.css';

export default function SkillUsersPage() {
    const router = useRouter();
    const params = useParams();
    const skillName = params?.name || '';
    const decodedSkillName = decodeURIComponent(skillName);

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch(`/api/skills/${skillName}/users`);
                if (!res.ok) throw new Error('Failed to fetch users');

                const data = await res.json();
                setUsers(data.users && data.users.length > 0 ? data.users : [
                    { _id: 'user_sarah_202', name: 'Dr. Sarah Khan', email: 'sarah.khan@skillshikhi.demo', profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80', bio: 'Senior AI Engineer & Peer Mentor' },
                    { _id: 'user_tariq_303', name: 'Tariq Rahman', email: 'tariq.devops@skillshikhi.demo', profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', bio: 'Cloud Architect & Mentor' },
                    { _id: 'user_elena_404', name: 'Elena Rostova', email: 'elena.ui@skillshikhi.demo', profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80', bio: 'Design Systems Lead' }
                ]);
            } catch (error) {
                console.error('Error fetching users by skill:', error);
            } finally {
                setLoading(false);
            }
        }

        if (skillName) {
            fetchUsers();
        }
    }, [skillName]);

    const handleBackToSkills = () => {
        router.push('/skills');
    };

    const viewUserProfile = (userId) => {
        router.push(`/user/${userId}`);
    };

    if (loading) return <p>Loading users...</p>;

    return (
        <div className="skill-users-wrapper">
            <header className="profile-header">
                <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                <button onClick={handleBackToSkills} className="back-button">
                    Back to Skills
                </button>
            </header>

            <div className="skill-users-content">
                <h1>Users with "{decodedSkillName}" skill</h1>

                {users.length === 0 ? (
                    <p>No users found with this skill.</p>
                ) : (
                    <div className="users-grid">
                        {users.map((user) => (
                            <div
                                key={user.id}
                                className="user-card"
                                onClick={() => viewUserProfile(user.id)}
                            >
                                <img
                                    src={user.profileImage}
                                    alt={user.name}
                                    className="user-profile-pic"
                                />
                                <div className="user-info">
                                    <h3>{user.name}</h3>
                                    <p className="user-bio">{user.bio}</p>
                                    <p className="user-location">{user.location}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
