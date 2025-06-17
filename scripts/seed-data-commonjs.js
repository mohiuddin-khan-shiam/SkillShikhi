// CommonJS script for seeding the database with dummy data
require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectToDatabase } = require('../lib/mongodb');

// Simple utility functions
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

function shuffleArray(array) {
  const newArray = [...array];
  
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  return newArray;
}

function getRandomItems(array, min, max) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return shuffleArray(array).slice(0, count);
}

// User data
const users = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password123',
    bio: 'Photography enthusiast with a passion for capturing urban landscapes and teaching others the art of composition.',
    skills: ['Photography', 'Editing', 'Visual Arts'],
    location: 'Dhaka, Bangladesh',
    occupation: 'Professional Photographer'
  },
  {
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password123',
    bio: 'Software engineer with a passion for teaching coding to beginners. Specializing in web development and Python.',
    skills: ['Programming', 'Web Development', 'Python', 'JavaScript'],
    location: 'Chittagong, Bangladesh',
    occupation: 'Senior Software Engineer'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password: 'password123',
    bio: 'Culinary enthusiast eager to learn and share authentic regional cooking techniques.',
    skills: ['Cooking', 'Baking'],
    location: 'Rajshahi, Bangladesh',
    occupation: 'Home Chef & Food Blogger'
  },
  {
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    password: 'password123',
    bio: 'Mathematics tutor with experience teaching students from elementary to university level.',
    skills: ['Mathematics', 'Physics', 'Statistics'],
    location: 'Sylhet, Bangladesh',
    occupation: 'Mathematics Professor'
  },
  {
    name: 'Fatima Rahman',
    email: 'fatima.rahman@example.com',
    password: 'password123',
    bio: 'Digital artist teaching drawing techniques and digital illustration.',
    skills: ['Digital Art', 'Illustration', 'Drawing'],
    location: 'Khulna, Bangladesh',
    occupation: 'Digital Artist & Instructor'
  }
];

// Skills data
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

// Post content
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

// Define models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  profileImage: { type: String },
  location: { type: String },
  occupation: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  count: { type: Number, default: 1 }
});

const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  skillTag: { type: String, required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const SessionSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'accepted', 'completed', 'rejected', 'cancelled'],
    default: 'pending' 
  },
  message: { type: String },
  scheduledFor: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Register models
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Skill = mongoose.models.Skill || mongoose.model('Skill', SkillSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const Session = mongoose.models.Session || mongoose.model('Session', SessionSchema);

// Function to seed the database
async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    const { connection } = await connectToDatabase();
    
    console.log('Connected successfully to MongoDB');
    
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
      
      // Add placeholder image if not specified
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
    const posts = [];
    
    // Distribute posts among users
    let postIndex = 0;
    for (const user of createdUsers) {
      // Each user gets 2 posts
      for (let i = 0; i < 2; i++) {
        posts.push({
          user: user._id,
          content: postContents[postIndex].content,
          skillTag: postContents[postIndex].skillTag,
          likes: [],
          comments: [],
          createdAt: randomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date())
        });
        postIndex = (postIndex + 1) % postContents.length;
      }
    }
    
    await Post.insertMany(posts);
    
    // Create sessions
    console.log('Creating sessions...');
    const sessions = [];
    const statuses = ['pending', 'accepted', 'completed', 'cancelled'];
    
    // Create session pairs between users
    for (let i = 0; i < createdUsers.length; i++) {
      for (let j = 0; j < createdUsers.length; j++) {
        if (i !== j) { // Don't create sessions with self
          // Each user pair gets 1-2 sessions
          const sessionCount = Math.floor(Math.random() * 2) + 1;
          
          for (let k = 0; k < sessionCount; k++) {
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const fromUser = createdUsers[i];
            const toUser = createdUsers[j];
            
            // Select a skill from the toUser's skills
            const skillName = toUser.skills.length > 0 
              ? toUser.skills[Math.floor(Math.random() * toUser.skills.length)] 
              : 'General Discussion';
            
            sessions.push({
              fromUser: fromUser._id,
              toUser: toUser._id,
              skill: skillName.toLowerCase(),
              status: status,
              message: `I'd like to learn more about ${skillName} from you. Are you available for a teaching session?`,
              scheduledFor: randomDate(new Date(), new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
              createdAt: randomDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date())
            });
          }
        }
      }
    }
    
    await Session.insertMany(sessions);
    
    console.log('Database seeded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error seeding database:', error);
    return { success: false, error };
  }
  // No need to manually close the connection as it's handled by the connection utility
}

// Run the seed database function
seedDatabase()
  .then(result => {
    if (result.success) {
      console.log('✅ Seed data script completed successfully!');
    } else {
      console.error('❌ Seed data script failed:', result.error);
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Unhandled error in seed script:', error);
    process.exit(1);
  });
