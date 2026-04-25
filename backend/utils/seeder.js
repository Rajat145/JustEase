require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Case = require('../models/Case');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  await User.deleteMany({});
  await Case.deleteMany({});

  // Create users
  const admin = await User.create({
    name: 'Admin Kumar',
    email: 'admin@justease.in',
    password: 'Admin@123',
    role: 'admin',
  });

  const judge1 = await User.create({
    name: 'Hon. Anil Mehta',
    email: 'judge@justease.in',
    password: 'Judge@123',
    role: 'judge',
    barRegistration: 'BAR-DL-2001-0042',
  });

  const judge2 = await User.create({
    name: 'Hon. Sunitha Krishnan',
    email: 'krishnan@justease.in',
    password: 'Judge@123',
    role: 'judge',
  });

  const user1 = await User.create({
    name: 'Priya Sharma',
    email: 'user@justease.in',
    password: 'User@123',
    role: 'user',
    phone: '+91 98765 43210',
    address: '204-B, Saket Colony, New Delhi - 110017',
  });

  const user2 = await User.create({
    name: 'Mohan Das',
    email: 'mohan@justease.in',
    password: 'User@123',
    role: 'user',
  });

  // Create cases
  await Case.create([
    {
      title: 'Property Dispute vs. Ramesh Kumar',
      category: 'Civil',
      description: 'Boundary wall encroachment on registered plot No. 47.',
      reliefSought: 'Removal of encroachment + ₹50,000 damages',
      urgency: 'Urgent',
      status: 'In Progress',
      filer: user1._id,
      filerName: user1.name,
      assignedJudge: judge1._id,
      assignedJudgeName: judge1.name,
      respondent: { name: 'Ramesh Kumar', address: 'Plot 48, Saket Colony, Delhi' },
      nextHearing: new Date('2025-01-15'),
    },
    {
      title: 'Employment Termination Appeal',
      category: 'Labour',
      description: 'Wrongful termination without notice or dues.',
      reliefSought: 'Reinstatement + back wages',
      urgency: 'Normal',
      status: 'Pending',
      filer: user2._id,
      filerName: user2.name,
      respondent: { name: 'XYZ Pvt. Ltd.' },
    },
    {
      title: 'Consumer Rights — Defective Product',
      category: 'Consumer',
      description: 'Purchased defective refrigerator. Company refuses replacement.',
      reliefSought: 'Replacement + ₹10,000 compensation',
      urgency: 'Low',
      status: 'Pending',
      filer: user1._id,
      filerName: user1.name,
    },
  ]);

  console.log('✅ Seeding complete!');
  console.log('\nDemo Credentials:');
  console.log('Admin  → admin@justease.in  / Admin@123');
  console.log('Judge  → judge@justease.in  / Judge@123');
  console.log('User   → user@justease.in   / User@123');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
