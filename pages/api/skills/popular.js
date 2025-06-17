import { connectToDatabase } from '../../../lib/mongodb';
import Skill from '../../../models/Skill';
import { verifyToken } from '../../../utils/auth';

// API route for fetching popular skills
export default async function handler(req, res) {
  // Connect to the database
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Failed to connect to database' });
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get popular skills sorted by count in descending order
    const skills = await Skill.find({})
      .sort({ count: -1 })
      .limit(15);

    return res.status(200).json({ skills });
  } catch (error) {
    console.error('Error fetching popular skills:', error);
    return res.status(500).json({ error: 'Failed to fetch popular skills' });
  }
}
