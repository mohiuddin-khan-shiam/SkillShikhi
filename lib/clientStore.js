// Client-side resilient state management for SkillShikhi
// Ensures 100% interactive functionality on Vercel free tier with zero server file dependencies

import {
  DEMO_USERS,
  DEMO_POSTS,
  DEMO_REELS,
  DEMO_PINS,
  DEMO_DROPLETS,
  DEMO_COMMUNITIES,
  DEMO_SESSIONS,
  DEMO_CHATS,
  DEMO_ADMIN_DATA,
  DEMO_STORIES,
} from './demoData';

const STORAGE_KEYS = {
  CURRENT_USER: 'skillshikhi_current_user',
  POSTS: 'skillshikhi_posts',
  REELS: 'skillshikhi_reels',
  PINS: 'skillshikhi_pins',
  DROPLETS: 'skillshikhi_droplets',
  COMMUNITIES: 'skillshikhi_communities',
  SESSIONS: 'skillshikhi_sessions',
  CHATS: 'skillshikhi_chats',
  ADMIN_REPORTS: 'skillshikhi_admin_reports',
};

function getStorageItem(key, defaultValue) {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error reading localStorage ${key}:`, e);
    return defaultValue;
  }
}

function setStorageItem(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error setting localStorage ${key}:`, e);
  }
}

export const clientStore = {
  // Current Active Role / User
  getCurrentUser: () => {
    return getStorageItem(STORAGE_KEYS.CURRENT_USER, DEMO_USERS.alex);
  },
  
  setCurrentUser: (userOrRoleKey) => {
    let user = userOrRoleKey;
    if (typeof userOrRoleKey === 'string' && DEMO_USERS[userOrRoleKey]) {
      user = DEMO_USERS[userOrRoleKey];
    }
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
    
    // Also sync legacy token keys so old components stay happy
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', 'demo_jwt_token_recruiter_preview');
      localStorage.setItem('userId', user.id);
      if (user.isAdmin) {
        localStorage.setItem('adminToken', 'demo_admin_jwt_token_recruiter_preview');
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminId', user.id);
      } else {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('isAdmin');
      }
    }
    return user;
  },

  // Switch demo persona instantly
  switchRole: (role) => {
    if (role === 'mentor') return clientStore.setCurrentUser(DEMO_USERS.sarah);
    if (role === 'admin') return clientStore.setCurrentUser(DEMO_USERS.admin);
    return clientStore.setCurrentUser(DEMO_USERS.alex);
  },

  // Posts Feed
  getPosts: () => {
    return getStorageItem(STORAGE_KEYS.POSTS, DEMO_POSTS);
  },

  addPost: ({ content, skillTag, media = null, category = 'Community Update' }) => {
    const user = clientStore.getCurrentUser();
    const posts = clientStore.getPosts();
    const newPost = {
      id: `post_${Date.now()}`,
      author: user,
      createdAt: new Date().toISOString(),
      skillTag: skillTag || 'General Skill',
      category,
      content,
      media,
      likesCount: 0,
      isLiked: false,
      commentsCount: 0,
      sharesCount: 0,
      comments: [],
    };
    const updated = [newPost, ...posts];
    setStorageItem(STORAGE_KEYS.POSTS, updated);
    return newPost;
  },

  toggleLikePost: (postId) => {
    const posts = clientStore.getPosts();
    const updated = posts.map((post) => {
      if (post.id === postId) {
        const isLiked = !post.isLiked;
        return {
          ...post,
          isLiked,
          likesCount: isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
        };
      }
      return post;
    });
    setStorageItem(STORAGE_KEYS.POSTS, updated);
    return updated;
  },

  addCommentToPost: (postId, text) => {
    const user = clientStore.getCurrentUser();
    const posts = clientStore.getPosts();
    const updated = posts.map((post) => {
      if (post.id === postId) {
        const newComment = {
          id: `c_${Date.now()}`,
          author: user,
          text,
          createdAt: 'Just now',
        };
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [...(post.comments || []), newComment],
        };
      }
      return post;
    });
    setStorageItem(STORAGE_KEYS.POSTS, updated);
    return updated;
  },

  // Reels
  getReels: () => {
    return getStorageItem(STORAGE_KEYS.REELS, DEMO_REELS);
  },

  toggleLikeReel: (reelId) => {
    const reels = clientStore.getReels();
    const updated = reels.map((r) => {
      if (r.id === reelId) {
        const isLiked = !r.isLiked;
        return {
          ...r,
          isLiked,
          likes: isLiked ? r.likes + 1 : Math.max(0, r.likes - 1),
        };
      }
      return r;
    });
    setStorageItem(STORAGE_KEYS.REELS, updated);
    return updated;
  },

  toggleSaveReel: (reelId) => {
    const reels = clientStore.getReels();
    const updated = reels.map((r) => (r.id === reelId ? { ...r, saved: !r.saved } : r));
    setStorageItem(STORAGE_KEYS.REELS, updated);
    return updated;
  },

  // Pins
  getPins: () => {
    return getStorageItem(STORAGE_KEYS.PINS, DEMO_PINS);
  },

  toggleSavePin: (pinId) => {
    const pins = clientStore.getPins();
    const updated = pins.map((p) => {
      if (p.id === pinId) {
        const isSaved = !p.isSaved;
        return {
          ...p,
          isSaved,
          saves: isSaved ? p.saves + 1 : Math.max(0, p.saves - 1),
        };
      }
      return p;
    });
    setStorageItem(STORAGE_KEYS.PINS, updated);
    return updated;
  },

  addPin: ({ title, description, category, image }) => {
    const user = clientStore.getCurrentUser();
    const pins = clientStore.getPins();
    const newPin = {
      id: `pin_${Date.now()}`,
      title,
      description,
      category: category || 'Engineering',
      image: image || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80',
      author: user,
      saves: 1,
      isSaved: true,
      link: '#',
    };
    const updated = [newPin, ...pins];
    setStorageItem(STORAGE_KEYS.PINS, updated);
    return newPin;
  },

  // Droplets (X / Tips)
  getDroplets: () => {
    return getStorageItem(STORAGE_KEYS.DROPLETS, DEMO_DROPLETS);
  },

  addDroplet: ({ content, tag = '#CodeTip' }) => {
    const user = clientStore.getCurrentUser();
    const droplets = clientStore.getDroplets();
    const newDroplet = {
      id: `drop_${Date.now()}`,
      author: user,
      handle: `@${user.username}`,
      content,
      tag,
      timeAgo: 'Just now',
      likes: 0,
      reposts: 0,
      replies: 0,
      isLiked: false,
    };
    const updated = [newDroplet, ...droplets];
    setStorageItem(STORAGE_KEYS.DROPLETS, updated);
    return newDroplet;
  },

  // Communities (Reddit)
  getCommunities: () => {
    return getStorageItem(STORAGE_KEYS.COMMUNITIES, DEMO_COMMUNITIES);
  },

  voteThread: (communitySlug, threadId, direction) => {
    const communities = clientStore.getCommunities();
    const updated = communities.map((comm) => {
      if (comm.slug === communitySlug) {
        return {
          ...comm,
          threads: comm.threads.map((t) => {
            if (t.id === threadId) {
              const prevVote = t.userVote || 0;
              const newVote = prevVote === direction ? 0 : direction;
              const voteDiff = newVote - prevVote;
              return {
                ...t,
                userVote: newVote,
                upvotes: t.upvotes + voteDiff,
              };
            }
            return t;
          }),
        };
      }
      return comm;
    });
    setStorageItem(STORAGE_KEYS.COMMUNITIES, updated);
    return updated;
  },

  // Sessions (Google Classroom / YouTube Workshops)
  getSessions: () => {
    return getStorageItem(STORAGE_KEYS.SESSIONS, DEMO_SESSIONS);
  },

  bookSession: (sessionId) => {
    const sessions = clientStore.getSessions();
    const updated = sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          isEnrolled: true,
          enrolledCount: (s.enrolledCount || 0) + 1,
        };
      }
      return s;
    });
    setStorageItem(STORAGE_KEYS.SESSIONS, updated);
    return updated;
  },

  // Chat Conversations
  getChats: () => {
    return getStorageItem(STORAGE_KEYS.CHATS, DEMO_CHATS);
  },

  sendMessage: (chatId, text) => {
    const chats = clientStore.getChats();
    const updated = chats.map((c) => {
      if (c.id === chatId) {
        const newMsg = {
          id: `m_${Date.now()}`,
          sender: 'me',
          text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        return {
          ...c,
          lastMessage: text,
          lastTimestamp: 'Just now',
          messages: [...c.messages, newMsg],
        };
      }
      return c;
    });
    setStorageItem(STORAGE_KEYS.CHATS, updated);
    return updated;
  },

  // Admin Reports & Actions
  getAdminReports: () => {
    return getStorageItem(STORAGE_KEYS.ADMIN_REPORTS, DEMO_ADMIN_DATA.moderationReports);
  },

  resolveReport: (reportId) => {
    const reports = clientStore.getAdminReports();
    const updated = reports.map((r) => (r.id === reportId ? { ...r, status: 'resolved' } : r));
    setStorageItem(STORAGE_KEYS.ADMIN_REPORTS, updated);
    return updated;
  },

  // Stories
  getStories: () => {
    return DEMO_STORIES;
  },
};
