import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcrypt';

async function main() {
  const now = new Date();
  const getRecentDate = (daysAgo: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const ngoPasswordHash = await bcrypt.hash('Ngo@1234', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  const sampleUsers = [
    {
      email: 'admin@mindconnect.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      fullName: 'Admin User',
      createdAt: getRecentDate(30),
      updatedAt: getRecentDate(30),
    },
    {
      email: 'contact@mentalhealthfoundation.org',
      passwordHash: ngoPasswordHash,
      role: 'ngo',
      fullName: 'Mental Health Foundation',
      createdAt: getRecentDate(25),
      updatedAt: getRecentDate(25),
    },
    {
      email: 'info@youthwellness.org',
      passwordHash: ngoPasswordHash,
      role: 'ngo',
      fullName: 'Youth Wellness Initiative',
      createdAt: getRecentDate(20),
      updatedAt: getRecentDate(20),
    },
    {
      email: 'support@studentsupport.net',
      passwordHash: ngoPasswordHash,
      role: 'ngo',
      fullName: 'Student Support Network',
      createdAt: getRecentDate(15),
      updatedAt: getRecentDate(15),
    },
    {
      email: 'hello@mindcarealliance.org',
      passwordHash: ngoPasswordHash,
      role: 'ngo',
      fullName: 'Mind Care Alliance',
      createdAt: getRecentDate(10),
      updatedAt: getRecentDate(10),
    },
    {
      email: 'contact@hopehealing.org',
      passwordHash: ngoPasswordHash,
      role: 'ngo',
      fullName: 'Hope & Healing Center',
      createdAt: getRecentDate(5),
      updatedAt: getRecentDate(5),
    },
    {
      email: 'sarah.johnson@university.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      fullName: 'Sarah Johnson',
      createdAt: getRecentDate(8),
      updatedAt: getRecentDate(8),
    },
    {
      email: 'michael.chen@university.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      fullName: 'Michael Chen',
      createdAt: getRecentDate(6),
      updatedAt: getRecentDate(6),
    },
    {
      email: 'priya.patel@university.edu',
      passwordHash: studentPasswordHash,
      role: 'student',
      fullName: 'Priya Patel',
      createdAt: getRecentDate(3),
      updatedAt: getRecentDate(3),
    },
  ];

  await db.insert(users).values(sampleUsers);

  console.log('✅ Users seeder completed successfully');
  console.log('   - 1 Admin user created');
  console.log('   - 5 NGO users created');
  console.log('   - 3 Student users created');
}

main().catch((error) => {
  console.error('❌ Seeder failed:', error);
});