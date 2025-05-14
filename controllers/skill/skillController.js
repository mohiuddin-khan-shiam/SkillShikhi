// controllers/skill/skillController.js

import Skill from '../../models/Skill';
import dbConnect from '../../lib/mongodb';

/**
 * Get all skills sorted by popularity
 * @returns {Object} Response object with skills data or error message
 */
export async function getAllSkills() {
  console.log('🔍 Getting all skills');
  
  try {
    await dbConnect();

    // Get all skills sorted by count (most popular first)
    const skills = await Skill.find().sort({ count: -1 });
    
    return { success: true, skills, status: 200 };
  } catch (error) {
    console.error('❌ Error fetching skills:', error.message);
    return { success: false, message: 'Internal Server Error', status: 500 };
  }
}

/**
 * Create a new skill
 * @param {Object} skillData - Skill data
 * @param {string} skillData.name - Skill name
 * @param {string} skillData.category - Skill category
 * @returns {Object} Response object with created skill or error message
 */
export async function createSkill(skillData) {
  console.log(`🆕 Creating new skill: ${skillData.name}`);
  
  try {
    await dbConnect();
    
    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: skillData.name });
    if (existingSkill) {
      return { success: false, message: 'Skill already exists', status: 400 };
    }
    
    // Create new skill
    const skill = new Skill({
      name: skillData.name,
      category: skillData.category || 'Other',
      count: 1
    });
    
    await skill.save();
    
    return { success: true, skill, status: 201 };
  } catch (error) {
    console.error('❌ Error creating skill:', error.message);
    return { success: false, message: 'Internal Server Error', status: 500 };
  }
}

/**
 * Update skill count (increment when a user masters it)
 * @param {string} skillId - Skill ID
 * @returns {Object} Response object with updated skill or error message
 */
export async function incrementSkillCount(skillId) {
  console.log(`🔼 Incrementing count for skill ID: ${skillId}`);
  
  try {
    await dbConnect();
    
    // Find and increment skill count
    const skill = await Skill.findByIdAndUpdate(
      skillId,
      { $inc: { count: 1 } },
      { new: true }
    );
    
    if (!skill) {
      return { success: false, message: 'Skill not found', status: 404 };
    }
    
    return { success: true, skill, status: 200 };
  } catch (error) {
    console.error('❌ Error updating skill count:', error.message);
    return { success: false, message: 'Internal Server Error', status: 500 };
  }
}
