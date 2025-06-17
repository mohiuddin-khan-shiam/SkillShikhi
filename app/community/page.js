"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CommunityPage() {
  // State for search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Dummy data for categories and members (replace with API calls)
  useEffect(() => {
    // Simulate fetching categories
    setCategories([
      { id: 'web', name: 'Web Development' },
      { id: 'design', name: 'Design' },
      { id: 'marketing', name: 'Marketing' },
    ]);
    // Simulate fetching members
    setMembers([
      {
        _id: '1',
        name: 'Alice',
        skills: ['Web Development', 'Design'],
        profileImage: '',
        followers: 10,
      },
      {
        _id: '2',
        name: 'Bob',
        skills: ['Marketing'],
        profileImage: '',
        followers: 5,
      },
      {
        _id: '3',
        name: 'Charlie',
        skills: ['Web Development'],
        profileImage: '',
        followers: 2,
      },
    ]);
  }, []);

  // Filter members based on search and category
  useEffect(() => {
    let filtered = members;
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(member =>
        member.skills && member.skills.some(skill => skill.toLowerCase().replace(/\s/g, '') === categoryFilter)
      );
    }
    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.skills && member.skills.join(', ').toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredMembers(filtered);
  }, [searchTerm, categoryFilter, members]);

  return (
    <div className="container py-5 min-vh-100 bg-light">
      {/* Hero section */}
      <div className="bg-primary text-white rounded-4 p-5 mb-5">
        <div className="row align-items-center">
          <div className="col-md-7">
            <span className="badge bg-light text-primary mb-3">Connect & Grow</span>
            <h1 className="display-4 fw-bold mb-3">Join Our Learning Community</h1>
            <p className="lead mb-4">Connect with fellow learners, share experiences, and grow together in your learning journey.</p>
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
              <div className="text-primary-200 small mb-1">Community members</div>
              <div className="display-5 fw-bold mb-3">500+</div>
              <div className="text-primary-200 small mb-1">Active learners</div>
              <div className="display-5 fw-bold">300+</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container py-5 min-vh-100 bg-light">
        {/* Search and filter section */}
        <div className="card shadow-sm p-4 mb-5">
          <form className="row g-3 align-items-end" onSubmit={e => e.preventDefault()}>
            <div className="col-md-6">
              <label htmlFor="search" className="form-label">Search Members</label>
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  id="search"
                  className="form-control"
                  placeholder="Search by name or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6">
              <label htmlFor="category" className="form-label">Filter by Skill</label>
              <select
                id="category"
                className="form-select"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Skills</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </form>
        </div>

        {/* Members grid */}
        {error ? (
          <div className="alert alert-danger d-flex align-items-center" role="alert">
            <i className="bi bi-x-circle-fill me-2"></i>
            <div>{error}</div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="card shadow-sm p-5 text-center">
            <i className="bi bi-emoji-frown display-4 text-secondary mb-3"></i>
            <h3 className="fw-bold mb-2">
              {searchTerm || categoryFilter !== 'all' ? 'No matching members found' : 'No members available yet'}
            </h3>
            <p className="text-secondary mb-4">
              {searchTerm || categoryFilter !== 'all' ?
                'Try changing your search or filter criteria.' :
                'Be the first to join our community!'}
            </p>
            <a href="/signup" className="btn btn-primary btn-lg d-inline-flex align-items-center">
              <i className="bi bi-person-plus me-2"></i> Join Now
            </a>
          </div>
        ) : (
          <div className="row g-4">
            {filteredMembers.map((member) => (
              <div key={member._id} className="col-12 col-sm-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 hover-shadow position-relative" style={{cursor: 'pointer'}} onClick={() => router.push(`/profile/${member._id}`)}>
                  <div className="card-body">
                    <div className="d-flex align-items-center mb-3">
                      <div className="position-relative">
                        <img
                          src={member.profileImage || '/default-avatar.png'}
                          alt={member.name}
                          className="rounded-circle border"
                          style={{width: '64px', height: '64px', objectFit: 'cover'}}
                        />
                        <span className="position-absolute bottom-0 end-0 translate-middle p-1 bg-success border border-light rounded-circle" style={{width: '16px', height: '16px'}}></span>
                      </div>
                      <div className="ms-3">
                        <h5 className="card-title mb-1 fw-semibold">{member.name}</h5>
                        <div className="text-secondary small">{member.skills?.join(', ') || 'No skills listed'}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mt-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-people-fill text-primary me-2"></i>
                        <span className="text-secondary">
                          {member.followers || 0} {(member.followers === 1) ? 'follower' : 'followers'}
                        </span>
                      </div>
                      <span className="badge bg-primary bg-opacity-10 text-primary">View Profile</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination (static example) */}
        {filteredMembers.length > 0 && (
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
    </div>
  );
} 