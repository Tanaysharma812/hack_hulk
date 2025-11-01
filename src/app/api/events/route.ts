import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { events, ngoProfiles } from '@/db/schema';
import { eq, like, and, or, gte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const ngoId = searchParams.get('ngoId');
    const approved = searchParams.get('approved');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const upcoming = searchParams.get('upcoming');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single event by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const event = await db
        .select()
        .from(events)
        .where(eq(events.id, parseInt(id)))
        .limit(1);

      if (event.length === 0) {
        return NextResponse.json(
          { error: 'Event not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(event[0], { status: 200 });
    }

    // List events with filters
    let query = db.select().from(events);
    const conditions = [];

    // Filter by NGO ID
    if (ngoId) {
      if (isNaN(parseInt(ngoId))) {
        return NextResponse.json(
          { error: 'Valid NGO ID is required', code: 'INVALID_NGO_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(events.ngoId, parseInt(ngoId)));
    }

    // Filter by approval status
    if (approved !== null && approved !== undefined) {
      const approvedBool = approved === 'true';
      conditions.push(eq(events.approved, approvedBool));
    }

    // Filter by category
    if (category) {
      conditions.push(eq(events.category, category));
    }

    // Filter upcoming events
    if (upcoming === 'true') {
      const currentDate = new Date().toISOString();
      conditions.push(gte(events.eventDate, currentDate));
    }

    // Search in title, description, location
    if (search) {
      const searchCondition = or(
        like(events.title, `%${search}%`),
        like(events.description, `%${search}%`),
        like(events.location, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting, pagination
    const results = await query
      .orderBy(desc(events.eventDate))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ngoId, title, description, eventDate, location, category, registrationLink, imageUrl } = body;

    // Validate required fields
    if (!ngoId) {
      return NextResponse.json(
        { error: 'NGO ID is required', code: 'MISSING_NGO_ID' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    if (!eventDate || typeof eventDate !== 'string') {
      return NextResponse.json(
        { error: 'Event date is required', code: 'MISSING_EVENT_DATE' },
        { status: 400 }
      );
    }

    if (!location || typeof location !== 'string' || location.trim() === '') {
      return NextResponse.json(
        { error: 'Location is required', code: 'MISSING_LOCATION' },
        { status: 400 }
      );
    }

    if (!category || typeof category !== 'string' || category.trim() === '') {
      return NextResponse.json(
        { error: 'Category is required', code: 'MISSING_CATEGORY' },
        { status: 400 }
      );
    }

    // Validate ngoId is a valid integer
    if (isNaN(parseInt(ngoId))) {
      return NextResponse.json(
        { error: 'Valid NGO ID is required', code: 'INVALID_NGO_ID' },
        { status: 400 }
      );
    }

    // Validate eventDate is a valid ISO date
    const eventDateObj = new Date(eventDate);
    if (isNaN(eventDateObj.getTime())) {
      return NextResponse.json(
        { error: 'Event date must be a valid ISO date string', code: 'INVALID_EVENT_DATE' },
        { status: 400 }
      );
    }

    // Validate eventDate is in the future
    const currentDate = new Date();
    if (eventDateObj < currentDate) {
      return NextResponse.json(
        { error: 'Event date must be in the future', code: 'PAST_EVENT_DATE' },
        { status: 400 }
      );
    }

    // Validate NGO exists
    const ngoExists = await db
      .select()
      .from(ngoProfiles)
      .where(eq(ngoProfiles.id, parseInt(ngoId)))
      .limit(1);

    if (ngoExists.length === 0) {
      return NextResponse.json(
        { error: 'NGO profile not found', code: 'NGO_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Sanitize inputs
    const sanitizedTitle = title.trim();
    const sanitizedLocation = location.trim();
    const sanitizedCategory = category.trim();

    // Create event data
    const now = new Date().toISOString();
    const eventData = {
      ngoId: parseInt(ngoId),
      title: sanitizedTitle,
      description: description ? description.trim() : null,
      eventDate: eventDate,
      location: sanitizedLocation,
      category: sanitizedCategory,
      registrationLink: registrationLink ? registrationLink.trim() : null,
      imageUrl: imageUrl ? imageUrl.trim() : null,
      approved: false,
      createdAt: now,
      updatedAt: now,
    };

    const newEvent = await db
      .insert(events)
      .values(eventData)
      .returning();

    return NextResponse.json(newEvent[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json(
        { error: 'Event not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, eventDate, location, category, registrationLink, imageUrl, approved } = body;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title must be a non-empty string', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (eventDate !== undefined) {
      if (typeof eventDate !== 'string') {
        return NextResponse.json(
          { error: 'Event date must be a string', code: 'INVALID_EVENT_DATE' },
          { status: 400 }
        );
      }
      const eventDateObj = new Date(eventDate);
      if (isNaN(eventDateObj.getTime())) {
        return NextResponse.json(
          { error: 'Event date must be a valid ISO date string', code: 'INVALID_EVENT_DATE' },
          { status: 400 }
        );
      }
      updates.eventDate = eventDate;
    }

    if (location !== undefined) {
      if (typeof location !== 'string' || location.trim() === '') {
        return NextResponse.json(
          { error: 'Location must be a non-empty string', code: 'INVALID_LOCATION' },
          { status: 400 }
        );
      }
      updates.location = location.trim();
    }

    if (category !== undefined) {
      if (typeof category !== 'string' || category.trim() === '') {
        return NextResponse.json(
          { error: 'Category must be a non-empty string', code: 'INVALID_CATEGORY' },
          { status: 400 }
        );
      }
      updates.category = category.trim();
    }

    if (registrationLink !== undefined) {
      updates.registrationLink = registrationLink ? registrationLink.trim() : null;
    }

    if (imageUrl !== undefined) {
      updates.imageUrl = imageUrl ? imageUrl.trim() : null;
    }

    if (approved !== undefined) {
      if (typeof approved !== 'boolean') {
        return NextResponse.json(
          { error: 'Approved must be a boolean', code: 'INVALID_APPROVED' },
          { status: 400 }
        );
      }
      updates.approved = approved;
    }

    const updatedEvent = await db
      .update(events)
      .set(updates)
      .where(eq(events.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedEvent[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if event exists
    const existingEvent = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(id)))
      .limit(1);

    if (existingEvent.length === 0) {
      return NextResponse.json(
        { error: 'Event not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(events)
      .where(eq(events.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Event deleted successfully',
        id: deleted[0].id,
        event: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}