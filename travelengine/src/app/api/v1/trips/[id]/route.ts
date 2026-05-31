import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { updateTripSchema } from "@/lib/validators";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await requireAuth(request);
    const { id } = await params;

    // Fetch trip with itinerary, activities, budget and items using Drizzle relational query
    const tripDetail = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.userId, authUser.userId)),
      with: {
        itineraryDays: {
          orderBy: (days, { asc }) => [asc(days.dayNumber)],
          with: {
            activities: {
              orderBy: (act, { asc }) => [asc(act.orderIndex)],
            },
          },
        },
        budget: {
          with: {
            items: true,
          },
        },
      },
    });

    if (!tripDetail) {
      return NextResponse.json(
        { error: "Not Found", message: "Trip not found or does not belong to user" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: tripDetail });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /trips/[id] error:", error);
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
    const { id } = await params;
    const body = await request.json();

    const result = updateTripSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    // Verify ownership
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.userId, authUser.userId)),
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Not Found", message: "Trip not found or unauthorized" },
        { status: 404 }
      );
    }

    // Prepare update parameters
    const updateFields: Record<string, any> = {};
    if (body.title !== undefined) updateFields.title = body.title;
    if (body.status !== undefined) updateFields.status = body.status;
    if (body.destination !== undefined) updateFields.destination = body.destination;
    if (body.startDate !== undefined) updateFields.startDate = body.startDate;
    if (body.endDate !== undefined) updateFields.endDate = body.endDate;
    if (body.numTravelers !== undefined) updateFields.numTravelers = body.numTravelers;
    if (body.totalBudget !== undefined) updateFields.totalBudget = body.totalBudget ? String(body.totalBudget) : null;
    if (body.currency !== undefined) updateFields.currency = body.currency;
    if (body.origin !== undefined) updateFields.origin = body.origin;

    const [updatedTrip] = await db
      .update(trips)
      .set({ ...updateFields, updatedAt: new Date() })
      .where(eq(trips.id, id))
      .returning();

    return NextResponse.json({ data: updatedTrip });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /trips/[id] error:", error);
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
    const { id } = await params;

    // Verify ownership
    const trip = await db.query.trips.findFirst({
      where: and(eq(trips.id, id), eq(trips.userId, authUser.userId)),
    });

    if (!trip) {
      return NextResponse.json(
        { error: "Not Found", message: "Trip not found or unauthorized" },
        { status: 404 }
      );
    }

    await db.delete(trips).where(eq(trips.id, id));

    return NextResponse.json({ data: { success: true }, message: "Trip deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("DELETE /trips/[id] error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
