'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NotificationsPanel from '../components/NotificationsPanel';
import ProfileInfo from '../components/user/ProfileInfo';
import MasteredSkillsSection from '../components/user/MasteredSkillsSection';
import UserPostsSection from '../components/user/UserPostsSection';

// import '../styles.css'; // Assuming these styles are now redundant or handled by Tailwind

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // State and functions for mastered skills now in MasteredSkillsSection
  const [masteredSkills, setMasteredSkills] = useState([]);
  const [masteredSkillsLoading, setMasteredSkillsLoading] = useState(false);

  // State and functions for posts now in UserPostsSection
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
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

  // Handle post form input changes (moved to UserPostsSection, keeping here for now if needed by parent)
  const handlePostInputChange = (e) => {
    // This function logic is now primarily in UserPostsSection
     console.log('handlePostInputChange called in parent');
  };

  // Fetch user posts (kept in parent to manage posts state at this level)
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

  // Handle post submission (kept in parent to manage posts state at this level)
  const handlePostSubmit = async (postData) => {
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

      // Handle skill tags properly
      if (postData.skillTag) {
        // If there's a single skill tag entered
        formData.append('skillTag', postData.skillTag);
        formData.append('skillTags', JSON.stringify([postData.skillTag]));
      } else if (postData.skillTags && postData.skillTags.length > 0) {
        // If there are multiple skill tags
        formData.append('skillTag', postData.skillTags[0]); // Use the first tag as primary
        formData.append('skillTags', JSON.stringify(postData.skillTags));
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
        // setPostData({...}); // This reset is now in UserPostsSection or will be passed down
        // setShowPostForm(false); // This is now in UserPostsSection or will be passed down
        // Add a short delay to ensure the post is saved before fetching
        setTimeout(() => fetchPosts(), 500);
      } else {
        console.error('Failed to create post:', responseData);
        alert(`Failed to create post: ${responseData.message || 'Unknown error'}`);
      }
       return response.ok; // Return success status
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Something went wrong while creating your post. Please try again.');
       return false;
    }
  };

  // Fetch posts when user data is loaded
  useEffect(() => {
    if (user?._id) {
      fetchPosts();
    }
  }, [user?._id]);

  // Function to fetch mastered skills separately (kept in parent to manage masteredSkills state)
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

  // Handle mastered skill form input changes (moved to MasteredSkillsSection)
  const handleMasteredSkillChange = (e) => {
     console.log('handleMasteredSkillChange called in parent');
  };

  // Submit mastered skill form (moved to MasteredSkillsSection)
  const handleMasteredSkillSubmit = async (newSkillData) => {
     console.log('handleMasteredSkillSubmit called in parent with:', newSkillData);
      try {
      const token = localStorage.getItem('token');
      const endpoint = '/api/mastered-skills'; // Assume POST for add/update

      const payload = {
        skill: newSkillData.name,
        description: newSkillData.description,
        experienceYears: newSkillData.experienceYears
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
        // Refresh the mastered skills list
        fetchMasteredSkills();
         return true; // Indicate success
      } else {
        alert(`Failed to save mastered skill: ${responseData.message || 'Unknown error'}`);
         return false; // Indicate failure
      }
    } catch (error) {
      console.error('Error with mastered skill:', error);
      alert('Something went wrong with the mastered skill operation.');
       return false; // Indicate failure
    }
  };

  // Delete a mastered skill (kept in parent to manage masteredSkills state)
  const handleDeleteMasteredSkill = async (skillName) => {
    if (!confirm(`Are you sure you want to delete the mastered skill "${skillName}"?`)) {
      return false;
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
         return true; // Indicate success
      } else {
        const errorData = await response.json();
        alert(`Failed to delete mastered skill: ${errorData.message || 'Unknown error'}`);
         return false; // Indicate failure
      }
    } catch (error) {
      console.error('Error deleting mastered skill:', error);
      alert('Something went wrong while deleting your mastered skill.');
       return false; // Indicate failure
    }
  };

  // Edit a mastered skill (moved to MasteredSkillsSection, kept here for passing down)
  const handleEditMasteredSkill = (skill) => {
     console.log('handleEditMasteredSkill called in parent with:', skill);
     // Logic for setting form state for editing is now in MasteredSkillsSection
  };

  if (!user) return <p className="text-center mt-8 text-gray-600">Loading...</p>;

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
          <div className="flex flex-wrap gap-2 mt-2">
            {days.map(day => (
              <span key={day} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {day}
              </span>
            ))}
          </div>
        )}

        {timeSlots.length > 0 && (
          <div className="mt-4">
            <div className="font-semibold mb-1">Time Slots:</div>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map(slot => (
                <span key={slot} className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Check if the current user has liked a post (kept in parent)
  const hasUserLikedPost = (post) => {
    return user && post.likes && post.likes.includes(user._id);
  };

  // Toggle like on a post (kept in parent to manage posts state)
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

  // Toggle comment section for a post (kept in parent to manage comments visibility)
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

  // Fetch comments for a post (kept in parent to manage postsWithComments state)
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

  // Add a comment to a post (kept in parent to manage posts and postsWithComments state)
  const handleAddComment = async (postId, content) => {
    if (!postId || !content.trim() || isCommenting) return;

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
          postId: postId,
          content: content
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Add the new comment to the comments list
        setPostsWithComments(prev => ({
          ...prev,
          [postId]: [
            ...(prev[postId] || []),
            data.comment
          ]
        }));

        // Update the post's comment count
        setPosts(currentPosts =>
          currentPosts.map(post => {
            if (post._id === postId) {
              return {
                ...post,
                comments: [...(post.comments || []), data.comment]
              };
            }
            return post;
          })
        );

        // Clear the comment text is handled in the child component
        // setCommentText('');
         return true; // Indicate success
      } else {
        console.error('Failed to add comment');
         return false; // Indicate failure
      }
    } catch (error) {
      console.error('Error adding comment:', error);
       return false; // Indicate failure
    } finally {
      setIsCommenting(false);
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row items-center justify-between mb-8">
        <div className="flex items-center mb-4 md:mb-0">
           {/* Removed duplicate logo as it is in layout header */}
        </div>
        <div className="flex-grow max-w-xl mx-auto md:mx-0 w-full">
          <form onSubmit={handleSearch} className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search for skills or users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              Search
            </button>
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300">
                Clear
              </button>
            )}
          </form>
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <NotificationsPanel />
          <button onClick={() => router.push('/friends')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
            Friends & Requests
          </button>
          <button onClick={() => router.push('/skills')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
            Discover Skills
          </button>
           <button onClick={() => router.push('/chat')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400">
            Messages
          </button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500">
            Logout
          </button>
        </div>
      </header>

      {searchResults && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 border-b pb-2">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-medium mb-2">Skills ({searchResults.skills.length})</h4>
              {searchResults.skills.length === 0 ? (
                <p className="text-gray-600">No skills found</p>
              ) : (
                <ul className="space-y-3">
                  {searchResults.skills.map(skill => (
                    <li
                      key={skill._id}
                      className="p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => navigateToSkill(skill.name)}
                    >
                      <h5 className="font-semibold text-blue-700">{skill.name}</h5>
                      <p className="text-sm text-gray-600">{skill.count} {skill.count === 1 ? 'person' : 'people'}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h4 className="text-lg font-medium mb-2">People ({searchResults.users.length})</h4>
              {searchResults.users.length === 0 ? (
                <p className="text-gray-600">No users found</p>
              ) : (
                <ul className="space-y-3">
                  {searchResults.users.map(user => (
                    <li
                      key={user.id}
                      className={`p-3 bg-gray-50 rounded-md cursor-pointer hover:bg-gray-100 transition-colors flex items-center space-x-3 ${user.isPrivate ? 'opacity-70' : ''}`}
                      onClick={() => navigateToUser(user.id)}>
                      <img
                        src={user.profileImage}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-grow">
                        <h5 className="font-semibold text-blue-700">{user.name} {user.isPrivate && <span className="ml-2 text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">🔒 Private</span>}</h5>
                        {!user.isPrivate ? (
                          <>
                            <p className="text-sm text-gray-600 truncate">
                              {user.skills?.length > 0
                                ? user.skills.slice(0, 3).join(', ') + (user.skills.length > 3 ? '...' : '')
                                : 'No skills listed'}
                            </p>
                            <p className="text-xs text-gray-500">{user.location}</p>
                          </>
                        ) : (
                          <p className="text-sm text-gray-600 italic">Send a friend request to view details</p>
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

      <div className="relative w-full h-64 md:h-80 bg-gray-300 rounded-lg overflow-hidden">
        <img src={coverImage} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
        <img src={profileImage} alt="Profile" className="absolute bottom-4 left-4 w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md" />
      </div>

      <div className="flex flex-col md:flex-row mt-16 md:mt-12 gap-8">
        <div className="w-full md:w-1/4">
           {/* This div was empty in original code, keeping it for layout structure */}
        </div>

        {/* Using the new ProfileInfo component */}
        <ProfileInfo
          user={user}
          displayName={displayName}
          displayBio={displayBio}
          displaySkills={displaySkills}
          formatAvailability={formatAvailability}
        />
      </div>

      {/* Using the new MasteredSkillsSection component */}
      <MasteredSkillsSection
        masteredSkills={masteredSkills}
        masteredSkillsLoading={masteredSkillsLoading}
        fetchMasteredSkills={fetchMasteredSkills}
        handleDeleteMasteredSkill={handleDeleteMasteredSkill}
        handleEditMasteredSkill={handleEditMasteredSkill}
      />

      {/* Using the new UserPostsSection component */}
      <UserPostsSection
        posts={posts}
        postsLoading={postsLoading}
        user={user}
        displayName={displayName}
        profileImage={profileImage}
        fetchPosts={fetchPosts}
        handlePostInputChange={handlePostInputChange}
        handlePostSubmit={handlePostSubmit}
        hasUserLikedPost={hasUserLikedPost}
        handleLikePost={handleLikePost}
        toggleComments={toggleComments}
        fetchComments={fetchComments}
        handleAddComment={handleAddComment}
        activeCommentPost={activeCommentPost}
        commentText={commentText}
        setCommentText={setCommentText}
        commentsVisible={commentsVisible}
        postsWithComments={postsWithComments}
        isLiking={isLiking}
        isCommenting={isCommenting}
      />

    </div>
  );
}
