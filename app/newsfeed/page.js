'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';
import { mockApi } from '../../lib/mockData';

export default function NewsfeedPage() {
  // State variables
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [popularSkills, setPopularSkills] = useState([]);
  const [suggestedTeachers, setSuggestedTeachers] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [commentInputs, setCommentInputs] = useState({});

  // Fetch initial data for the newsfeed
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        
        // Get current user
        const user = await mockApi.getCurrentUser();
        setCurrentUser(user);
        
        // Get posts
        const { posts } = await mockApi.getPosts();
        setPosts(posts);
        
        // Get popular skills
        const { skills } = await mockApi.getPopularSkills();
        setPopularSkills(skills);
        
        // Get suggested teachers
        const { teachers } = await mockApi.getSuggestedTeachers();
        setSuggestedTeachers(teachers);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Handle like/unlike a post
  const handleLikePost = async (postId) => {
    if (!currentUser) return;
    
    try {
      const { success, post } = await mockApi.likePost(postId, currentUser.id);
      
      if (success) {
        // Update the posts state
        setPosts(posts.map(p => p.id === postId ? post : p));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId) => {
    if (!currentUser || !commentInputs[postId]) return;
    
    try {
      const { success, comment } = await mockApi.addComment(postId, {
        user: currentUser,
        content: commentInputs[postId]
      });
      
      if (success) {
        // Update the posts state
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, comment]
            };
          }
          return p;
        }));
        
        // Clear the comment input
        setCommentInputs({ ...commentInputs, [postId]: '' });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle creating a new post
  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!currentUser || !newPostContent || !selectedSkill) return;
    
    try {
      // In a real app, we'd call an API to create the post
      // For now, we'll just add it to our posts state
      const newPost = {
        id: `post${Math.floor(Math.random() * 10000)}`,
        user: currentUser,
        content: newPostContent,
        skillTag: selectedSkill.toLowerCase(),
        likes: [],
        comments: [],
        createdAt: new Date()
      };
      
      setPosts([newPost, ...posts]);
      
      // Clear the form
      setNewPostContent('');
      setSelectedSkill('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  // If loading
  if (isLoading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your newsfeed...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Left Sidebar - User Profile */}
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              {currentUser && (
                <>
                  <div className="text-center mb-3">
                    <Image 
                      src={currentUser.profileImage}
                      alt={currentUser.name}
                      width={100}
                      height={100}
                      className="rounded-circle border shadow-sm"
                    />
                    <h5 className="mt-3 mb-1">{currentUser.name}</h5>
                    <p className="text-muted small">{currentUser.occupation}</p>
                    <p className="text-muted small"><i className="bi bi-geo-alt-fill me-1"></i>{currentUser.location}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="mb-2">Bio</h6>
                    <p className="small">{currentUser.bio}</p>
                  </div>
                  
                  <div className="mb-3">
                    <h6 className="mb-2">Skills</h6>
                    <div className="d-flex flex-wrap gap-1">
                      {currentUser.skills.map((skill, index) => (
                        <span key={index} className="badge bg-light text-dark shadow-sm">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="d-grid">
                    <Link href="/profile" className="btn btn-outline-primary">
                      View Full Profile
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Main Content - Posts */}
        <div className="col-lg-6 mb-4">
          {/* Create Post Form */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Share your learning journey</h5>
              <form onSubmit={handleCreatePost}>
                <div className="mb-3">
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="What are you learning today?"
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="mb-3">
                  <select 
                    className="form-select" 
                    value={selectedSkill}
                    onChange={(e) => setSelectedSkill(e.target.value)}
                    required
                  >
                    <option value="">Select a skill tag</option>
                    {popularSkills.map(skill => (
                      <option key={skill.id} value={skill.name}>{skill.name}</option>
                    ))}
                    {currentUser?.skills.map((skill, index) => (
                      <option key={`user-skill-${index}`} value={skill.toLowerCase()}>{skill}</option>
                    ))}
                  </select>
                </div>
                <div className="d-flex justify-content-end">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={!newPostContent || !selectedSkill}
                  >
                    Post
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Posts */}
          {posts.length === 0 ? (
            <div className="alert alert-info">No posts yet. Be the first to share!</div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card shadow-sm mb-4">
                <div className="card-body">
                  {/* Post Header */}
                  <div className="d-flex align-items-center mb-3">
                    <Image 
                      src={post.user.profileImage}
                      alt={post.user.name}
                      width={40}
                      height={40}
                      className="rounded-circle me-2"
                    />
                    <div>
                      <h6 className="mb-0">{post.user.name}</h6>
                      <small className="text-muted">
                        {format(new Date(post.createdAt), 'MMM d, yyyy h:mm a')}
                      </small>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  <p className="card-text">{post.content}</p>
                  
                  {/* Skill Tag */}
                  <div className="mb-3">
                    <Link 
                      href={`/skills/${post.skillTag}`}
                      className="badge bg-light text-dark text-decoration-none"
                    >
                      #{post.skillTag}
                    </Link>
                  </div>
                  
                  {/* Post Actions */}
                  <div className="d-flex align-items-center mb-3">
                    <button 
                      className={`btn btn-sm ${post.likes.includes(currentUser?.id) ? 'btn-primary' : 'btn-outline-primary'} me-2`}
                      onClick={() => handleLikePost(post.id)}
                    >
                      <i className="bi bi-heart-fill me-1"></i>
                      {post.likes.length} Like{post.likes.length !== 1 ? 's' : ''}
                    </button>
                    <button className="btn btn-sm btn-outline-secondary">
                      <i className="bi bi-chat-left-text-fill me-1"></i>
                      {post.comments.length} Comment{post.comments.length !== 1 ? 's' : ''}
                    </button>
                  </div>
                  
                  {/* Comments */}
                  {post.comments.length > 0 && (
                    <div className="mb-3">
                      <h6 className="mb-2 small">Comments</h6>
                      {post.comments.map(comment => (
                        <div key={comment.id} className="d-flex mb-2">
                          <Image 
                            src={comment.user.profileImage}
                            alt={comment.user.name}
                            width={32}
                            height={32}
                            className="rounded-circle me-2"
                          />
                          <div className="p-2 bg-light rounded-3 flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                              <h6 className="mb-0 small">{comment.user.name}</h6>
                              <small className="text-muted">
                                {format(new Date(comment.createdAt), 'MMM d, h:mm a')}
                              </small>
                            </div>
                            <p className="mb-0 small">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add Comment */}
                  <div className="d-flex">
                    {currentUser && (
                      <Image 
                        src={currentUser.profileImage}
                        alt={currentUser.name}
                        width={32}
                        height={32}
                        className="rounded-circle me-2"
                      />
                    )}
                    <div className="flex-grow-1">
                      <div className="input-group">
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          placeholder="Write a comment..."
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                        />
                        <button 
                          className="btn btn-sm btn-primary"
                          onClick={() => handleAddComment(post.id)}
                          disabled={!commentInputs[post.id]}
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Right Sidebar - Trending Skills & Suggested Teachers */}
        <div className="col-lg-3">
          {/* Popular Skills */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title mb-3">Popular Skills</h5>
              <ul className="list-group list-group-flush">
                {popularSkills.map(skill => (
                  <li key={skill.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <Link href={`/skills/${skill.name}`} className="text-decoration-none">
                      {skill.name}
                    </Link>
                    <span className="badge bg-primary rounded-pill">{skill.count}</span>
                  </li>
                ))}
              </ul>
              <div className="d-grid mt-3">
                <Link href="/skills" className="btn btn-outline-primary btn-sm" target="_blank" rel="noopener noreferrer">
                  Explore All Skills
                </Link>
              </div>
            </div>
          </div>
          
          {/* Suggested Teachers */}
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title mb-3">Suggested Teachers</h5>
              {suggestedTeachers.map(teacher => (
                <div key={teacher.user.id} className="d-flex align-items-center mb-3">
                  <Image 
                    src={teacher.user.profileImage}
                    alt={teacher.user.name}
                    width={48}
                    height={48}
                    className="rounded-circle me-3"
                  />
                  <div>
                    <h6 className="mb-0">{teacher.user.name}</h6>
                    <p className="mb-0 small text-muted">{teacher.user.skills.slice(0, 2).join(', ')}{teacher.user.skills.length > 2 ? '...' : ''}</p>
                    <div className="d-flex align-items-center mt-1">
                      <div className="small me-2">
                        <i className="bi bi-star-fill text-warning"></i>
                        <span className="ms-1">{teacher.rating}</span>
                      </div>
                      <div className="small">
                        <i className="bi bi-people-fill text-muted"></i>
                        <span className="ms-1">{teacher.sessionCount} sessions</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="d-grid mt-3">
                <Link href="/teachers" className="btn btn-outline-primary btn-sm">
                  Find More Teachers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
