import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, ngoProfiles, events } from '@/db/schema';
import { eq, gte, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Initialize response object with default values
    const analyticsData = {
      users: {
        total: 0,
        byRole: {
          admin: 0,
          ngo: 0,
          student: 0
        }
      },
      ngoProfiles: {
        total: 0,
        approved: 0,
        pending: 0
      },
      events: {
        total: 0,
        approved: 0,
        pending: 0,
        upcoming: 0,
        byCategory: {} as Record<string, number>
      },
      timestamp: new Date().toISOString()
    };

    // Query 1: Total users count
    try {
      const totalUsersResult = await db.select({ count: sql<number>`count(*)` })
        .from(users);
      analyticsData.users.total = totalUsersResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching total users:', error);
    }

    // Query 2: Users by role breakdown
    try {
      const usersByRoleResult = await db.select({
        role: users.role,
        count: sql<number>`count(*)`
      })
        .from(users)
        .groupBy(users.role);

      usersByRoleResult.forEach(row => {
        const role = row.role as 'admin' | 'ngo' | 'student';
        if (role === 'admin' || role === 'ngo' || role === 'student') {
          analyticsData.users.byRole[role] = row.count || 0;
        }
      });
    } catch (error) {
      console.error('Error fetching users by role:', error);
    }

    // Query 3: Total NGO profiles count
    try {
      const totalNgosResult = await db.select({ count: sql<number>`count(*)` })
        .from(ngoProfiles);
      analyticsData.ngoProfiles.total = totalNgosResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching total NGO profiles:', error);
    }

    // Query 4: Approved NGO profiles count
    try {
      const approvedNgosResult = await db.select({ count: sql<number>`count(*)` })
        .from(ngoProfiles)
        .where(eq(ngoProfiles.approved, true));
      analyticsData.ngoProfiles.approved = approvedNgosResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching approved NGO profiles:', error);
    }

    // Query 5: Pending NGO profiles count
    try {
      const pendingNgosResult = await db.select({ count: sql<number>`count(*)` })
        .from(ngoProfiles)
        .where(eq(ngoProfiles.approved, false));
      analyticsData.ngoProfiles.pending = pendingNgosResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching pending NGO profiles:', error);
    }

    // Query 6: Total events count
    try {
      const totalEventsResult = await db.select({ count: sql<number>`count(*)` })
        .from(events);
      analyticsData.events.total = totalEventsResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching total events:', error);
    }

    // Query 7: Approved events count
    try {
      const approvedEventsResult = await db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(eq(events.approved, true));
      analyticsData.events.approved = approvedEventsResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching approved events:', error);
    }

    // Query 8: Pending events count
    try {
      const pendingEventsResult = await db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(eq(events.approved, false));
      analyticsData.events.pending = pendingEventsResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching pending events:', error);
    }

    // Query 9: Upcoming events count
    try {
      const upcomingEventsResult = await db.select({ count: sql<number>`count(*)` })
        .from(events)
        .where(sql`${events.eventDate} >= ${currentDate} AND ${events.approved} = 1`);
      analyticsData.events.upcoming = upcomingEventsResult[0]?.count || 0;
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
    }

    // Query 10: Events by category distribution
    try {
      const eventsByCategoryResult = await db.select({
        category: events.category,
        count: sql<number>`count(*)`
      })
        .from(events)
        .groupBy(events.category);

      eventsByCategoryResult.forEach(row => {
        if (row.category) {
          analyticsData.events.byCategory[row.category] = row.count || 0;
        }
      });
    } catch (error) {
      console.error('Error fetching events by category:', error);
    }

    return NextResponse.json(analyticsData, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}