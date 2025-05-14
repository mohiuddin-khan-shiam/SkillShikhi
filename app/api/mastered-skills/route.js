export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

function verifyToken(req) {
  try {
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      console.log('❌ No auth header found');
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(`✅ Token verified for user: ${decoded.userId}`);
    return decoded;
  } catch (error) {
    console.error('❌ Token verification failed:', error.message);
    return null;
  }
}

// GET mastered skills for a user
export async function GET(request) {
  console.log('🔍 GET /api/mastered-skills HIT');
  try {
    await dbConnect();
    
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Get userId from query params if provided, otherwise use the token's userId
    const url = new URL(request.url);
    const userIdParam = url.searchParams.get('userId');
    const userId = userIdParam || decoded.userId;
    
    console.log(`🎯 Fetching mastered skills for user: ${userId}`);
    
    // Find the user document
    const user = await User.findById(userId);
    
    if (!user) {
      console.log(`❌ User not found: ${userId}`);
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Ensure masteredSkills exists, initialize if not
    if (!user.masteredSkills) {
      console.log(`⚠️ User ${userId} has no masteredSkills array, initializing it`);
      try {
        await User.findByIdAndUpdate(userId, { $set: { masteredSkills: [] } }, { new: true });
        console.log(`✅ Successfully initialized empty masteredSkills array for user ${userId}`);
        return NextResponse.json({ masteredSkills: [] });
      } catch (updateError) {
        console.error(`❌ Failed to initialize masteredSkills array: ${updateError.message}`);
        return NextResponse.json({ 
          message: 'Error initializing masteredSkills', 
          masteredSkills: [] 
        });
      }
    }
    
    console.log(`📊 Found ${user.masteredSkills.length} mastered skills for user ${userId}`);
    
    // If we have skills, log their names for debugging
    if (user.masteredSkills.length > 0) {
      const skillNames = user.masteredSkills.map(skill => skill.name || 'unnamed');
      console.log(`🔢 Mastered skill names: ${JSON.stringify(skillNames)}`);
    }
    
    return NextResponse.json({ 
      masteredSkills: user.masteredSkills 
    });
  } catch (error) {
    console.error('❌ Error fetching mastered skills:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}

// POST to add a new mastered skill
export async function POST(request) {
  console.log('➕ POST /api/mastered-skills HIT');
  try {
    await dbConnect();
    
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    const { skill } = body;
    
    console.log(`🎯 Adding mastered skill: ${skill} for user: ${decoded.userId}`);
    
    if (!skill) {
      console.log('❌ No skill provided in request');
      return NextResponse.json({ message: 'Skill is required' }, { status: 400 });
    }
    
    try {
      // Create a new MasteredSkill object according to the schema
      const newMasteredSkill = {
        name: skill,
        description: body.description || '',
        experienceYears: body.experienceYears || 1,
        createdAt: new Date()
      };
      
      // Use findOneAndUpdate to atomically update the document
      const result = await User.findByIdAndUpdate(
        decoded.userId,
        { 
          $push: { masteredSkills: newMasteredSkill },
          $setOnInsert: { masteredSkills: [newMasteredSkill] } 
        },
        { 
          new: true,
          upsert: true
        }
      );
      
      console.log(`✅ Added mastered skill: ${skill} for user: ${decoded.userId}`);
      console.log(`📊 Updated mastered skills count: ${result.masteredSkills?.length || 0}`);
      
      return NextResponse.json({ 
        message: 'Mastered skill added successfully',
        masteredSkills: result.masteredSkills || [],
        skill: newMasteredSkill
      });
    } catch (dbError) {
      console.error(`❌ Database error adding mastered skill: ${dbError.message}`);
      
      // Make another attempt with direct update if the first approach failed
      try {
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        if (!user.masteredSkills) {
          user.masteredSkills = [];
        }
        
        // Create a new MasteredSkill object according to the schema
        const newMasteredSkill = {
          name: skill,
          description: body.description || '',
          experienceYears: body.experienceYears || 1,
          createdAt: new Date()
        };
        
        user.masteredSkills.push(newMasteredSkill);
        await user.save();
        
        console.log(`✅ Added mastered skill (fallback method): ${skill}`);
        
        return NextResponse.json({ 
          message: 'Mastered skill added successfully',
          masteredSkills: user.masteredSkills,
          skill: newMasteredSkill
        });
      } catch (fallbackError) {
        console.error(`❌ Both attempts to add mastered skill failed: ${fallbackError.message}`);
        return NextResponse.json({ 
          message: 'Failed to add mastered skill after multiple attempts'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('❌ Error adding mastered skill:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
}

// DELETE a mastered skill
export async function DELETE(request) {
  console.log('🗑️ DELETE /api/mastered-skills HIT');
  try {
    await dbConnect();
    
    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const skillName = url.searchParams.get('skill');
    
    console.log(`🎯 Removing mastered skill: ${skillName} for user: ${decoded.userId}`);
    
    if (!skillName) {
      console.log('❌ No skill provided in request');
      return NextResponse.json({ message: 'Skill name is required' }, { status: 400 });
    }
    
    try {
      // Use findOneAndUpdate to atomically update the document
      const result = await User.findByIdAndUpdate(
        decoded.userId,
        { $pull: { masteredSkills: { name: skillName } } },
        { new: true }
      );
      
      if (!result) {
        console.log(`❌ User not found: ${decoded.userId}`);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      
      console.log(`✅ Removed mastered skill: ${skillName} for user: ${decoded.userId}`);
      console.log(`📊 Updated mastered skills count: ${result.masteredSkills?.length || 0}`);
      
      return NextResponse.json({ 
        message: 'Mastered skill removed successfully',
        masteredSkills: result.masteredSkills || []
      });
    } catch (dbError) {
      console.error(`❌ Database error removing mastered skill: ${dbError.message}`);
      
      // Make another attempt with direct update if the first approach failed
      try {
        const user = await User.findById(decoded.userId);
        
        if (!user) {
          return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }
        
        if (!user.masteredSkills) {
          return NextResponse.json({ 
            message: 'No mastered skills found to remove',
            masteredSkills: []
          });
        }
        
        // Filter out the skill we want to remove
        user.masteredSkills = user.masteredSkills.filter(ms => ms.name !== skillName);
        await user.save();
        
        console.log(`✅ Removed mastered skill (fallback method): ${skillName}`);
        
        return NextResponse.json({ 
          message: 'Mastered skill removed successfully',
          masteredSkills: user.masteredSkills
        });
      } catch (fallbackError) {
        console.error(`❌ Both attempts to remove mastered skill failed: ${fallbackError.message}`);
        return NextResponse.json({ 
          message: 'Failed to remove mastered skill after multiple attempts'
        }, { status: 500 });
      }
    }
  } catch (error) {
    console.error('❌ Error removing mastered skill:', error);
    return NextResponse.json({ message: 'Server error: ' + error.message }, { status: 500 });
  }
} 