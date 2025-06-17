// Using require for compatibility
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('../lib/mongodb');

// Simple utility functions instead of importing from a module
function generatePlaceholderImage(name) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
    
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true&font-size=0.5&length=2&rounded=true`;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomItems(array, min, max) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return shuffleArray(array).slice(0, count);
}

function shuffleArray(array) {
  const newArray = [...array];
  
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  return newArray;
}

function getRandomSkills(skills, count) {
  return getRandomItems(skills, 1, count)
    .map(skill => typeof skill === 'string' ? skill : skill.name);
}

// Load model schemas using require
const mongoose = require('mongoose');
const User = require('../models/User');
const Skill = require('../models/Skill');
const Post = require('../models/Post');
const Session = require('../models/Session');

/**
 * Seed script to populate the database with test data
 * Run with: npm run seed-data
 */

// Update user profiles with placeholder images
const users = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    bio: 'Photography enthusiast with a passion for capturing urban landscapes and teaching others the art of composition.',
    skills: ['Photography', 'Editing', 'Visual Arts'],
    masteredSkills: [
      {
        name: 'Photography',
        description: 'Expert in portrait and landscape photography, with 8+ years of experience teaching beginners.',
        level: 'Advanced',
        yearsOfExperience: 8
      }
    ],
    profileImage: '/images/users/sarah.jpg',
    location: 'Dhaka, Bangladesh',
    occupation: 'Professional Photographer',
    socialLinks: {
      instagram: 'instagram.com/sarahj_captures',
      linkedin: 'linkedin.com/in/sarahjphotography'
    },
    availability: ['Weekday evenings', 'Weekend mornings']
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    bio: 'Software engineer with a passion for teaching coding to beginners. Specializing in web development and Python.',
    skills: ['Programming', 'Web Development', 'Python', 'JavaScript'],
    masteredSkills: [
      {
        name: 'Web Development',
        description: 'Full-stack developer experienced in React, Node.js, and modern web technologies.',
        level: 'Expert',
        yearsOfExperience: 6
      },
      {
        name: 'Python',
        description: 'Python developer with experience in data science and machine learning applications.',
        level: 'Advanced',
        yearsOfExperience: 4
      }
    ],
    profileImage: '/images/users/michael.jpg',
    location: 'Chittagong, Bangladesh',
    occupation: 'Senior Software Engineer',
    socialLinks: {
      github: 'github.com/michaelcdev',
      linkedin: 'linkedin.com/in/michaelchen'
    },
    availability: ['Weekends', 'Thursday evenings']
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password: 'password123',
    bio: 'Culinary enthusiast eager to learn and share authentic regional cooking techniques.',
    skills: ['Cooking', 'Baking'],
    masteredSkills: [
      {
        name: 'Cooking',
        description: 'Specializes in authentic North Indian cuisine and fusion dishes.',
        level: 'Intermediate',
        yearsOfExperience: 3
      }
    ],
    profileImage: '/images/users/priya.jpg',
    location: 'Rajshahi, Bangladesh',
    occupation: 'Home Chef & Food Blogger',
    socialLinks: {
      instagram: 'instagram.com/priya_cooks'
    },
    availability: ['Weekday mornings', 'Weekends']
  },
  {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    password: 'password123',
    bio: 'Mathematics tutor with experience teaching students from elementary to university level.',
    skills: ['Mathematics', 'Physics', 'Statistics'],
    masteredSkills: [
      {
        name: 'Mathematics',
        description: 'Experienced in teaching algebra, calculus, and advanced mathematics.',
        level: 'Expert',
        yearsOfExperience: 10
      },
      {
        name: 'Statistics',
        description: 'Teaching statistical concepts and data analysis techniques.',
        level: 'Advanced',
        yearsOfExperience: 7
      }
    ],
    profileImage: '/images/users/ahmed.jpg',
    location: 'Sylhet, Bangladesh',
    occupation: 'Mathematics Professor',
    socialLinks: {
      linkedin: 'linkedin.com/in/ahmedkhanmath'
    },
    availability: ['Weekday afternoons', 'Saturday mornings']
  },
  {
    name: 'Fatima Rahman',
    email: 'fatima.rahman@example.com',
    password: 'password123',
    bio: 'Digital artist teaching drawing techniques and digital illustration.',
    skills: ['Digital Art', 'Illustration', 'Drawing'],
    masteredSkills: [
      {
        name: 'Digital Art',
        description: 'Expert in digital art creation using Procreate, Photoshop and various digital tools.',
        level: 'Expert',
        yearsOfExperience: 8
      }
    ],
    profileImage: '/images/users/fatima.jpg',
    location: 'Khulna, Bangladesh',
    occupation: 'Digital Artist & Instructor',
    socialLinks: {
      instagram: 'instagram.com/fatima_creates',
      behance: 'behance.net/fatimarahman'
    },
    availability: ['Evenings', 'Weekends']
  }
];

const skills = [
  { name: 'photography', count: 15 },
  { name: 'cooking', count: 23 },
  { name: 'programming', count: 35 },
  { name: 'web development', count: 28 },
  { name: 'javascript', count: 30 },
  { name: 'react', count: 20 },
  { name: 'python', count: 25 },
  { name: 'mathematics', count: 14 },
  { name: 'digital art', count: 18 },
  { name: 'drawing', count: 12 },
  { name: 'painting', count: 10 },
  { name: 'public speaking', count: 8 },
  { name: 'graphic design', count: 17 },
  { name: 'data science', count: 11 },
  { name: 'machine learning', count: 9 },
  { name: 'language learning', count: 13 },
  { name: 'english', count: 22 },
  { name: 'bangla', count: 19 },
  { name: 'yoga', count: 7 },
  { name: 'music production', count: 6 },
  { name: 'guitar', count: 8 },
  { name: 'singing', count: 9 },
  { name: 'baking', count: 14 },
  { name: 'gardening', count: 5 },
  { name: 'statistics', count: 7 }
];

// Function to generate sample posts
const generatePosts = (users) => {
  const posts = [];
  
  const postContents = [
    {
      content: "Just finished teaching my first photography session through SkillShikhi! It's amazing to see how quickly students pick up composition techniques. Looking forward to the next session!",
      skillTag: "photography"
    },
    {
      content: "Sharing my latest landscape shot taken at sunrise. Teaching photography has made me more mindful of the technical aspects I used to take for granted. What techniques have you learned recently?",
      skillTag: "photography"
    },
    {
      content: "Started a new series of Python workshops this week. If you're interested in learning the basics of programming, check out my profile and request a session!",
      skillTag: "programming"
    },
    {
      content: "Here's a simple React component I built to explain state management to beginners. What concepts do you find most challenging when learning React?",
      skillTag: "web development"
    },
    {
      content: "Made my grandmother's special biryani recipe today! Teaching cooking virtually has its challenges, but the results speak for themselves. Who else teaches culinary arts here?",
      skillTag: "cooking"
    },
    {
      content: "Just completed a math tutoring session with a student who was struggling with calculus. The moment when concepts 'click' for students is why I love teaching!",
      skillTag: "mathematics"
    },
    {
      content: "Digital art process video: from sketch to final illustration. Teaching has improved my own work as I have to articulate my process more clearly.",
      skillTag: "digital art"
    },
    {
      content: "Anyone interested in learning public speaking techniques? I'm hosting a free group session this weekend to share some basic principles.",
      skillTag: "public speaking"
    },
    {
      content: "Learning Bengali has been a rewarding challenge. Thanks to my SkillShikhi tutor for the patience and fantastic teaching methods!",
      skillTag: "bangla"
    },
    {
      content: "Data visualization techniques I've been teaching my students. What's your favorite way to represent complex data?",
      skillTag: "data science"
    }
  ];
  
  // Distribute posts among users
  let postIndex = 0;
  users.forEach(user => {
    // Each user gets 2 posts
    for (let i = 0; i < 2; i++) {
      posts.push({
        user: user._id,
        content: postContents[postIndex].content,
        skillTag: postContents[postIndex].skillTag,
        likes: [],
        comments: [],
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
      });
      postIndex = (postIndex + 1) % postContents.length;
    }
  });
  
  return posts;
};

// Function to generate sample sessions
const generateSessions = (users) => {
  const sessions = [];
  const statuses = ['pending', 'accepted', 'completed', 'cancelled'];
  
  // Create session pairs between users
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j) { // Don't create sessions with self
        // Each user pair gets 1-2 sessions
        const sessionCount = Math.floor(Math.random() * 2) + 1;
        
        for (let k = 0; k < sessionCount; k++) {
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const fromUser = users[i];
          const toUser = users[j];
          
          // Select a skill from the toUser's masteredSkills
          const skillIndex = Math.floor(Math.random() * toUser.masteredSkills.length);
          const skillName = toUser.masteredSkills[skillIndex]?.name || 'General Discussion';
          
          sessions.push({
            fromUser: fromUser._id,
            toUser: toUser._id,
            skill: skillName.toLowerCase(),
            status: status,
            message: `I'd like to learn more about ${skillName} from you. Are you available for a teaching session?`,
            scheduledFor: new Date(Date.now() + Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
          });
        }
      }
    }
  }
  
  return sessions;
};

// Function to seed the database
const seedDatabase = async () => {
  try {
  // Continue with database operations
    console.log('Connecting to database...');
    const { db } = await connectToDatabase();
    
    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Skill.deleteMany({});
    await Post.deleteMany({});
    await Session.deleteMany({});
    
    // Create users with hashed passwords and placeholder images
    console.log('Creating users...');
    const createdUsers = [];
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      // Generate placeholder image if not specified
      if (!user.profileImage) {
        user.profileImage = generatePlaceholderImage(user.name);
      }
      
      const newUser = new User({
        ...user,
        password: hashedPassword
      });
      
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
    }
    
    // Create skills
    console.log('Creating skills...');
    await Skill.insertMany(skills);
    
    // Create posts
    console.log('Creating posts...');
    const posts = generatePosts(createdUsers);
    await Post.insertMany(posts);
    
    // Create sessions
    console.log('Creating sessions...');
    const sessions = generateSessions(createdUsers);
    await Session.insertMany(sessions);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Optional: Close the connection
    process.exit(0);
  }
};

// Execute the seed function
seedDatabase()
  .then(() => {
    console.log('Seed data script completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Error in seed script:', error);
    process.exit(1);
  });
