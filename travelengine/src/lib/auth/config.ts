import * as jose from "jose";
import bcrypt from "bcryptjs";

const SECRET_STRING = process.env.JWT_SECRET || "super-secret-key-for-travelengine-hackathon-2026";
const JWT_SECRET = new TextEncoder().encode(SECRET_STRING);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function generateToken(payload: { userId: string; email: string; role: string }): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<{ userId: string; email: string; role: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string; role: string };
  } catch (error) {
    return null;
  }
}
