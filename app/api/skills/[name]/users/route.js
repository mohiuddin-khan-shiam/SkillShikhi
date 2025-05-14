export const runtime = 'nodejs';

import dbConnect from '../../../../../lib/mongodb';
import User from '../../../../../models/User';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    console.log('📥 GET /api/skills/:name/users HIT');

    try {
        await dbConnect();

        // Access name directly from the params object with optional chaining
        const name = params?.name;
        console.log('🔍 Requested skill name:', name);

        if (!name) {
            return NextResponse.json({ message: 'Skill name is required' }, { status: 400 });
        }

        // Find public users with the specified skill
        const users = await User.find({
            skills: { $regex: new RegExp(name, 'i') },
            isPublic: true
        }).select('_id name bio profileImage location');

        // Format user data for the response
        const formattedUsers = users.map(user => ({
            id: user._id,
            name: user.name,
            bio: user.bio || 'No bio provided',
            profileImage: user.profileImage || '/images/profile-placeholder.png',
            location: user.location || 'Not specified'
        }));

        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error('❌ Error fetching users by skill:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
