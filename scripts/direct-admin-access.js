// IMPORTANT: This is a one-time script to grant admin access directly
// It bypasses normal authorization checks and should be deleted after use
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

// Import the database connection function
const dbConnect = require('../lib/mongodb');

async function makeUserAdmin(email) {
  console.log(`Attempting to make user with email ${email} an admin...`);
  
  try {
    // Define a simple User schema if it doesn't exist
    const UserSchema = new mongoose.Schema({
      name: String,
      email: String,
      role: String
    });
    
    // Check if the model is already defined
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    // Connect to the database using the project's connection function
    await dbConnect();
    console.log('Connected to MongoDB');
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found in the database`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name || 'Unknown'} (${user._id})`);
    console.log(`Current role: ${user.role || 'user'}`);
    
    // Update user to admin role
    user.role = 'admin';
    await user.save();
    
    console.log(`Success! User ${email} has been granted admin privileges.`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the connection
    setTimeout(() => {
      mongoose.connection.close();
      console.log('MongoDB connection closed');
      process.exit(0);
    }, 1000);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.error('Usage: node direct-admin-access.js <email>');
  process.exit(1);
}

makeUserAdmin(email);
