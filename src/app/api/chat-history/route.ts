import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { chatHistory } from '@/db/schema';
import { eq, like, or, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      const record = await db
        .select()
        .from(chatHistory)
        .where(eq(chatHistory.id, parseInt(id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json(
          { error: 'Chat record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(record[0], { status: 200 });
    }

    // Build query with filters
    let query = db.select().from(chatHistory);
    const conditions = [];

    // Filter by userId
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }
      conditions.push(eq(chatHistory.userId, parseInt(userId)));
    }

    // Filter by sessionId
    if (sessionId) {
      conditions.push(eq(chatHistory.sessionId, sessionId));
    }

    // Search in message and response
    if (search) {
      conditions.push(
        or(
          like(chatHistory.message, `%${search}%`),
          like(chatHistory.response, `%${search}%`)
        )
      );
    }

    // Apply conditions if any exist
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    // Order by createdAt DESC and apply pagination
    const results = await query
      .orderBy(desc(chatHistory.createdAt))
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
    const { sessionId, message, response, userId, language } = body;

    // Validate required fields
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required', code: 'MISSING_SESSION_ID' },
        { status: 400 }
      );
    }

    if (!message || message.trim() === '') {
      return NextResponse.json(
        { error: 'Message is required and cannot be empty', code: 'MISSING_MESSAGE' },
        { status: 400 }
      );
    }

    if (!response || response.trim() === '') {
      return NextResponse.json(
        { error: 'Response is required and cannot be empty', code: 'MISSING_RESPONSE' },
        { status: 400 }
      );
    }

    // Validate userId if provided
    if (userId !== undefined && userId !== null && isNaN(parseInt(userId))) {
      return NextResponse.json(
        { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
        { status: 400 }
      );
    }

    // Prepare insert data
    const insertData: any = {
      sessionId: sessionId.trim(),
      message: message.trim(),
      response: response.trim(),
      language: language?.trim() || 'en',
      createdAt: new Date().toISOString(),
    };

    // Add userId only if provided and valid
    if (userId !== undefined && userId !== null) {
      insertData.userId = parseInt(userId);
    }

    const newRecord = await db
      .insert(chatHistory)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
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
    const sessionId = searchParams.get('sessionId');
    const userId = searchParams.get('userId');

    // Validate that at least one parameter is provided
    if (!id && !sessionId && !userId) {
      return NextResponse.json(
        { error: 'Either id, sessionId, or userId is required', code: 'MISSING_DELETE_PARAMETER' },
        { status: 400 }
      );
    }

    let deleted;

    // Delete by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json(
          { error: 'Valid ID is required', code: 'INVALID_ID' },
          { status: 400 }
        );
      }

      deleted = await db
        .delete(chatHistory)
        .where(eq(chatHistory.id, parseInt(id)))
        .returning();

      if (deleted.length === 0) {
        return NextResponse.json(
          { error: 'Chat record not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Chat history deleted successfully', 
          deletedCount: deleted.length,
          deleted: deleted[0]
        },
        { status: 200 }
      );
    }

    // Delete by sessionId
    if (sessionId) {
      deleted = await db
        .delete(chatHistory)
        .where(eq(chatHistory.sessionId, sessionId))
        .returning();

      if (deleted.length === 0) {
        return NextResponse.json(
          { error: 'No chat records found for this session', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Chat history deleted successfully', 
          deletedCount: deleted.length
        },
        { status: 200 }
      );
    }

    // Delete by userId
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json(
          { error: 'Valid user ID is required', code: 'INVALID_USER_ID' },
          { status: 400 }
        );
      }

      deleted = await db
        .delete(chatHistory)
        .where(eq(chatHistory.userId, parseInt(userId)))
        .returning();

      if (deleted.length === 0) {
        return NextResponse.json(
          { error: 'No chat records found for this user', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          message: 'Chat history deleted successfully', 
          deletedCount: deleted.length
        },
        { status: 200 }
      );
    }

    // Should never reach here due to validation above
    return NextResponse.json(
      { error: 'Invalid delete operation', code: 'INVALID_OPERATION' },
      { status: 400 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}