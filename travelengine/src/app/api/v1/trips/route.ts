import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trips } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { createTripSchema } from "@/lib/validators";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const userTrips = await db.query.trips.findMany({
      where: eq(trips.userId, authUser.userId),
      orderBy: desc(trips.createdAt),
    });

    return NextResponse.json({ data: userTrips });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /trips error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();
    const result = createTripSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const {
      title,
      destination,
      startDate,
      endDate,
      numTravelers,
      totalBudget,
      currency,
      origin,
    } = result.data;

    const [newTrip] = await db
      .insert(trips)
      .values({
        userId: authUser.userId,
        title,
        status: "DRAFT",
        destination,
        startDate,
        endDate,
        numTravelers: numTravelers ?? 1,
        totalBudget: totalBudget ? String(totalBudget) : null,
        currency: currency ?? "USD",
        origin: origin ?? null,
        aiGenerated: false,
      })
      .returning();

    return NextResponse.json({ data: newTrip }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("POST /trips error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
