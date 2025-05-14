'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import '../styles.css';
import NotificationsPanel from '../components/NotificationsPanel';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // State for mastered skills
  const [masteredSkills, setMasteredSkills] = useState([]);
  const [newMasteredSkill, setNewMasteredSkill] = useState({
    name: '',
    description: '',
    experienceYears: 1
  });
  const [showMasteredSkillForm, setShowMasteredSkillForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  const [masteredSkillsLoading, setMasteredSkillsLoading] = useState(false);

  // State for post creation
  const [showPostForm, setShowPostForm] = useState(false);
  const [postData, setPostData] = useState({
    content: '',
    skillTag: '',
    skillTags: [],
    media: null,
    mediaPreview: null,
    mediaType: null
  });
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);

  // Add state for likes and comments
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentsVisible, setCommentsVisible] = useState({});
  const [postsWithComments, setPostsWithComments] = useState({});
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => {
    async function fetchProfile() {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/profile', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      const data = await res.json();
      if (res.ok) {
        console.log('Profile data received:', data);
        // The API returns the user object directly, not nested
        setUser(data || {});
        // Set mastered skills from the user data if available
        if (data?.masteredSkills) {
          console.log('Mastered skills from profile API:', data.masteredSkills);
          setMasteredSkills(data.masteredSkills);
        }
      } else {
        console.error('Failed to fetch profile:', await res.text());
        router.push('/login'); // redirect to login if unauthorized
      }
    }

    fetchProfile();
    // Fetch mastered skills separately to ensure we have the latest data
    fetchMasteredSkills();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setIsSearching(true);

    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
        headers
      });

      const data = await res.json();

      if (res.ok) {
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  const navigateToSkill = (skillName) => {
    router.push(`/skills/${encodeURIComponent(skillName)}`);
  };

  const navigateToUser = (userId) => {
    router.push(`/user/${userId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Handle post form input changes
  const handlePostInputChange = (e) => {
    const { name, value, files } = e.target;

    if (name === 'media' && files && files.length > 0) {
      const file = files[0];
      const fileType = file.type.split('/')[0]; // 'image' or 'video'

      // Create a preview URL
      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        setPostData(prev => ({
          ...prev,
          media: file,
          mediaPreview: event.target.result,
          mediaType: fileType
        }));
      };
      fileReader.readAsDataURL(file);
    } else {
      setPostData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Fetch user posts
  const fetchPosts = async () => {
    if (!user?._id) return;

    setPostsLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching posts for user:', user._id);

      const response = await fetch(`/api/posts/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Posts received:', data.posts?.length || 0);
        setPosts(data.posts || []);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch posts:', errorText);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  // Handle post submission
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!postData.content) {
      alert('Please enter some content for your post');
      return;
    }

    if (!postData.skillTag && (!postData.skillTags || postData.skillTags.length === 0)) {
      alert('Please enter at least one skill tag');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('content', postData.content);

      // Send multiple skill tags if available, otherwise use the single skillTag
      if (postData.skillTags && postData.skillTags.length > 0) {
        formData.append('skillTag', postData.skillTags[0]); // Use the first tag as primary
        formData.append('skillTags', JSON.stringify(postData.skillTags));
      } else if (postData.skillTag) {
        formData.append('skillTag', postData.skillTag);
      }

      if (postData.media) {
        formData.append('media', postData.media);
      }

      console.log('Submitting post with data:', {
        content: postData.content,
        skillTag: postData.skillTag || (postData.skillTags && postData.skillTags[0]),
        hasMedia: !!postData.media
      });

      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('Post created successfully:', responseData);
        // Reset form and fetch updated posts
        setPostData({
          content: '',
          skillTag: '',
          skillTags: [],
          media: null,
          mediaPreview: null,
          mediaType: null
        });
        setShowPostForm(false);
        // Add a short delay to ensure the post is saved before fetching
        setTimeout(() => fetchPosts(), 500);
      } else {
        console.error('Failed to create post:', responseData);
        alert(`Failed to create post: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Something went wrong while creating your post. Please try again.');
    }
  };

  // Fetch posts when user data is loaded
  useEffect(() => {
    if (user?._id) {
      fetchPosts();
    }
  }, [user?._id]);

  // Function to fetch mastered skills separately
  const fetchMasteredSkills = async () => {
    try {
      console.log('🔍 Fetching mastered skills...');
      setMasteredSkillsLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/mastered-skills', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      console.log('✅ Mastered skills API response status:', res.status);

      if (res.ok) {
        const data = await res.json();
        console.log('📊 Mastered skills data received:', data);

        if (Array.isArray(data.masteredSkills)) {
          console.log('📋 Number of mastered skills:', data.masteredSkills.length);

          // Log each skill's name for debugging
          data.masteredSkills.forEach((skill, index) => {
            console.log(`Skill ${index + 1}:`, skill.name || 'unnamed skill');
          });

          setMasteredSkills(data.masteredSkills || []);
        } else {
          console.error('❌ masteredSkills is not an array:', data.masteredSkills);
          setMasteredSkills([]);
        }
      } else {
        console.error('❌ Failed to fetch mastered skills:', await res.text());
      }
    } catch (error) {
      console.error('❌ Error fetching mastered skills:', error);
    } finally {
      setMasteredSkillsLoading(false);
    }
  };

  // Handle mastered skill form input changes
  const handleMasteredSkillChange = (e) => {
    const { name, value } = e.target;
    setNewMasteredSkill(prev => ({
      ...prev,
      [name]: name === 'experienceYears' ? parseInt(value) || 0 : value
    }));
  };

  // Submit mastered skill form
  const handleMasteredSkillSubmit = async (e) => {
    e.preventDefault();

    if (!newMasteredSkill.name) {
      alert('Skill name is required!');
      return;
    }

    try {
      console.log('Submitting mastered skill:', newMasteredSkill);

      const token = localStorage.getItem('token');
      const endpoint = '/api/mastered-skills';

      // Prepare the request payload
      const payload = {
        skill: newMasteredSkill.name,
        description: newMasteredSkill.description,
        experienceYears: newMasteredSkill.experienceYears
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();
      console.log('API response:', responseData);

      if (response.ok) {
        // Reset form
        setNewMasteredSkill({ name: '', description: '', experienceYears: 1 });
        setShowMasteredSkillForm(false);
        setEditingSkillId(null);

        // Refresh the mastered skills list
        fetchMasteredSkills();

        alert(`Successfully ${editingSkillId ? 'updated' : 'added'} mastered skill!`);
      } else {
        alert(`Failed to ${editingSkillId ? 'update' : 'add'} mastered skill: ${responseData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error with mastered skill:', error);
      alert('Something went wrong with the mastered skill operation.');
    }
  };

  // Delete a mastered skill
  const handleDeleteMasteredSkill = async (skillName) => {
    if (!confirm(`Are you sure you want to delete the mastered skill "${skillName}"?`)) {
      return;
    }

    try {
      console.log(`Attempting to delete mastered skill: ${skillName}`);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/mastered-skills?skill=${encodeURIComponent(skillName)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Delete skill response:', data);

      if (response.ok) {
        // Refresh mastered skills
        console.log('Successfully deleted skill, refreshing mastered skills');
        fetchMasteredSkills();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete mastered skill: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting mastered skill:', error);
      alert('Something went wrong while deleting your mastered skill.');
    }
  };

  // Edit a mastered skill
  const handleEditMasteredSkill = (skill) => {
    setNewMasteredSkill({
      name: skill.name,
      description: skill.description || '',
      experienceYears: skill.experienceYears || 1
    });
    setEditingSkillId(skill._id);
    setShowMasteredSkillForm(true);
  };

  if (!user) return <p>Loading...</p>;

  const displayName = user.name || 'No Name Provided';
  const displayBio = user.bio || "This user hasn't added a bio yet.";
  const displaySkills = user.skills?.length > 0 ? user.skills.join(', ') : 'No skills added.';
  const profileImage = user.profileImage?.trim() ? user.profileImage : '/images/profile-placeholder.png';
  const coverImage = user.coverImage?.trim() ? user.coverImage : '/images/cover-placeholder.png';

  // Format availability for display
  let availabilityData = {};
  let timeSlots = [];
  try {
    if (user.availability) {
      if (typeof user.availability === 'string') {
        try {
          // Try to parse as JSON
          const parsedData = JSON.parse(user.availability);
          if (parsedData.days) {
            availabilityData = parsedData.days;
            timeSlots = parsedData.timeSlots || [];
          } else {
            // Legacy format - just days
            availabilityData = parsedData;
          }
        } catch (parseError) {
          // If not valid JSON, treat as a simple string description
          console.log('Availability is a non-JSON string:', user.availability);
          timeSlots = [user.availability]; // Store as a single time slot
        }
      } else {
        availabilityData = user.availability;
      }
    }
  } catch (e) {
    console.error('Error handling availability:', e);
  }

  // Format availability for display
  const formatAvailability = () => {
    const days = Object.keys(availabilityData);

    if (days.length === 0 && timeSlots.length === 0) {
      return "No availability set";
    }

    return (
      <div>
        {days.length > 0 && (
          <div className="availability-display">
            {days.map(day => (
              <span key={day} className="availability-day-tag">{day}</span>
            ))}
          </div>
        )}

        {timeSlots.length > 0 && (
          <div className="time-slots-display">
            <div className="time-slot-header">Time Slots:</div>
            <div className="time-slot-tags">
              {timeSlots.map(slot => (
                <span key={slot} className="time-slot-tag">{slot}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Check if the current user has liked a post
  const hasUserLikedPost = (post) => {
    return user && post.likes && post.likes.includes(user._id);
  };

  // Toggle like on a post
  const handleLikePost = async (postId) => {
    if (isLiking) return;

    setIsLiking(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts/like', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      });

      if (response.ok) {
        // Update the posts state to reflect the like
        setPosts(currentPosts =>
          currentPosts.map(post => {
            if (post._id === postId) {
              const userLikedIndex = post.likes.indexOf(user._id);

              if (userLikedIndex === -1) {
                // Add like
                return { ...post, likes: [...post.likes, user._id] };
              } else {
                // Remove like
                const newLikes = [...post.likes];
                newLikes.splice(userLikedIndex, 1);
                return { ...post, likes: newLikes };
              }
            }
            return post;
          })
        );
      } else {
        console.error('Failed to update like status');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Toggle comment section for a post
  const toggleComments = async (postId) => {
    // Toggle comments visibility
    setCommentsVisible(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));

    // If we're showing comments and haven't loaded them yet, fetch them
    if (!commentsVisible[postId] && !postsWithComments[postId]) {
      await fetchComments(postId);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const response = await fetch(`/api/posts/comment?postId=${postId}`);

      if (response.ok) {
        const data = await response.json();
        setPostsWithComments(prev => ({
          ...prev,
          [postId]: data.comments || []
        }));
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  // Add a comment to a post
  const handleAddComment = async (e) => {
    e.preventDefault();

    if (!activeCommentPost || !commentText.trim() || isCommenting) return;

    setIsCommenting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          postId: activeCommentPost,
          content: commentText
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Add the new comment to the comments list
        setPostsWithComments(prev => ({
          ...prev,
          [activeCommentPost]: [
            ...(prev[activeCommentPost] || []),
            data.comment
          ]
        }));

        // Update the post's comment count
        setPosts(currentPosts =>
          currentPosts.map(post => {
            if (post._id === activeCommentPost) {
              return {
                ...post,
                comments: [...(post.comments || []), data.comment]
              };
            }
            return post;
          })
        );

        // Clear the comment text
        setCommentText('');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <div className="profile-wrapper">
      <header className="profile-header">
        <img src="/logo.png" alt="SkillShikhi Logo" className="logo" />
        <div className="search-container">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search for skills or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              Search
            </button>
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="clear-button">
                Clear
              </button>
            )}
          </form>
        </div>
        <div className="nav-buttons">
          <NotificationsPanel />
          <button onClick={() => router.push('/friends')} className="friends-button">
            Friends & Requests
          </button>
          <button onClick={() => router.push('/skills')} className="discover-button">
            Discover Skills
          </button>
          <button onClick={() => router.push('/chat')} className="action-button">
            Messages
          </button>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      {searchResults && (
        <div className="search-results-container">
          <div className="search-results">
            <div className="search-section">
              <h3>Skills ({searchResults.skills.length})</h3>
              {searchResults.skills.length === 0 ? (
                <p>No skills found</p>
              ) : (
                <ul className="results-list">
                  {searchResults.skills.map(skill => (
                    <li
                      key={skill._id}
                      className="result-item skill-result"
                      onClick={() => navigateToSkill(skill.name)}
                    >
                      <div className="result-content">
                        <h4>{skill.name}</h4>
                        <p>{skill.count} {skill.count === 1 ? 'person' : 'people'}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="search-section">
              <h3>People ({searchResults.users.length})</h3>
              {searchResults.users.length === 0 ? (
                <p>No users found</p>
              ) : (
                <ul className="results-list">
                  {searchResults.users.map(user => (
                    <li
                      key={user.id}
                      className={`result-item user-result ${user.isPrivate ? 'private-profile' : ''}`}
                      onClick={() => navigateToUser(user.id)}
                    >
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="result-user-image"
                      />
                      <div className="result-content">
                        <h4>{user.name} {user.isPrivate && <span className="private-badge">🔒 Private</span>}</h4>
                        {!user.isPrivate ? (
                          <>
                            <p className="user-skills">
                              {user.skills?.length > 0
                                ? user.skills.slice(0, 3).join(', ') + (user.skills.length > 3 ? '...' : '')
                                : 'No skills listed'}
                            </p>
                            <p className="user-location">{user.location}</p>
                          </>
                        ) : (
                          <p className="private-message">Send a friend request to view details</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="cover-container">
        <img src={coverImage} alt="Cover" className="cover-image" />
        <img src={profileImage} alt="Profile" className="profile-picture" />
      </div>

      <div className="profile-content">
        <div className="profile-left" />
        <div className="profile-right">
          <h1>{displayName}</h1>
          <p className="bio"><em>{displayBio}</em></p>

          <p><strong>Skills:</strong> {displaySkills}</p>

          <div className="availability-section">
            <strong>Availability:</strong>
            {formatAvailability()}
          </div>

          <p><strong>Location:</strong> {user.location || 'Not specified'}</p>

          <button className="edit-button" onClick={() => router.push('/profile/edit')}>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Mastered Skills Section */}
      <div className="mastered-skills-surface">
        <div className="surface-header">
          <h2>Mastered Skills</h2>
          <p>Showcase skills you've mastered and want to teach others</p>
        </div>

        <div className="mastered-skills-container">
          {masteredSkillsLoading ? (
            <div className="loading-mastered-skills">
              <div className="loading-spinner"></div>
              <p>Loading your mastered skills...</p>
            </div>
          ) : masteredSkills.length > 0 ? (
            <div className="mastered-skills-list">
              {masteredSkills.map((skill) => (
                <div key={skill._id || skill.name} className="mastered-skill-card">
                  <div className="mastered-skill-header">
                    <div className="skill-name-badge">
                      <span className="skill-icon">🎓</span>
                      <h3>{skill.name}</h3>
                    </div>
                    <div className="mastered-skill-actions">
                      <button
                        onClick={() => handleEditMasteredSkill(skill)}
                        className="mastered-skill-edit-btn"
                        title="Edit this skill"
                      >
                        <span className="button-icon">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDeleteMasteredSkill(skill.name)}
                        className="mastered-skill-delete-btn"
                        title="Delete this skill"
                      >
                        <span className="button-icon">🗑️</span>
                      </button>
                    </div>
                  </div>
                  {skill.description && (
                    <p className="mastered-skill-description">{skill.description}</p>
                  )}
                  <div className="mastered-skill-meta">
                    <span className="mastered-skill-experience">
                      <span className="experience-icon">⏱️</span>
                      {skill.experienceYears} {skill.experienceYears === 1 ? 'year' : 'years'} of experience
                    </span>
                    <span className="teach-badge">Available to teach</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-mastered-skills">
              <div className="empty-state-icon">🧠</div>
              <p>You haven't added any mastered skills yet.</p>
              <p className="empty-state-hint">Add skills you're proficient in and want to teach others!</p>
            </div>
          )}

          {showMasteredSkillForm ? (
            <div className="mastered-skill-form-container">
              <h3 className="form-title">{editingSkillId ? 'Edit Mastered Skill' : 'Add Mastered Skill'}</h3>
              <form onSubmit={handleMasteredSkillSubmit} className="mastered-skill-form">
                <div className="form-group">
                  <label htmlFor="skillName">Skill Name<span className="required">*</span></label>
                  <input
                    type="text"
                    id="skillName"
                    name="name"
                    value={newMasteredSkill.name}
                    onChange={handleMasteredSkillChange}
                    placeholder="e.g., JavaScript, Photography, Chess"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="skillDescription">Description</label>
                  <textarea
                    id="skillDescription"
                    name="description"
                    value={newMasteredSkill.description}
                    onChange={handleMasteredSkillChange}
                    placeholder="Describe your expertise and what you can teach others"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="experienceYears">Years of Experience</label>
                  <div className="number-input-container">
                    <button
                      type="button"
                      className="number-control"
                      onClick={() => {
                        if (newMasteredSkill.experienceYears > 1) {
                          setNewMasteredSkill({
                            ...newMasteredSkill,
                            experienceYears: newMasteredSkill.experienceYears - 1
                          });
                        }
                      }}
                    >-</button>
                    <input
                      type="number"
                      id="experienceYears"
                      name="experienceYears"
                      min="1"
                      max="50"
                      value={newMasteredSkill.experienceYears}
                      onChange={handleMasteredSkillChange}
                    />
                    <button
                      type="button"
                      className="number-control"
                      onClick={() => {
                        if (newMasteredSkill.experienceYears < 50) {
                          setNewMasteredSkill({
                            ...newMasteredSkill,
                            experienceYears: newMasteredSkill.experienceYears + 1
                          });
                        }
                      }}
                    >+</button>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="submit-btn">
                    {editingSkillId ? 'Update Skill' : 'Add Skill'}
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => {
                      setShowMasteredSkillForm(false);
                      setNewMasteredSkill({ name: '', description: '', experienceYears: 1 });
                      setEditingSkillId(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button
              className="add-mastered-skill-btn"
              onClick={() => setShowMasteredSkillForm(true)}
            >
              <span className="add-icon">+</span> Add a Mastered Skill
            </button>
          )}
        </div>

        <style jsx>{`
          .mastered-skills-surface {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin-bottom: 30px;
            border-top: 5px solid #6366f1;
          }
          
          .surface-header {
            margin-bottom: 25px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 15px;
          }
          
          .surface-header h2 {
            font-size: 24px;
            font-weight: 700;
            margin: 0 0 8px 0;
            color: #1f2937;
          }
          
          .surface-header p {
            color: #6b7280;
            margin: 0;
            font-size: 15px;
          }
          
          .mastered-skills-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 25px;
          }
          
          .mastered-skill-card {
            background-color: #f9fafb;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            border-left: 4px solid #6366f1;
            transition: all 0.2s ease;
          }
          
          .mastered-skill-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
          }
          
          .mastered-skill-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .skill-name-badge {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .skill-name-badge h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
          }
          
          .skill-icon {
            font-size: 20px;
          }
          
          .mastered-skill-description {
            color: #4b5563;
            margin: 0 0 15px 0;
            font-size: 14px;
            line-height: 1.5;
          }
          
          .mastered-skill-meta {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 15px;
            border-top: 1px dashed #e5e7eb;
            padding-top: 15px;
          }
          
          .mastered-skill-experience {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
            color: #6b7280;
          }
          
          .experience-icon {
            font-size: 16px;
          }
          
          .teach-badge {
            background-color: #10b981;
            color: white;
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
          }
          
          .mastered-skill-actions {
            display: flex;
            gap: 8px;
          }
          
          .mastered-skill-edit-btn, .mastered-skill-delete-btn {
            background: none;
            border: none;
            padding: 6px;
            border-radius: 5px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .mastered-skill-edit-btn {
            color: #4b5563;
          }
          
          .mastered-skill-delete-btn {
            color: #ef4444;
          }
          
          .mastered-skill-edit-btn:hover {
            background-color: #e5e7eb;
          }
          
          .mastered-skill-delete-btn:hover {
            background-color: #fee2e2;
          }
          
          .button-icon {
            font-size: 16px;
          }
          
          .no-mastered-skills {
            text-align: center;
            padding: 40px;
            background-color: #f9fafb;
            border-radius: 10px;
            border: 2px dashed #e5e7eb;
          }
          
          .empty-state-icon {
            font-size: 40px;
            margin-bottom: 15px;
          }
          
          .empty-state-hint {
            color: #6b7280;
            font-style: italic;
            margin-top: 5px;
          }
          
          .loading-mastered-skills {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px;
          }
          
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #e5e7eb;
            border-top: 4px solid #6366f1;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 15px;
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          .mastered-skill-form-container {
            background-color: #f9fafb;
            border-radius: 10px;
            padding: 25px;
            margin-top: 20px;
            border: 1px solid #e5e7eb;
          }
          
          .form-title {
            margin: 0 0 20px 0;
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            padding-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .mastered-skill-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          
          .form-group label {
            font-weight: 500;
            color: #4b5563;
            font-size: 14px;
          }
          
          .required {
            color: #ef4444;
            margin-left: 2px;
          }
          
          .form-group input, .form-group textarea {
            padding: 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s ease;
          }
          
          .form-group input:focus, .form-group textarea:focus {
            border-color: #6366f1;
            outline: none;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          .number-input-container {
            display: flex;
            align-items: center;
          }
          
          .number-control {
            width: 36px;
            height: 36px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #e5e7eb;
            border: none;
            font-size: 18px;
            cursor: pointer;
            color: #4b5563;
          }
          
          .number-control:first-child {
            border-radius: 6px 0 0 6px;
          }
          
          .number-control:last-child {
            border-radius: 0 6px 6px 0;
          }
          
          .number-input-container input {
            width: 60px;
            text-align: center;
            border-radius: 0;
            border-left: none;
            border-right: none;
          }
          
          .form-actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
          }
          
          .submit-btn, .cancel-btn {
            padding: 12px 20px;
            border-radius: 6px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
          }
          
          .submit-btn {
            background-color: #6366f1;
            color: white;
          }
          
          .cancel-btn {
            background-color: #e5e7eb;
            color: #4b5563;
          }
          
          .submit-btn:hover {
            background-color: #4f46e5;
          }
          
          .cancel-btn:hover {
            background-color: #d1d5db;
          }
          
          .add-mastered-skill-btn {
            margin-top: 20px;
            padding: 12px 20px;
            background-color: white;
            color: #6366f1;
            border: 2px dashed #6366f1;
            border-radius: 6px;
            font-weight: 500;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            width: 100%;
          }
          
          .add-mastered-skill-btn:hover {
            background-color: #f5f3ff;
          }
          
          .add-icon {
            font-size: 18px;
            font-weight: bold;
          }
          
          @media (max-width: 768px) {
            .mastered-skills-list {
              grid-template-columns: 1fr;
            }
            
            .mastered-skill-meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 10px;
            }
            
            .teach-badge {
              align-self: flex-start;
            }
          }
        `}</style>
      </div>

      {/* Share Skills Section - Now on a different surface */}
      <div className="share-skills-surface">
        <div className="surface-header">
          <h2>Showcase Your Skills</h2>
          <p>Share your progress and achievements with the community</p>
        </div>

        <div className="facebook-style-share">
          <div className="share-skills-input" onClick={() => setShowPostForm(true)}>
            <img src={profileImage} alt="Profile" className="share-profile-pic" />
            <div className="share-prompt">
              What skill did you improve today?
            </div>
          </div>

          <div className="share-skills-actions">
            <button
              className="share-action-button photo-button"
              onClick={() => setShowPostForm(true)}
            >
              <span className="share-icon">📷</span> Photo/Video
            </button>
            <button
              className="share-action-button skill-button"
              onClick={() => setShowPostForm(true)}
            >
              <span className="share-icon">🎯</span> Skill Update
            </button>
          </div>
        </div>

        {/* Display Posts */}
        {posts.length > 0 && (
          <div className="posts-container home-posts">
            <h3>Your Skill Updates</h3>

            <div className="posts-list">
              {posts.map(post => (
                <div key={post._id} className="post-card">
                  <div className="post-header">
                    <img src={profileImage} alt={displayName} className="post-author-pic" />
                    <div>
                      <div className="post-author">{displayName}</div>
                      <div className="post-skill-tag">{post.skillTag}</div>
                      <div className="post-date">{new Date(post.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="post-content">{post.content}</div>

                  {post.mediaUrl && (
                    <div className="post-media">
                      {post.mediaType === 'image' ? (
                        <img src={post.mediaUrl} alt="Post media" />
                      ) : (
                        <video src={post.mediaUrl} controls />
                      )}
                    </div>
                  )}

                  <div className="post-actions">
                    <button
                      className={`like-button ${hasUserLikedPost(post) ? 'liked' : ''}`}
                      onClick={() => handleLikePost(post._id)}
                      disabled={isLiking}
                    >
                      <span>{hasUserLikedPost(post) ? '❤️' : '👍'}</span>
                      {post.likes?.length || 0}
                    </button>
                    <button
                      className={`comment-button ${commentsVisible[post._id] ? 'active' : ''}`}
                      onClick={() => toggleComments(post._id)}
                    >
                      <span>💬</span> {post.comments?.length || 0}
                    </button>
                  </div>

                  {/* Comments section */}
                  {commentsVisible[post._id] && (
                    <div className="comments-section">
                      <div className="comments-list">
                        {postsWithComments[post._id] && postsWithComments[post._id].length > 0 ? (
                          postsWithComments[post._id].map((comment, index) => (
                            <div key={index} className="comment-item">
                              <img
                                src={comment.user?.profileImage || '/images/profile-placeholder.png'}
                                alt={comment.user?.name || 'User'}
                                className="comment-user-pic"
                              />
                              <div className="comment-content">
                                <div className="comment-user-name">{comment.user?.name || 'User'}</div>
                                <div className="comment-text">{comment.content}</div>
                                <div className="comment-date">
                                  {new Date(comment.createdAt).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="no-comments">No comments yet. Be the first to comment!</div>
                        )}
                      </div>

                      <form className="comment-form" onSubmit={handleAddComment}>
                        <img src={profileImage} alt={displayName} className="comment-user-pic" />
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onFocus={() => setActiveCommentPost(post._id)}
                          className="comment-input"
                        />
                        <button
                          type="submit"
                          className="comment-submit"
                          disabled={!commentText.trim() || isCommenting}
                        >
                          Post
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Form Popup */}
      {showPostForm && (
        <div className="post-form-overlay">
          <div className="post-form-popup">
            <div className="post-form-header">
              <h3>Share Your Skills</h3>
              <button
                className="close-form-button"
                onClick={() => setShowPostForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="post-form">
              <div className="post-form-user">
                <img src={profileImage} alt={displayName} className="post-user-pic" />
                <div className="post-user-name">{displayName}</div>
              </div>

              <textarea
                name="content"
                placeholder="What skill did you improve today?"
                value={postData.content}
                onChange={handlePostInputChange}
                required
              />

              <div className="skill-input">
                <input
                  type="text"
                  name="skillTag"
                  placeholder="Enter skill name..."
                  value={postData.skillTag}
                  onChange={handlePostInputChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && postData.skillTag.trim()) {
                      e.preventDefault();
                      setPostData(prev => ({
                        ...prev,
                        skillTags: [...(prev.skillTags || []), prev.skillTag.trim()],
                        skillTag: ''
                      }));
                    }
                  }}
                />

                {postData.skillTags && postData.skillTags.length > 0 && (
                  <div className="selected-skills">
                    {postData.skillTags.map((skill, index) => (
                      <span key={index} className="skill-tag selected">
                        {skill}
                        <button
                          type="button"
                          className="remove-skill"
                          onClick={() => {
                            setPostData(prev => ({
                              ...prev,
                              skillTags: prev.skillTags.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {user.skills?.length > 0 && (
                  <div className="skill-suggestions">
                    <span className="suggestions-label">Your skills:</span>
                    <div className="skill-tags">
                      {user.skills
                        .filter(skill => !postData.skillTags?.includes(skill))
                        .map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            className="skill-tag"
                            onClick={() => {
                              if (postData.skillTags?.includes(skill)) return;
                              setPostData(prev => ({
                                ...prev,
                                skillTags: [...(prev.skillTags || []), skill],
                                skillTag: ''
                              }));
                            }}
                          >
                            {skill}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="media-upload">
                <label>
                  <span className="share-icon">📷</span> Add Photo/Video
                  <input
                    type="file"
                    name="media"
                    accept="image/*,video/*"
                    onChange={handlePostInputChange}
                  />
                </label>

                {postData.mediaPreview && (
                  <div className="media-preview">
                    {postData.mediaType === 'image' ? (
                      <img src={postData.mediaPreview} alt="Preview" />
                    ) : (
                      <video src={postData.mediaPreview} controls />
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="post-submit-button">
                Share
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
