export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getAllSkills } from '../../../controllers/skill/skillController';

export async function GET() {
    console.log('📥 GET /api/skills HIT');

    try {
        // Call the controller method to get all skills
        const result = await getAllSkills();
        
        if (!result.success) {
            return NextResponse.json({ message: result.message }, { status: result.status });
        }
        
        return NextResponse.json({ skills: result.skills });
    } catch (error) {
        console.error('❌ Error in skills route:', error.message);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
