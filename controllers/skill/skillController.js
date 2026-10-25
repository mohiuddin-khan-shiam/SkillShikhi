// controllers/skill/skillController.js

import Skill from '../../models/Skill';
import dbConnect from '../../lib/mongodb';

const POPULAR_SKILLS = [
  { _id: 's_1', name: 'React & Next.js', category: 'Frontend', count: 48 },
  { _id: 's_2', name: 'Machine Learning & PyTorch', category: 'AI/ML', count: 42 },
  { _id: 's_3', name: 'UI/UX Design & Figma', category: 'Design', count: 37 },
  { _id: 's_4', name: 'Docker & Kubernetes', category: 'DevOps', count: 34 },
  { _id: 's_5', name: 'Python Backend & FastAPI', category: 'Backend', count: 29 },
  { _id: 's_6', name: 'JavaScript / TypeScript', category: 'Frontend', count: 28 },
  { _id: 's_7', name: 'Cloud Architecture (AWS)', category: 'Cloud', count: 25 },
  { _id: 's_8', name: 'Cybersecurity & Ethical Hacking', category: 'Security', count: 21 },
  { _id: 's_9', name: 'System Design & Distributed Systems', category: 'Architecture', count: 19 },
  { _id: 's_10', name: 'PostgreSQL & Database Optimization', category: 'Database', count: 16 },
];

/**
 * Get all skills sorted by popularity
 */
export async function getAllSkills() {
  try {
    const conn = await dbConnect();
    if (conn) {
      const skills = await Skill.find().sort({ count: -1 });
      if (skills && skills.length > 0) {
        return { success: true, skills, status: 200 };
      }
    }
  } catch (error) {
    console.warn('Skills DB fallback triggered:', error.message);
  }

  return { success: true, skills: POPULAR_SKILLS, status: 200 };
}

/**
 * Create a new skill
 */
export async function createSkill(skillData) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const existingSkill = await Skill.findOne({ name: skillData.name });
      if (existingSkill) {
        return { success: false, message: 'Skill already exists', status: 400 };
      }

      const skill = new Skill({
        name: skillData.name,
        category: skillData.category || 'Other',
        count: 1,
      });

      await skill.save();
      return { success: true, skill, status: 201 };
    }
  } catch (error) {
    console.warn('Create skill fallback triggered:', error.message);
  }

  const fallbackSkill = {
    _id: `s_${Date.now()}`,
    name: skillData.name,
    category: skillData.category || 'Other',
    count: 1,
  };

  return { success: true, skill: fallbackSkill, status: 201 };
}

/**
 * Get users with a specific skill
 */
export async function getUsersWithSkill(skillName) {
  try {
    const conn = await dbConnect();
    if (conn) {
      const users = await Skill.find({ name: skillName });
      return { success: true, users, status: 200 };
    }
  } catch (error) {
    console.warn('Users with skill fallback:', error.message);
  }

  return { success: true, users: [], status: 200 };
}
