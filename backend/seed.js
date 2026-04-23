/**
 * Seed script — run once to populate demo data
 * Usage: node seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Task = require('./models/Task');
const Quiz = require('./models/Quiz');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecoquest';

const tasks = [
  { title: 'Plant a Tree', description: 'Plant a sapling in your garden, school, or nearby area. Take a photo with it.', category: 'plantation', type: 'daily', xpReward: 100 },
  { title: 'Segregate Waste', description: 'Separate dry and wet waste at home for one full day. Document it.', category: 'waste', type: 'daily', xpReward: 60 },
  { title: 'Save Water Challenge', description: 'Reduce your water usage by 20% today. Note down how.', category: 'water', type: 'daily', xpReward: 70 },
  { title: 'Switch Off Unused Lights', description: 'For an entire day, ensure no lights are left on in empty rooms.', category: 'energy', type: 'daily', xpReward: 50 },
  { title: 'Clean Your Street', description: 'Spend 20 minutes picking up litter from your street or locality.', category: 'cleanliness', type: 'weekly', xpReward: 150 },
  { title: 'Compost Mission', description: 'Start a compost pile with kitchen waste. Document the process.', category: 'waste', type: 'mission', xpReward: 200 },
  { title: 'Rainwater Harvesting', description: 'Set up a simple rainwater collection system at home.', category: 'water', type: 'mission', xpReward: 180 },
  { title: 'Solar Energy Awareness', description: 'Research solar panels and write a 100-word summary on their benefits.', category: 'energy', type: 'weekly', xpReward: 80 },
];

const quizQuestions = [
  {
    question: 'Which gas is mainly responsible for the greenhouse effect?',
    options: ['Oxygen', 'Carbon Dioxide', 'Nitrogen', 'Hydrogen'],
    correctIndex: 1,
    explanation: 'CO2 traps heat from the sun, causing global warming.',
  },
  {
    question: 'What percentage of Earth\'s water is freshwater?',
    options: ['50%', '25%', '10%', '3%'],
    correctIndex: 3,
    explanation: 'Only about 3% of Earth\'s water is freshwater, and most is frozen.',
  },
  {
    question: 'Which of these is NOT a renewable energy source?',
    options: ['Solar', 'Wind', 'Coal', 'Hydropower'],
    correctIndex: 2,
    explanation: 'Coal is a fossil fuel and a non-renewable energy source.',
  },
  {
    question: 'The process by which plants make food using sunlight is called?',
    options: ['Respiration', 'Transpiration', 'Photosynthesis', 'Decomposition'],
    correctIndex: 2,
    explanation: 'Photosynthesis converts sunlight, CO2, and water into glucose and oxygen.',
  },
  {
    question: 'Which bin should glass bottles go into?',
    options: ['Green (wet waste)', 'Blue (dry/recyclable waste)', 'Red (hazardous)', 'Black (general)'],
    correctIndex: 1,
    explanation: 'Glass is recyclable and should go in the dry waste / recyclable bin.',
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Task.deleteMany({}), Quiz.deleteMany({})]);
  console.log('Cleared existing data');

  // Create teacher
  const teacherPwd = await bcrypt.hash('teacher123', 10);
  const teacher = await User.create({
    name: 'Ms. Priya Singh',
    email: 'teacher@ecoquest.com',
    password: teacherPwd,
    role: 'teacher',
    school: 'Green Valley School',
    isVerified: true, // seed users are pre-verified
  });

  // Create students
  const studentData = [
    { name: 'Rahul Sharma', email: 'rahul@ecoquest.com', class: 'Class 9', xp: 850, level: 2, streak: 7 },
    { name: 'Anjali Verma', email: 'anjali@ecoquest.com', class: 'Class 10', xp: 1200, level: 3, streak: 14 },
    { name: 'Arjun Patel', email: 'arjun@ecoquest.com', class: 'Class 8', xp: 450, level: 1, streak: 3 },
    { name: 'Sneha Rao', email: 'sneha@ecoquest.com', class: 'Class 9', xp: 680, level: 2, streak: 5 },
  ];
  const studentPwd = await bcrypt.hash('student123', 10);
  await User.insertMany(studentData.map((s) => ({ ...s, password: studentPwd, role: 'student', school: 'Green Valley School', isVerified: true })));

  // Create tasks
  await Task.insertMany(tasks.map((t) => ({ ...t, createdBy: teacher._id })));

  // Create quiz
  await Quiz.create({
    title: 'Environmental Science - Basics',
    subject: 'Environmental Science',
    chapter: 'Ecosystem',
    class: 'Class 9',
    questions: quizQuestions,
    createdBy: teacher._id,
    xpReward: 150,
  });

  console.log('\nSeed complete!');
  console.log('Teacher login  →  teacher@ecoquest.com  / teacher123');
  console.log('Student login  →  rahul@ecoquest.com  / student123');
  await mongoose.disconnect();
}

seed().catch((e) => { console.error(e); process.exit(1); });
