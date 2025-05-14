'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../styles.css';

export default function DiscoverSkillsPage() {
    const router = useRouter();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSkills() {
            try {
                const res = await fetch('/api/skills');
                if (!res.ok) throw new Error('Failed to fetch skills');

                const data = await res.json();
                setSkills(data.skills || []);
            } catch (error) {
                console.error('Error fetching skills:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchSkills();
    }, []);

    const handleBackToProfile = () => {
        router.push('/profile');
    };

    if (loading) return <p>Loading skills...</p>;

    return (
        <div className="skills-wrapper">
            <header className="profile-header">
                <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
                <button onClick={handleBackToProfile} className="back-button">
                    Back to Profile
                </button>
            </header>

            <div className="skills-content">
                <h1>Discover Skills</h1>
                <p>Explore skills available across the platform</p>

                {skills.length === 0 ? (
                    <p>No skills have been added by users yet.</p>
                ) : (
                    <div className="skills-grid">
                        {skills.map((skill) => (
                            <div
                                key={skill._id}
                                className="skill-card"
                                onClick={() => router.push(`/skills/${encodeURIComponent(skill.name)}`)}
                            >
                                <h3>{skill.name}</h3>
                                <p>{skill.count} {skill.count === 1 ? 'person' : 'people'}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
