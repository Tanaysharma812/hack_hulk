import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { ngoProfiles, users } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';

// Helper function to validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const approved = searchParams.get('approved');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Single record by ID
    if (id) {
      if (isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const profile = await db.select()
        .from(ngoProfiles)
        .where(eq(ngoProfiles.id, parseInt(id)))
        .limit(1);

      if (profile.length === 0) {
        return NextResponse.json({ 
          error: 'NGO profile not found',
          code: 'NOT_FOUND' 
        }, { status: 404 });
      }

      return NextResponse.json(profile[0], { status: 200 });
    }

    // Build query with filters
    let query = db.select().from(ngoProfiles);
    const conditions = [];

    // Filter by userId
    if (userId) {
      if (isNaN(parseInt(userId))) {
        return NextResponse.json({ 
          error: 'Valid user ID is required',
          code: 'INVALID_USER_ID' 
        }, { status: 400 });
      }
      conditions.push(eq(ngoProfiles.userId, parseInt(userId)));
    }

    // Filter by approved status
    if (approved !== null && approved !== undefined) {
      const approvedBool = approved === 'true';
      conditions.push(eq(ngoProfiles.approved, approvedBool));
    }

    // Search functionality
    if (search) {
      const searchCondition = or(
        like(ngoProfiles.ngoName, `%${search}%`),
        like(ngoProfiles.description, `%${search}%`),
        like(ngoProfiles.contactEmail, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    // Apply all conditions
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    // Apply sorting, pagination
    const results = await query
      .orderBy(desc(ngoProfiles.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'SERVER_ERROR' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ngoName, description, contactEmail, contactPhone, websiteUrl, logoUrl } = body;

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ 
        error: 'User ID is required',
        code: 'MISSING_USER_ID' 
      }, { status: 400 });
    }

    if (!ngoName) {
      return NextResponse.json({ 
        error: 'NGO name is required',
        code: 'MISSING_NGO_NAME' 
      }, { status: 400 });
    }

    if (!contactEmail) {
      return NextResponse.json({ 
        error: 'Contact email is required',
        code: 'MISSING_CONTACT_EMAIL' 
      }, { status: 400 });
    }

    // Validate userId is a number
    if (isNaN(parseInt(userId))) {
      return NextResponse.json({ 
        error: 'Valid user ID is required',
        code: 'INVALID_USER_ID' 
      }, { status: 400 });
    }

    // Validate email format
    if (!isValidEmail(contactEmail)) {
      return NextResponse.json({ 
        error: 'Invalid email format',
        code: 'INVALID_EMAIL_FORMAT' 
      }, { status: 400 });
    }

    // Check if userId exists in users table
    const userExists = await db.select()
      .from(users)
      .where(eq(users.id, parseInt(userId)))
      .limit(1);

    if (userExists.length === 0) {
      return NextResponse.json({ 
        error: 'User does not exist',
        code: 'USER_NOT_FOUND' 
      }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      userId: parseInt(userId),
      ngoName: ngoName.trim(),
      description: description ? description.trim() : null,
      contactEmail: contactEmail.trim().toLowerCase(),
      contactPhone: contactPhone ? contactPhone.trim() : null,
      websiteUrl: websiteUrl ? websiteUrl.trim() : null,
      logoUrl: logoUrl ? logoUrl.trim() : null,
      approved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert new NGO profile
    const newProfile = await db.insert(ngoProfiles)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newProfile[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'SERVER_ERROR' 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db.select()
      .from(ngoProfiles)
      .where(eq(ngoProfiles.id, parseInt(id)))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ 
        error: 'NGO profile not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    const body = await request.json();
    const { ngoName, description, contactEmail, contactPhone, websiteUrl, logoUrl, approved } = body;

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    if (ngoName !== undefined) {
      if (!ngoName.trim()) {
        return NextResponse.json({ 
          error: 'NGO name cannot be empty',
          code: 'INVALID_NGO_NAME' 
        }, { status: 400 });
      }
      updates.ngoName = ngoName.trim();
    }

    if (description !== undefined) {
      updates.description = description ? description.trim() : null;
    }

    if (contactEmail !== undefined) {
      if (!contactEmail.trim()) {
        return NextResponse.json({ 
          error: 'Contact email cannot be empty',
          code: 'INVALID_CONTACT_EMAIL' 
        }, { status: 400 });
      }
      if (!isValidEmail(contactEmail)) {
        return NextResponse.json({ 
          error: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT' 
        }, { status: 400 });
      }
      updates.contactEmail = contactEmail.trim().toLowerCase();
    }

    if (contactPhone !== undefined) {
      updates.contactPhone = contactPhone ? contactPhone.trim() : null;
    }

    if (websiteUrl !== undefined) {
      updates.websiteUrl = websiteUrl ? websiteUrl.trim() : null;
    }

    if (logoUrl !== undefined) {
      updates.logoUrl = logoUrl ? logoUrl.trim() : null;
    }

    if (approved !== undefined) {
      if (typeof approved !== 'boolean') {
        return NextResponse.json({ 
          error: 'Approved must be a boolean',
          code: 'INVALID_APPROVED_VALUE' 
        }, { status: 400 });
      }
      updates.approved = approved;
    }

    // Update the profile
    const updatedProfile = await db.update(ngoProfiles)
      .set(updates)
      .where(eq(ngoProfiles.id, parseInt(id)))
      .returning();

    return NextResponse.json(updatedProfile[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'SERVER_ERROR' 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Validate ID parameter
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID' 
      }, { status: 400 });
    }

    // Check if profile exists
    const existingProfile = await db.select()
      .from(ngoProfiles)
      .where(eq(ngoProfiles.id, parseInt(id)))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ 
        error: 'NGO profile not found',
        code: 'NOT_FOUND' 
      }, { status: 404 });
    }

    // Delete the profile
    const deleted = await db.delete(ngoProfiles)
      .where(eq(ngoProfiles.id, parseInt(id)))
      .returning();

    return NextResponse.json({ 
      message: 'NGO profile deleted successfully',
      id: deleted[0].id,
      profile: deleted[0]
    }, { status: 200 });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message,
      code: 'SERVER_ERROR' 
    }, { status: 500 });
  }
}