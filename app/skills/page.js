'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function DiscoverSkillsPage() {
    const router = useRouter();
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    // Sample categories - would typically come from your backend
    const categories = [
        { id: 'all', name: 'All Skills' },
        { id: 'tech', name: 'Technology' },
        { id: 'art', name: 'Arts & Crafts' },
        { id: 'language', name: 'Languages' },
        { id: 'music', name: 'Music' },
        { id: 'cooking', name: 'Cooking' },
        { id: 'fitness', name: 'Fitness' },
        { id: 'academic', name: 'Academic' },
        { id: 'other', name: 'Other' }
    ];

    useEffect(() => {
        // Page load animation
        setIsPageLoaded(true);
        
        async function fetchSkills() {
            try {
                const res = await fetch('/api/skills');
                if (!res.ok) throw new Error('Failed to fetch skills');

                const data = await res.json();
                setSkills(data.skills || []);
            } catch (error) {
                console.error('Error fetching skills:', error);
                setError('Could not load skills. Please try again later.');
            } finally {
                setLoading(false);
            }
        }

        fetchSkills();
    }, []);

    // Filter skills based on search term and category
    const filteredSkills = skills.filter(skill => {
        const matchesSearch = searchTerm === '' || 
            skill.name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = categoryFilter === 'all' || 
            skill.category === categoryFilter;
        
        return matchesSearch && matchesCategory;
    });

    // Skill icons based on category (would be better with actual icons or images)
    const getSkillIcon = (skill) => {
        const category = skill.category || 'other';
        const iconColors = {
            tech: 'bg-blue-500',
            art: 'bg-purple-500',
            language: 'bg-green-500',
            music: 'bg-yellow-500',
            cooking: 'bg-red-500',
            fitness: 'bg-orange-500',
            academic: 'bg-indigo-500',
            other: 'bg-gray-500'
        };

        return (
            <div className={`rounded-circle ${iconColors[category] || 'bg-primary'} d-flex align-items-center justify-content-center`} style={{width: '40px', height: '40px', fontWeight: 'bold', fontSize: '1.25rem'}}>
                {skill.name.charAt(0).toUpperCase()}
            </div>
        );
    };

    // Loading state with skeleton UI
    if (loading) {
        return (
            <div className="container py-5 min-vh-100">
                <div className="mb-4">
                    <div className="placeholder-glow mb-2">
                        <span className="placeholder col-3"></span>
                    </div>
                    <div className="placeholder-glow">
                        <span className="placeholder col-6"></span>
                    </div>
                </div>
                <div className="row g-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="col-12 col-sm-6 col-lg-4">
                            <div className="card shadow-sm p-4 placeholder-glow">
                                <div className="d-flex align-items-center mb-3">
                                    <span className="placeholder rounded-circle me-3" style={{width: '40px', height: '40px'}}></span>
                                    <span className="placeholder col-6"></span>
                                </div>
                                <span className="placeholder col-4 mb-2"></span>
                                <span className="placeholder col-3"></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5 min-vh-100">
            {/* Hero section */}
            <div className="bg-primary text-white rounded-4 p-5 mb-5">
                <div className="row align-items-center">
                    <div className="col-md-7">
                        <span className="badge bg-light text-primary mb-3">Discover & Learn</span>
                        <h1 className="display-4 fw-bold mb-3">Discover Skills in Your Community</h1>
                        <p className="lead mb-4">Browse through skills offered by people in your community and connect with them to start learning.</p>
                        <div className="d-flex flex-wrap gap-3">
                            <a href="/profile" className="btn btn-light btn-lg fw-medium d-flex align-items-center" target="_blank" rel="noopener noreferrer">
                                <i className="bi bi-person-circle me-2"></i> Your Profile
                            </a>
                            <a href="/teaching-request" className="btn btn-outline-light btn-lg fw-medium d-flex align-items-center" target="_blank" rel="noopener noreferrer">
                                <i className="bi bi-plus-lg me-2"></i> Teach a Skill
                            </a>
                        </div>
                    </div>
                    <div className="col-md-5 text-center mt-4 mt-md-0">
                        <div className="bg-white bg-opacity-25 rounded-4 p-4 d-inline-block">
                            <div className="text-primary-200 small mb-1">Available skills</div>
                            <div className="display-5 fw-bold mb-3">{skills.length}</div>
                            <div className="text-primary-200 small mb-1">Community members</div>
                            <div className="display-5 fw-bold">500+</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and filter section */}
            <div className="card shadow-sm p-4 mb-5">
                <form className="row g-3 align-items-end">
                    <div className="col-md-6">
                        <label htmlFor="search" className="form-label">Search Skills</label>
                        <div className="input-group">
                            <span className="input-group-text"><i className="bi bi-search"></i></span>
                            <input
                                type="text"
                                id="search"
                                className="form-control"
                                placeholder="Search by skill name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="category" className="form-label">Filter by Category</label>
                        <select
                            id="category"
                            className="form-select"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </div>

            {/* Skills grid */}
            {error ? (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <i className="bi bi-x-circle-fill me-2"></i>
                    <div>{error}</div>
                </div>
            ) : filteredSkills.length === 0 ? (
                <div className="card shadow-sm p-5 text-center">
                    <i className="bi bi-emoji-frown display-4 text-secondary mb-3"></i>
                    <h3 className="fw-bold mb-2">
                        {searchTerm || categoryFilter !== 'all' ? 'No matching skills found' : 'No skills available yet'}
                    </h3>
                    <p className="text-secondary mb-4">
                        {searchTerm || categoryFilter !== 'all' ? 
                            'Try changing your search or filter criteria.' : 
                            'Be the first to offer a skill in your community!'}
                    </p>
                    <a href="/teaching-request" className="btn btn-primary btn-lg d-inline-flex align-items-center">
                        <i className="bi bi-plus-lg me-2"></i> Teach a Skill
                    </a>
                </div>
            ) : (
                <div className="row g-4">
                    {filteredSkills.map((skill) => (
                        <div key={skill._id} className="col-12 col-sm-6 col-lg-4">
                            <div className="card h-100 shadow-sm border-0 hover-shadow position-relative" style={{cursor: 'pointer'}} onClick={() => router.push(`/skills/${encodeURIComponent(skill.name)}`)}>
                                <div className="card-body">
                                    <div className="d-flex align-items-center mb-3">
                                        {getSkillIcon(skill)}
                                        <div>
                                            <h5 className="card-title mb-1 fw-semibold">{skill.name}</h5>
                                            <div className="text-secondary small">{skill.category || 'General'}</div>
                                        </div>
                                    </div>
                                    <div className="d-flex align-items-center justify-content-between mt-3">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-people-fill text-primary me-2"></i>
                                            <span className="text-secondary">
                                                {skill.count || 0} {(skill.count === 1) ? 'person' : 'people'}
                                            </span>
                                        </div>
                                        <span className="badge bg-primary bg-opacity-10 text-primary">View Details</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination (static example) */}
            {filteredSkills.length > 0 && (
                <nav className="mt-5 d-flex justify-content-center" aria-label="Pagination">
                    <ul className="pagination">
                        <li className="page-item disabled"><a className="page-link" href="#">Previous</a></li>
                        <li className="page-item active"><a className="page-link" href="#">1</a></li>
                        <li className="page-item"><a className="page-link" href="#">2</a></li>
                        <li className="page-item"><a className="page-link" href="#">3</a></li>
                        <li className="page-item"><a className="page-link" href="#">Next</a></li>
                    </ul>
                </nav>
            )}
        </div>
    );
}
