import { db } from '@/db';
import { ngoProfiles } from '@/db/schema';

async function main() {
    const sampleProfiles = [
        {
            userId: 2,
            ngoName: 'Mental Health Foundation',
            description: 'Dedicated to promoting mental health awareness and providing support services to students nationwide.',
            contactEmail: 'contact@mentalhealthfoundation.org',
            contactPhone: '+1-555-0101',
            websiteUrl: 'https://mentalhealthfoundation.org',
            logoUrl: 'https://placehold.co/200x200/4F46E5/FFFFFF/png?text=MHF',
            approved: true,
            createdAt: new Date('2024-01-15').toISOString(),
            updatedAt: new Date('2024-01-15').toISOString(),
        },
        {
            userId: 3,
            ngoName: 'Youth Wellness Initiative',
            description: 'Empowering young adults through mental wellness programs, workshops, and peer support groups.',
            contactEmail: 'info@youthwellness.org',
            contactPhone: '+1-555-0202',
            websiteUrl: 'https://youthwellness.org',
            logoUrl: 'https://placehold.co/200x200/10B981/FFFFFF/png?text=YWI',
            approved: true,
            createdAt: new Date('2024-01-18').toISOString(),
            updatedAt: new Date('2024-01-18').toISOString(),
        },
        {
            userId: 4,
            ngoName: 'Student Support Network',
            description: 'Connecting students with mental health resources, counseling services, and peer support communities.',
            contactEmail: 'support@studentnetwork.org',
            contactPhone: '+1-555-0303',
            websiteUrl: 'https://studentnetwork.org',
            logoUrl: 'https://placehold.co/200x200/F59E0B/FFFFFF/png?text=SSN',
            approved: false,
            createdAt: new Date('2024-01-22').toISOString(),
            updatedAt: new Date('2024-01-22').toISOString(),
        },
        {
            userId: 5,
            ngoName: 'Mind Care Alliance',
            description: 'Providing comprehensive mental health care through therapy, support groups, and wellness programs.',
            contactEmail: 'hello@mindcarealliance.org',
            contactPhone: '+1-555-0404',
            websiteUrl: 'https://mindcarealliance.org',
            logoUrl: 'https://placehold.co/200x200/8B5CF6/FFFFFF/png?text=MCA',
            approved: true,
            createdAt: new Date('2024-01-25').toISOString(),
            updatedAt: new Date('2024-01-25').toISOString(),
        },
        {
            userId: 6,
            ngoName: 'Hope & Healing Center',
            description: 'A safe space for mental wellness, offering counseling, meditation sessions, and crisis intervention services.',
            contactEmail: 'contact@hopeandhealingcenter.org',
            contactPhone: '+1-555-0505',
            websiteUrl: 'https://hopeandhealingcenter.org',
            logoUrl: 'https://placehold.co/200x200/EC4899/FFFFFF/png?text=HHC',
            approved: false,
            createdAt: new Date('2024-01-28').toISOString(),
            updatedAt: new Date('2024-01-28').toISOString(),
        },
    ];

    await db.insert(ngoProfiles).values(sampleProfiles);
    
    console.log('✅ NGO profiles seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});