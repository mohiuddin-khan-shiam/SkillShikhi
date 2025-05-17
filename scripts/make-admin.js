// Script to make a user an admin
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

async function makeAdmin(email) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is not set');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const usersCollection = db.collection('users');
    
    // Find the user by email
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.name || user.email} (${user._id})`);
    console.log(`Current role: ${user.role || 'user'}`);
    
    // Update the user's role to admin
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { role: 'admin' } }
    );
    
    if (result.modifiedCount === 1) {
      console.log(`Successfully updated user ${email} to admin role`);
    } else {
      console.log('No changes made. User might already be an admin.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Get the email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address as an argument');
  console.error('Usage: node make-admin.js <email>');
  process.exit(1);
}

makeAdmin(email);
