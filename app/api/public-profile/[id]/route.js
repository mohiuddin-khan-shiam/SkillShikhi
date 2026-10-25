export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import dbConnect from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { NextResponse } from 'next/server';
import { DEMO_USERS } from '../../../../lib/demoData';

export async function GET(request, { params }) {
  const { id } = await params;

  // Match demo users
  const demoMatch = Object.values(DEMO_USERS).find(
    (u) => u.id === id || u.username === id || id?.includes('sarah') || id?.includes('tariq') || id?.includes('elena')
  );

  if (demoMatch) {
    return NextResponse.json({
      _id: demoMatch.id,
      name: demoMatch.name,
      email: demoMatch.email,
      bio: demoMatch.bio,
      profileImage: demoMatch.avatar,
      avatar: demoMatch.avatar,
      masteredSkills: demoMatch.masteredSkills || [],
      skillsToTeach: demoMatch.masteredSkills?.map((s) => s.name) || [],
      skillsToLearn: ['Next.js 15', 'AI Engineering'],
      friends: [],
      privacySettings: { isProfilePublic: true },
    });
  }

  try {
    const conn = await dbConnect();
    if (conn) {
      const user = await User.findById(id);
      if (user) {
        return NextResponse.json(user);
      }
    }
  } catch (err) {
    console.warn('Public profile DB fallback:', err.message);
  }

  // Fallback to Sarah Khan
  const fallback = DEMO_USERS.sarah;
  return NextResponse.json({
    _id: fallback.id,
    name: fallback.name,
    email: fallback.email,
    bio: fallback.bio,
    profileImage: fallback.avatar,
    avatar: fallback.avatar,
    masteredSkills: fallback.masteredSkills,
    skillsToTeach: fallback.masteredSkills.map((s) => s.name),
    skillsToLearn: ['Rust', 'Distributed Systems'],
    friends: [],
    privacySettings: { isProfilePublic: true },
  });
}
