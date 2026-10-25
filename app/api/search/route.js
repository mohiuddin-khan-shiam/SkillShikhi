export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Skill from '../../../models/Skill';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { DEMO_USERS } from '../../../lib/demoData';

// Popular skill suggestions for search fallback
const FALLBACK_SKILLS = [
  { name: 'React', count: 184 },
  { name: 'Next.js', count: 142 },
  { name: 'Python', count: 129 },
  { name: 'Machine Learning', count: 96 },
  { name: 'TypeScript', count: 88 },
  { name: 'Tailwind CSS', count: 82 },
  { name: 'Docker', count: 64 },
  { name: 'DevOps', count: 58 },
  { name: 'UI/UX Design', count: 53 },
  { name: 'GraphQL', count: 47 },
  { name: 'Node.js', count: 110 },
  { name: 'PostgreSQL', count: 41 },
];

function getFallbackResults(query) {
  const q = query.toLowerCase();
  
  const matchedSkills = FALLBACK_SKILLS.filter(s => 
    s.name.toLowerCase().includes(q)
  );

  const matchedUsers = Object.values(DEMO_USERS)
    .filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.headline?.toLowerCase().includes(q) ||
      u.bio?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q) ||
      u.masteredSkills?.some(ms => ms.name.toLowerCase().includes(q))
    )
    .map(u => ({
      id: u.id,
      name: u.name,
      skills: u.masteredSkills ? u.masteredSkills.map(ms => ms.name) : ['Next.js', 'React'],
      profileImage: u.avatar || '/images/profile-placeholder.png',
      location: u.location || 'Remote',
      isPublic: true
    }));

  return { skills: matchedSkills, users: matchedUsers };
}

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    return decoded;
  } catch (err) {
    return null;
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.trim() === '') {
      return NextResponse.json({
        skills: [],
        users: []
      });
    }

    try {
      await dbConnect();

      // Create a case-insensitive regex for searching
      const searchRegex = new RegExp(query, 'i');

      // Search for skills
      const skills = await Skill.find({
        name: searchRegex
      }).sort({ count: -1 }).limit(5);

      // Search for all users that match the query
      const userSearchQuery = {
        $or: [
          { name: searchRegex },
          { skills: searchRegex },
          { bio: searchRegex },
          { location: searchRegex }
        ]
      };

      const users = await User.find(userSearchQuery)
        .select('_id name skills profileImage location isPublic')
        .limit(10);

      const formattedUsers = users.map(user => {
        if (user.isPublic) {
          return {
            id: user._id,
            name: user.name,
            skills: user.skills || [],
            profileImage: user.profileImage || '/images/profile-placeholder.png',
            location: user.location || 'Not specified',
            isPublic: user.isPublic
          };
        } else {
          return {
            id: user._id,
            name: user.name,
            profileImage: user.profileImage || '/images/profile-placeholder.png',
            isPublic: user.isPublic,
            isPrivate: true
          };
        }
      });

      // If DB returned results, return them
      if (skills.length > 0 || formattedUsers.length > 0) {
        return NextResponse.json({
          skills,
          users: formattedUsers
        });
      }
    } catch (dbError) {
      console.warn('Database query failed in search API, using fallback data:', dbError.message);
    }

    // Fallback to high quality demo search data
    const fallbackResults = getFallbackResults(query);
    return NextResponse.json(fallbackResults);

  } catch (error) {
    console.error('❌ Error in search API:', error.message);
    return NextResponse.json({ skills: [], users: [] });
  }
}
