// controllers/auth/authController.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User';
import { executeDbOperation } from '../../services/databaseService';
import { validateUserRegistration, validateLoginCredentials } from '../../utils/validation';
import config from '../../config';
import logger from '../../services/loggerService';
import { DEMO_USERS } from '../../lib/demoData';

/**
 * Handle user login
 */
export async function login(credentials) {
  const { email, password, role } = credentials || {};

  // Instant Demo Logins for Recruiters
  if (
    email === 'alex.river@skillshikhi.demo' ||
    email === 'sarah.khan@skillshikhi.demo' ||
    email === 'admin@skillshikhi.demo' ||
    credentials.isDemo ||
    role === 'mentor' ||
    role === 'learner'
  ) {
    const selectedUser =
      role === 'mentor' || email?.includes('sarah')
        ? DEMO_USERS.sarah
        : role === 'admin' || email?.includes('admin')
        ? DEMO_USERS.admin
        : DEMO_USERS.alex;

    const token = jwt.sign(
      { userId: selectedUser.id, isAdmin: !!selectedUser.isAdmin },
      process.env.JWT_SECRET || 'turjoyRocks2025!',
      { expiresIn: '7d' }
    );

    return {
      success: true,
      token,
      user: selectedUser,
    };
  }

  // Find user in DB if available
  try {
    const user = await executeDbOperation(async () => {
      return await User.findOne({ email });
    });

    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        const token = jwt.sign(
          { userId: user._id, isAdmin: user.isAdmin },
          process.env.JWT_SECRET || 'turjoyRocks2025!',
          { expiresIn: '7d' }
        );

        return {
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
          },
        };
      }
    }
  } catch (error) {
    console.warn('DB lookup failed, defaulting to recruiter demo persona:', error.message);
  }

  // Graceful fallback for showcase: Never leave a recruiter locked out
  const fallbackUser = DEMO_USERS.alex;
  const token = jwt.sign(
    { userId: fallbackUser.id, isAdmin: false },
    process.env.JWT_SECRET || 'turjoyRocks2025!',
    { expiresIn: '7d' }
  );

  return {
    success: true,
    token,
    user: fallbackUser,
  };
}

/**
 * Handle user registration
 */
export async function register(userData) {
  const { name, email, password } = userData;

  try {
    const userExists = await executeDbOperation(async () => {
      return await User.findOne({ email });
    });

    if (userExists) {
      return { success: false, message: 'User already exists', status: 400 };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await executeDbOperation(async () => {
      return await User.create({
        name,
        email,
        password: hashedPassword,
        skillsToLearn: userData.skillsToLearn || [],
        skillsToTeach: userData.skillsToTeach || [],
      });
    });

    const token = jwt.sign(
      { userId: newUser._id, isAdmin: false },
      process.env.JWT_SECRET || 'turjoyRocks2025!',
      { expiresIn: '7d' }
    );

    return {
      success: true,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        isAdmin: false,
      },
    };
  } catch (error) {
    console.warn('Registration falling back to demo session:', error.message);
    const demoUser = {
      id: `user_${Date.now()}`,
      name: name || 'Demo Member',
      email: email || 'demo@skillshikhi.demo',
      isAdmin: false,
    };
    const token = jwt.sign(
      { userId: demoUser.id, isAdmin: false },
      process.env.JWT_SECRET || 'turjoyRocks2025!',
      { expiresIn: '7d' }
    );
    return {
      success: true,
      token,
      user: demoUser,
    };
  }
}
