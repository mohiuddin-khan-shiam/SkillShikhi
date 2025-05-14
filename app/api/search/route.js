export const runtime = 'nodejs';

import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import Skill from '../../../models/Skill';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// Helper function to verify JWT token
function verifyToken(req) {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    console.log('❌ No authorization header found in search API');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('❌ No token found in authorization header of search API');
    return null;
  }

  try {
    console.log('🔑 Search API verifying token:', token.substring(0, 15) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Search API token verified for user:', decoded.userId);
    return decoded;
  } catch (err) {
    console.log('❌ Search API token verification failed:', err.message);
    return null;
  }
}

export async function GET(request) {
    console.log('📥 GET /api/search HIT');

    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({
                skills: [],
                users: []
            });
        }

        await dbConnect();

        // Get auth token if available
        const authHeader = request.headers.get('authorization');
        console.log('🔑 Search API Auth header:', authHeader ? `${authHeader.substring(0, 15)}...` : 'Not provided');
        
        // Verify the requester's identity
        const decoded = verifyToken(request);
        const requesterId = decoded?.userId;
        
        console.log('🔑 Search API Requester ID:', requesterId || 'Not authenticated');

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

        console.log(`✅ Found ${users.length} users matching query: ${query}`);

        // Format user data and apply privacy filters
        const formattedUsers = users.map(user => {
            // For public users, return all information
            if (user.isPublic) {
                return {
                    id: user._id,
                    name: user.name,
                    skills: user.skills || [],
                    profileImage: user.profileImage || '/images/profile-placeholder.png',
                    location: user.location || 'Not specified',
                    isPublic: user.isPublic
                };
            } 
            // For private users, return limited information
            else {
                return {
                    id: user._id,
                    name: user.name,
                    profileImage: user.profileImage || '/images/profile-placeholder.png',
                    isPublic: user.isPublic,
                    isPrivate: true // Add a flag to indicate this is a private profile
                };
            }
        });

        return NextResponse.json({
            skills,
            users: formattedUsers
        });

    } catch (error) {
        console.error('❌ Error searching:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
