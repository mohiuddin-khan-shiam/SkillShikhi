// Utility functions for seed data

/**
 * Creates a placeholder image URL for a user based on their name
 * @param {string} name - User's name
 * @returns {string} Placeholder image URL
 */
export function generatePlaceholderImage(name) {
  const initials = name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
    
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128&bold=true&font-size=0.5&length=2&rounded=true`;
}

/**
 * Generate a random date within the specified range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Date} Random date between start and end
 */
export function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * Shuffles an array in-place using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const newArray = [...array];
  
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  
  return newArray;
}

/**
 * Get a random number of items from an array
 * @param {Array} array - Source array
 * @param {number} min - Minimum number of items
 * @param {number} max - Maximum number of items
 * @returns {Array} Array with random number of items
 */
export function getRandomItems(array, min, max) {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  return shuffleArray(array).slice(0, count);
}

/**
 * Get random skills from the skills list
 * @param {Array} skills - List of skills
 * @param {number} count - Number of skills to get
 * @returns {Array} Random skills
 */
export function getRandomSkills(skills, count) {
  return getRandomItems(skills, 1, count)
    .map(skill => typeof skill === 'string' ? skill : skill.name);
}
