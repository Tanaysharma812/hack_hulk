import { db } from '@/db';
import { events } from '@/db/schema';

async function main() {
    const now = new Date();
    const getISODate = (daysFromNow: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() + daysFromNow);
        return date.toISOString();
    };

    const getRecentTimestamp = (daysAgo: number) => {
        const date = new Date(now);
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    };

    const sampleEvents = [
        {
            ngoId: 1,
            title: 'Stress Management Techniques for Students',
            description: 'Learn practical strategies to manage academic stress and maintain mental wellness during exam season.',
            eventDate: getISODate(7),
            location: 'Campus Community Center, Room 201',
            category: 'Workshop',
            registrationLink: 'https://mentalhealthfoundation.org/events/stress-workshop',
            imageUrl: 'https://placehold.co/800x400/4F46E5/FFFFFF/png?text=Stress+Workshop',
            approved: true,
            createdAt: getRecentTimestamp(8),
            updatedAt: getRecentTimestamp(8),
        },
        {
            ngoId: 2,
            title: 'Weekly Peer Support Circle',
            description: 'A safe space to share experiences, connect with peers, and build a supportive community.',
            eventDate: getISODate(3),
            location: 'Student Union Building, Room 305',
            category: 'Support Group',
            registrationLink: 'https://youthwellness.org/support-groups',
            imageUrl: 'https://placehold.co/800x400/10B981/FFFFFF/png?text=Support+Circle',
            approved: true,
            createdAt: getRecentTimestamp(6),
            updatedAt: getRecentTimestamp(6),
        },
        {
            ngoId: 4,
            title: 'Mindfulness and Meditation for Beginners',
            description: 'Introduction to mindfulness practices and guided meditation techniques for mental clarity.',
            eventDate: getISODate(10),
            location: 'Wellness Center, Meditation Room',
            category: 'Workshop',
            registrationLink: 'https://mindcarealliance.org/mindfulness',
            imageUrl: 'https://placehold.co/800x400/8B5CF6/FFFFFF/png?text=Mindfulness',
            approved: true,
            createdAt: getRecentTimestamp(9),
            updatedAt: getRecentTimestamp(9),
        },
        {
            ngoId: 1,
            title: 'Breaking the Stigma: Mental Health Awareness',
            description: 'Join us for an online discussion about mental health stigma and how to support those in need.',
            eventDate: getISODate(14),
            location: 'Online via Zoom',
            category: 'Webinar',
            registrationLink: 'https://mentalhealthfoundation.org/webinars/stigma',
            imageUrl: 'https://placehold.co/800x400/4F46E5/FFFFFF/png?text=Awareness+Webinar',
            approved: false,
            createdAt: getRecentTimestamp(3),
            updatedAt: getRecentTimestamp(3),
        },
        {
            ngoId: 4,
            title: 'Free One-on-One Counseling Sessions',
            description: 'Professional counseling sessions available for students dealing with anxiety, depression, or stress.',
            eventDate: getISODate(5),
            location: 'Mind Care Center, 123 Main Street',
            category: 'Counseling Session',
            registrationLink: 'https://mindcarealliance.org/counseling',
            imageUrl: 'https://placehold.co/800x400/8B5CF6/FFFFFF/png?text=Counseling',
            approved: true,
            createdAt: getRecentTimestamp(7),
            updatedAt: getRecentTimestamp(7),
        },
        {
            ngoId: 2,
            title: 'Coping with Anxiety: Tools and Techniques',
            description: 'Learn evidence-based strategies to manage anxiety and improve your mental well-being.',
            eventDate: getISODate(21),
            location: 'Health Sciences Building, Auditorium A',
            category: 'Workshop',
            registrationLink: 'https://youthwellness.org/anxiety-workshop',
            imageUrl: 'https://placehold.co/800x400/10B981/FFFFFF/png?text=Anxiety+Workshop',
            approved: true,
            createdAt: getRecentTimestamp(5),
            updatedAt: getRecentTimestamp(5),
        },
        {
            ngoId: 4,
            title: 'Depression Support Group - Monthly Meeting',
            description: 'A confidential support group for students experiencing depression. Share, listen, and heal together.',
            eventDate: getISODate(12),
            location: 'Community Health Center, Room B12',
            category: 'Support Group',
            registrationLink: 'https://mindcarealliance.org/support-groups/depression',
            imageUrl: 'https://placehold.co/800x400/8B5CF6/FFFFFF/png?text=Depression+Support',
            approved: false,
            createdAt: getRecentTimestamp(4),
            updatedAt: getRecentTimestamp(4),
        },
        {
            ngoId: 1,
            title: 'Building Resilience in Challenging Times',
            description: 'Discover strategies to build mental resilience and navigate life\'s challenges with confidence.',
            eventDate: getISODate(30),
            location: 'Online via Microsoft Teams',
            category: 'Webinar',
            registrationLink: 'https://mentalhealthfoundation.org/resilience',
            imageUrl: 'https://placehold.co/800x400/4F46E5/FFFFFF/png?text=Resilience+Webinar',
            approved: true,
            createdAt: getRecentTimestamp(10),
            updatedAt: getRecentTimestamp(10),
        },
        {
            ngoId: 2,
            title: 'Self-Care Saturday: Prioritizing Your Mental Health',
            description: 'Join us for a day of self-care activities, workshops, and wellness resources.',
            eventDate: getISODate(18),
            location: 'Recreation Center, Main Hall',
            category: 'Workshop',
            registrationLink: 'https://youthwellness.org/self-care-saturday',
            imageUrl: 'https://placehold.co/800x400/10B981/FFFFFF/png?text=Self+Care',
            approved: true,
            createdAt: getRecentTimestamp(2),
            updatedAt: getRecentTimestamp(2),
        },
        {
            ngoId: 4,
            title: 'Crisis Intervention and Suicide Prevention Training',
            description: 'Learn how to recognize warning signs and provide support to someone in crisis. Open to all students.',
            eventDate: getISODate(25),
            location: 'Student Services Building, Training Room 4',
            category: 'Workshop',
            registrationLink: 'https://mindcarealliance.org/crisis-training',
            imageUrl: 'https://placehold.co/800x400/8B5CF6/FFFFFF/png?text=Crisis+Training',
            approved: false,
            createdAt: getRecentTimestamp(1),
            updatedAt: getRecentTimestamp(1),
        },
    ];

    await db.insert(events).values(sampleEvents);
    
    console.log('✅ Events seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});