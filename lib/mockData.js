'use client';

// Utility for generating placeholder profile images
export function getProfileImage(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true&font-size=0.5&length=2&rounded=true`;
}

// Mock Users Data
export const mockUsers = [
  {
    id: 'user1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    bio: 'Photography enthusiast with a passion for capturing urban landscapes and teaching others the art of composition.',
    skills: ['Photography', 'Editing', 'Visual Arts'],
    profileImage: getProfileImage('Sarah Johnson'),
    location: 'Dhaka, Bangladesh',
    occupation: 'Professional Photographer'
  },
  {
    id: 'user2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    bio: 'Software engineer with a passion for teaching coding to beginners. Specializing in web development and Python.',
    skills: ['Programming', 'Web Development', 'Python', 'JavaScript'],
    profileImage: getProfileImage('Michael Chen'),
    location: 'Chittagong, Bangladesh',
    occupation: 'Senior Software Engineer'
  },
  {
    id: 'user3',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    bio: 'Culinary enthusiast eager to learn and share authentic regional cooking techniques.',
    skills: ['Cooking', 'Baking'],
    profileImage: getProfileImage('Priya Sharma'),
    location: 'Rajshahi, Bangladesh',
    occupation: 'Home Chef & Food Blogger'
  },
  {
    id: 'user4',
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    bio: 'Mathematics tutor with experience teaching students from elementary to university level.',
    skills: ['Mathematics', 'Physics', 'Statistics'],
    profileImage: getProfileImage('Ahmed Khan'),
    location: 'Sylhet, Bangladesh',
    occupation: 'Mathematics Professor'
  },
  {
    id: 'user5',
    name: 'Fatima Rahman',
    email: 'fatima.rahman@example.com',
    bio: 'Digital artist teaching drawing techniques and digital illustration.',
    skills: ['Digital Art', 'Illustration', 'Drawing'],
    profileImage: getProfileImage('Fatima Rahman'),
    location: 'Khulna, Bangladesh',
    occupation: 'Digital Artist & Instructor'
  }
];

// Mock Skills Data
export const mockSkills = [
  { id: 'skill1', name: 'photography', count: 15 },
  { id: 'skill2', name: 'cooking', count: 23 },
  { id: 'skill3', name: 'programming', count: 35 },
  { id: 'skill4', name: 'web development', count: 28 },
  { id: 'skill5', name: 'javascript', count: 30 },
  { id: 'skill6', name: 'react', count: 20 },
  { id: 'skill7', name: 'python', count: 25 },
  { id: 'skill8', name: 'mathematics', count: 14 },
  { id: 'skill9', name: 'digital art', count: 18 },
  { id: 'skill10', name: 'drawing', count: 12 }
];

// Helper function to generate random dates within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Mock Posts Data
export const mockPosts = [
  {
    id: 'post1',
    user: mockUsers[0], // Sarah Johnson
    content: "Just finished teaching my first photography session through SkillShikhi! It's amazing to see how quickly students pick up composition techniques. Looking forward to the next session!",
    skillTag: "photography",
    likes: [mockUsers[1].id, mockUsers[2].id], // 2 likes
    comments: [
      {
        id: 'comment1',
        user: mockUsers[2], // Priya Sharma
        content: "That's amazing Sarah! I'd love to join your next session.",
        createdAt: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      }
    ],
    createdAt: randomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date(Date.now() - 2 * 24 * 60 * 60 * 1000))
  },
  {
    id: 'post2',
    user: mockUsers[1], // Michael Chen
    content: "Started a new series of Python workshops this week. If you're interested in learning the basics of programming, check out my profile and request a session!",
    skillTag: "programming",
    likes: [mockUsers[0].id, mockUsers[3].id, mockUsers[4].id], // 3 likes
    comments: [
      {
        id: 'comment2',
        user: mockUsers[3], // Ahmed Khan
        content: "Great initiative Michael! What topics will you be covering?",
        createdAt: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      },
      {
        id: 'comment3',
        user: mockUsers[1], // Michael Chen (reply)
        content: "Thanks Ahmed! We'll start with basic syntax, move to functions and data structures, and finish with some simple web apps using Flask.",
        createdAt: randomDate(new Date(Date.now() - 12 * 60 * 60 * 1000), new Date())
      }
    ],
    createdAt: randomDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), new Date(Date.now() - 4 * 24 * 60 * 60 * 1000))
  },
  {
    id: 'post3',
    user: mockUsers[2], // Priya Sharma
    content: "Made my grandmother's special biryani recipe today! Teaching cooking virtually has its challenges, but the results speak for themselves. Who else teaches culinary arts here?",
    skillTag: "cooking",
    likes: [mockUsers[0].id], // 1 like
    comments: [],
    createdAt: randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date(Date.now() - 1 * 24 * 60 * 60 * 1000))
  },
  {
    id: 'post4',
    user: mockUsers[3], // Ahmed Khan
    content: "Just completed a math tutoring session with a student who was struggling with calculus. The moment when concepts 'click' for students is why I love teaching!",
    skillTag: "mathematics",
    likes: [mockUsers[1].id, mockUsers[4].id], // 2 likes
    comments: [
      {
        id: 'comment4',
        user: mockUsers[4], // Fatima Rahman
        content: "That feeling is the best! I experienced the same with my art students this week.",
        createdAt: randomDate(new Date(Date.now() - 8 * 60 * 60 * 1000), new Date())
      }
    ],
    createdAt: randomDate(new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), new Date(Date.now() - 3 * 24 * 60 * 60 * 1000))
  },
  {
    id: 'post5',
    user: mockUsers[4], // Fatima Rahman
    content: "Digital art process video: from sketch to final illustration. Teaching has improved my own work as I have to articulate my process more clearly.",
    skillTag: "digital art",
    likes: [mockUsers[0].id, mockUsers[2].id], // 2 likes
    comments: [
      {
        id: 'comment5',
        user: mockUsers[0], // Sarah Johnson
        content: "This is fantastic Fatima! The colors are vibrant. Would love to learn some of your techniques.",
        createdAt: randomDate(new Date(Date.now() - 36 * 60 * 60 * 1000), new Date())
      },
      {
        id: 'comment6',
        user: mockUsers[4], // Fatima Rahman (reply)
        content: "Thank you Sarah! I'd be happy to show you some basics. Let's schedule a session soon.",
        createdAt: randomDate(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date())
      }
    ],
    createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))
  }
];

// Mock Sessions Data
export const mockSessions = [
  {
    id: 'session1',
    fromUser: mockUsers[0], // Sarah Johnson
    toUser: mockUsers[4], // Fatima Rahman
    skill: 'digital art',
    status: 'pending',
    message: "I'd love to learn some digital art techniques from you, especially color theory and digital painting.",
    scheduledFor: randomDate(new Date(), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    createdAt: randomDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), new Date())
  },
  {
    id: 'session2',
    fromUser: mockUsers[2], // Priya Sharma
    toUser: mockUsers[1], // Michael Chen
    skill: 'web development',
    status: 'accepted',
    message: "I want to build a website for my cooking blog. Can you teach me the basics?",
    scheduledFor: randomDate(new Date(), new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)),
    createdAt: randomDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), new Date())
  },
  {
    id: 'session3',
    fromUser: mockUsers[3], // Ahmed Khan
    toUser: mockUsers[0], // Sarah Johnson
    skill: 'photography',
    status: 'completed',
    message: "I'd like to improve my photography skills for my academic presentations.",
    scheduledFor: randomDate(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
    createdAt: randomDate(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), new Date())
  },
  {
    id: 'session4',
    fromUser: mockUsers[1], // Michael Chen
    toUser: mockUsers[3], // Ahmed Khan
    skill: 'mathematics',
    status: 'cancelled',
    message: "I need help with some advanced statistics for a data science project.",
    scheduledFor: randomDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), new Date()),
    createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
  },
  {
    id: 'session5',
    fromUser: mockUsers[4], // Fatima Rahman
    toUser: mockUsers[2], // Priya Sharma
    skill: 'cooking',
    status: 'accepted',
    message: "I'd love to learn how to make authentic Bengali desserts.",
    scheduledFor: randomDate(new Date(), new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)),
    createdAt: randomDate(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date())
  }
];

// Mock Suggested Teachers
export const mockSuggestedTeachers = [
  {
    user: mockUsers[1], // Michael Chen
    skills: ['Programming', 'Web Development', 'Python', 'JavaScript'],
    rating: 4.8,
    sessionCount: 15
  },
  {
    user: mockUsers[0], // Sarah Johnson
    skills: ['Photography', 'Editing', 'Visual Arts'],
    rating: 4.9,
    sessionCount: 23
  },
  {
    user: mockUsers[3], // Ahmed Khan
    skills: ['Mathematics', 'Physics', 'Statistics'],
    rating: 4.7,
    sessionCount: 12
  }
];

// Export functions to simulate API calls
export const mockApi = {
  // Get current logged in user (for demo purposes, we'll use the first user)
  getCurrentUser: () => {
    return Promise.resolve(mockUsers[0]); // Sarah Johnson
  },
  
  // Get posts for newsfeed
  getPosts: () => {
    return Promise.resolve({
      posts: mockPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  },
  
  // Get popular skills
  getPopularSkills: () => {
    return Promise.resolve({
      skills: mockSkills.sort((a, b) => b.count - a.count).slice(0, 5)
    });
  },
  
  // Get suggested teachers
  getSuggestedTeachers: () => {
    return Promise.resolve({
      teachers: mockSuggestedTeachers
    });
  },
  
  // Like a post
  likePost: (postId, userId) => {
    const post = mockPosts.find(p => p.id === postId);
    if (!post) return Promise.resolve({ success: false });
    
    if (post.likes.includes(userId)) {
      // Unlike
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      // Like
      post.likes.push(userId);
    }
    
    return Promise.resolve({ 
      success: true, 
      post 
    });
  },
  
  // Add comment to post
  addComment: (postId, comment) => {
    const post = mockPosts.find(p => p.id === postId);
    if (!post) return Promise.resolve({ success: false });
    
    const newComment = {
      id: `comment${Math.floor(Math.random() * 10000)}`,
      ...comment,
      createdAt: new Date()
    };
    
    post.comments.push(newComment);
    
    return Promise.resolve({ 
      success: true, 
      comment: newComment 
    });
  },
  
  // Get user sessions
  getSessions: (userId) => {
    const userSessions = mockSessions.filter(
      session => session.fromUser.id === userId || session.toUser.id === userId
    );
    
    return Promise.resolve({
      sessions: userSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  },
  
  // Create a new session request
  createSession: (sessionData) => {
    const newSession = {
      id: `session${Math.floor(Math.random() * 10000)}`,
      ...sessionData,
      status: 'pending',
      createdAt: new Date()
    };
    
    mockSessions.push(newSession);
    
    return Promise.resolve({
      success: true,
      session: newSession
    });
  },
  
  // Update session status
  updateSessionStatus: (sessionId, status) => {
    const session = mockSessions.find(s => s.id === sessionId);
    if (!session) return Promise.resolve({ success: false });
    
    session.status = status;
    
    return Promise.resolve({
      success: true,
      session
    });
  }
};
