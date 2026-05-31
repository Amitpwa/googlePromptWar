import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const user = await db.query.users.findFirst({
      where: eq(users.id, authUser.userId),
    });

    if (!user) {
      return NextResponse.json({ error: "Not Found", message: "User not found" }, { status: 404 });
    }

    const { passwordHash, ...profile } = user;
    return NextResponse.json({ data: profile });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("GET /me error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();

    // Whitelist parameters to update
    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    if (body.preferences !== undefined) updateData.preferences = body.preferences;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Bad Request", message: "No data to update" }, { status: 400 });
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, authUser.userId))
      .returning();

    const { passwordHash, ...profile } = updatedUser;
    return NextResponse.json({ data: profile });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("PATCH /me error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
