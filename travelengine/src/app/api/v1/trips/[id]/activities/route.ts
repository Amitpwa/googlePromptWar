import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activities, itineraryDays, trips } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { createActivitySchema } from "@/lib/validators";
import { eq, and, desc } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id: tripId } = await params;
    const { searchParams } = new URL(request.url);
    const dayId = searchParams.get("dayId");

    if (!dayId) {
      return NextResponse.json({ error: "Bad Request", message: "Missing dayId query parameter" }, { status: 400 });
    }

    // Verify ownership of the trip
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, tripId), eq(trips.userId, authUser.userId)),
    });

    if (!trip) {
      return NextResponse.json({ error: "Unauthorized", message: "Unauthorized or trip not found" }, { status: 401 });
    }

    // Verify the day belongs to this trip
    const day = await db.query.itineraryDays.findFirst({
      where: and(eq(itineraryDays.id, dayId), eq(itineraryDays.tripId, tripId)),
    });

    if (!day) {
      return NextResponse.json({ error: "Bad Request", message: "Day does not belong to this trip" }, { status: 400 });
    }

    const body = await request.json();
    const result = createActivitySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Get maximum orderIndex
    const lastActivity = await db.query.activities.findFirst({
      where: eq(activities.itineraryDayId, dayId),
      orderBy: desc(activities.orderIndex),
    });

    const nextIndex = lastActivity ? lastActivity.orderIndex + 1 : 0;

    const [newActivity] = await db
      .insert(activities)
      .values({
        itineraryDayId: dayId,
        orderIndex: nextIndex,
        type: result.data.type,
        title: result.data.title,
        description: result.data.description ?? null,
        locationName: result.data.locationName ?? null,
        startTime: result.data.startTime ?? null,
        endTime: result.data.endTime ?? null,
        durationMinutes: result.data.durationMinutes ?? null,
        estimatedCost: result.data.estimatedCost ? String(result.data.estimatedCost) : "0",
        notes: result.data.notes ?? "",
        tags: result.data.tags ?? [],
      })
      .returning();

    return NextResponse.json({ data: newActivity }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /activities error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id: tripId } = await params;
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("activityId");

    if (!activityId) {
      return NextResponse.json({ error: "Bad Request", message: "Missing activityId query parameter" }, { status: 400 });
    }

    // Verify activity ownership
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, activityId),
      with: {
        itineraryDay: {
          with: {
            trip: true,
          },
        },
      },
    });

    if (!activity || activity.itineraryDay.trip.userId !== authUser.userId || activity.itineraryDay.tripId !== tripId) {
      return NextResponse.json({ error: "Unauthorized", message: "Unauthorized access to activity" }, { status: 401 });
    }

    const body = await request.json();
    const result = createActivitySchema.partial().safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Prepare fields to update
    const updateFields: Record<string, any> = {};
    if (body.type !== undefined) updateFields.type = body.type;
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.description !== undefined) updateFields.description = body.description;
    if (body.locationName !== undefined) updateFields.locationName = body.locationName;
    if (body.startTime !== undefined) updateFields.startTime = body.startTime;
    if (body.endTime !== undefined) updateFields.endTime = body.endTime;
    if (body.durationMinutes !== undefined) updateFields.durationMinutes = body.durationMinutes;
    if (body.estimatedCost !== undefined) updateFields.estimatedCost = body.estimatedCost ? String(body.estimatedCost) : "0";
    if (body.notes !== undefined) updateFields.notes = body.notes;
    if (body.tags !== undefined) updateFields.tags = body.tags;

    const [updatedActivity] = await db
      .update(activities)
      .set({ ...updateFields, updatedAt: new Date() })
      .where(eq(activities.id, activityId))
      .returning();

    return NextResponse.json({ data: updatedActivity });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /activities error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id: tripId } = await params;
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("activityId");

    if (!activityId) {
      return NextResponse.json({ error: "Bad Request", message: "Missing activityId query parameter" }, { status: 400 });
    }

    // Verify activity ownership
    const activity = await db.query.activities.findFirst({
      where: eq(activities.id, activityId),
      with: {
        itineraryDay: {
          with: {
            trip: true,
          },
        },
      },
    });

    if (!activity || activity.itineraryDay.trip.userId !== authUser.userId || activity.itineraryDay.tripId !== tripId) {
      return NextResponse.json({ error: "Unauthorized", message: "Unauthorized access to activity" }, { status: 401 });
    }

    await db.delete(activities).where(eq(activities.id, activityId));

    return NextResponse.json({ data: { success: true }, message: "Activity deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /activities error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
