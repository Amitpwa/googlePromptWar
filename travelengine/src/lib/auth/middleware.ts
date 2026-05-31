import { NextRequest } from "next/server";
import { verifyToken } from "./config";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: string;
}

export async function getAuthUser(request: NextRequest): Promise<AuthenticatedUser | null> {
  let token: string | null = null;

  // 1. Check Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  }

  // 2. Check cookie
  if (!token) {
    const tokenCookie = request.cookies.get("token");
    if (tokenCookie) {
      token = tokenCookie.value;
    }
  }

  if (!token) {
    return null;
  }

  return verifyToken(token);
}

export async function requireAuth(request: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
