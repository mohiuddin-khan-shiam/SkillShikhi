'use client';

import { useState } from 'react';

export default function UserPostsSection({
  posts,
  postsLoading,
  user,
  displayName,
  profileImage,
  fetchPosts,
  handlePostInputChange,
  handlePostSubmit,
  hasUserLikedPost,
  handleLikePost,
  toggleComments,
  fetchComments,
  handleAddComment,
  activeCommentPost,
  commentText,
  setCommentText,
  commentsVisible,
  postsWithComments,
  isLiking,
  isCommenting
}) {

  const [showPostForm, setShowPostForm] = useState(false);
  const [postData, setPostData] = useState({
    content: '',
    skillTag: '',
    skillTags: [],
    media: null,
    mediaPreview: null,
    mediaType: null
  });

   const handleLocalPostInputChange = (e) => {
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
     if(handlePostInputChange) handlePostInputChange(e); // Call prop if exists
  };

  const handleLocalPostSubmit = async (e) => {
    e.preventDefault();
     if(handlePostSubmit) await handlePostSubmit(e);
     // Reset form after submission if needed - this might be handled by the parent now
      setPostData({
          content: '',
          skillTag: '',
          skillTags: [],
          media: null,
          mediaPreview: null,
          mediaType: null
        });
        setShowPostForm(false);
  }


  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
      <div className="border-b pb-4 mb-6">
        <h2>Showcase Your Skills</h2>
        <p>Share your progress and achievements with the community</p>
      </div>

      <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowPostForm(true)}>
        <img src={profileImage} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
        <div className="text-gray-500 italic">
          What skill did you improve today?
        </div>
      </div>

      {/* Display Posts */}
      {postsLoading ? (
        <div className="col-span-full flex flex-col items-center justify-center p-8 text-gray-600">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-4 border-blue-600 mb-4"></div>
          <p>Loading your posts...</p>
        </div>
      ) : posts.length > 0 && (
        <div className="mt-8 space-y-6">
          <h3 className="text-xl font-semibold border-b pb-2">Your Skill Updates</h3>

          <div className="space-y-6">
            {posts.map(post => (
              <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-4">
                  <img src={profileImage} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div className="font-semibold text-gray-800">{displayName}</div>
                    <div className="text-sm text-gray-600">{post.skillTag}</div>
                    <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="text-gray-800 mb-4">{post.content}</div>

                {post.mediaUrl && (
                  <div className="mb-4 rounded-lg overflow-hidden">
                    {post.mediaType === 'image' ? (
                      <img src={post.mediaUrl} alt="Post media" className="w-full h-auto object-cover" />
                    ) : (
                      <video src={post.mediaUrl} controls className="w-full h-auto" />
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-6 text-gray-600">
                  <button
                    className={`flex items-center space-x-1 hover:text-blue-600 ${hasUserLikedPost(post) ? 'text-blue-600' : ''}`}
                    onClick={() => handleLikePost(post._id)}
                    disabled={isLiking}
                  >
                    <span>{hasUserLikedPost(post) ? '❤️' : '👍'}</span>
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <button
                    className={`flex items-center space-x-1 hover:text-blue-600 ${commentsVisible[post._id] ? 'text-blue-600' : ''}`}
                    onClick={() => toggleComments(post._id)}
                  >
                    <span>💬</span>
                    <span>{post.comments?.length || 0}</span>
                  </button>
                </div>

                {/* Comments section */}
                {commentsVisible[post._id] && (
                  <div className="mt-4 border-t pt-4 border-gray-200">
                    <div className="space-y-4">
                      {postsWithComments[post._id] && postsWithComments[post._id].length > 0 ? (
                        postsWithComments[post._id].map((comment, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <img
                              src={comment.user?.profileImage || '/images/profile-placeholder.png'}
                              alt={comment.user?.name || 'User'}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-grow bg-gray-100 p-3 rounded-lg">
                              <div className="font-semibold text-gray-800 text-sm">{comment.user?.name || 'User'}</div>
                              <div className="text-gray-700 text-sm">{comment.content}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(comment.createdAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-gray-500 italic mt-4">No comments yet. Be the first to comment!</div>
                      )}
                    </div>

                    <form className="mt-4 flex items-center space-x-3" onSubmit={handleAddComment}>
                      <img src={profileImage} alt={displayName} className="w-8 h-8 rounded-full object-cover" />
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        onFocus={() => setActiveCommentPost(post._id)}
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
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

      {/* Post Form Popup */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Share Your Skills</h3>
              <button
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                onClick={() => setShowPostForm(false)}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLocalPostSubmit} className="flex flex-col space-y-4">
              <div className="flex items-center space-x-3">
                <img src={profileImage} alt={displayName} className="w-10 h-10 rounded-full object-cover" />
                <div className="font-semibold text-gray-800">{displayName}</div>
              </div>

              <textarea
                name="content"
                placeholder="What skill did you improve today?"
                value={postData.content}
                onChange={handleLocalPostInputChange}
                required
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div>
                <input
                  type="text"
                  name="skillTag"
                  placeholder="Enter skill name..."
                  value={postData.skillTag}
                  onChange={handleLocalPostInputChange}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {postData.skillTags && postData.skillTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {postData.skillTags.map((skill, index) => (
                      <span key={index} className="flex items-center bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {skill}
                        <button
                          type="button"
                          className="ml-2 text-blue-800 hover:text-blue-900 leading-none"
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
                  <div className="mt-4">
                    <span className="block text-sm font-medium text-gray-700 mb-2">Your skills:</span>
                    <div className="flex flex-wrap gap-2">
                      {user.skills
                        .filter(skill => !postData.skillTags?.includes(skill))
                        .map((skill, index) => (
                          <button
                            key={index}
                            type="button"
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-300 transition-colors"
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

              <div>
                <label className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 cursor-pointer">
                  <span className="text-xl">📷</span>
                  <span>Add Photo/Video</span>
                  <input
                    type="file"
                    name="media"
                    accept="image/*,video/*"
                    onChange={handleLocalPostInputChange}
                    className="hidden"
                  />
                </label>

                {postData.mediaPreview && (
                  <div className="mt-4 rounded-lg overflow-hidden">
                    {postData.mediaType === 'image' ? (
                      <img src={postData.mediaPreview} alt="Preview" className="w-full h-auto object-cover" />
                    ) : (
                      <video src={postData.mediaPreview} controls className="w-full h-auto" />
                    )}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed">
                Share
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
