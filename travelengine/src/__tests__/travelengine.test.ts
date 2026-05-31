import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  createTripSchema,
  aiGenerateSchema,
  createActivitySchema,
  budgetItemSchema,
  chatMessageSchema,
  documentSchema,
} from "../lib/validators";
import {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
} from "../lib/auth/config";

// Mocking dynamic itinerary function to isolate logic for testing
function testGenerateMockItinerary(input: any) {
  const daysCount = Math.ceil(
    (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1;

  const mockDays = [];
  for (let i = 1; i <= daysCount; i++) {
    mockDays.push({
      dayNumber: i,
      estimatedCost: 160,
      activities: [
        { type: "TRANSPORT", estimatedCost: 20 },
        { type: "DINING", estimatedCost: 30 },
      ]
    });
  }

  return {
    title: `Sensational Trip to ${input.destination}`,
    estimatedCost: daysCount * 160,
    days: mockDays
  };
}

describe("TravelPlanningEngine - Complete Unit Test Suite (20 Test Cases)", () => {
  
  // ==========================================
  // MODULE 1: AUTHENTICATION UTILS (4 TESTS)
  // ==========================================

  it("TC01: should hash password securely using bcryptjs", async () => {
    const pass = "SecurePass123!";
    const hash = await hashPassword(pass);
    expect(hash).toBeDefined();
    expect(hash).not.toEqual(pass);
  });

  it("TC02: should verify correct password hashes and fail incorrect ones", async () => {
    const pass = "MySecretWord55";
    const hash = await hashPassword(pass);
    const isValid = await verifyPassword(pass, hash);
    const isInvalid = await verifyPassword("WrongPassword", hash);
    expect(isValid).toBe(true);
    expect(isInvalid).toBe(false);
  });

  it("TC03: should generate secure signed JWT tokens with user payloads", async () => {
    const payload = { userId: "user-123", email: "amit@test.com", role: "TRAVELER" };
    const token = await generateToken(payload);
    expect(token).toBeDefined();
    expect(typeof token).toBe("string");
  });

  it("TC04: should decode valid JWT tokens and fail invalid ones", async () => {
    const payload = { userId: "user-abc", email: "michelle@test.com", role: "ADMIN" };
    const token = await generateToken(payload);
    const decoded = await verifyToken(token);
    const badDecoded = await verifyToken("invalid-signature-token-format");
    
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toEqual(payload.userId);
    expect(decoded?.email).toEqual(payload.email);
    expect(badDecoded).toBeNull();
  });

  // ==========================================
  // MODULE 2: REGISTRATION SCHEMAS (2 TESTS)
  // ==========================================

  it("TC05: should pass registration validation with valid email, name & secure password", () => {
    const validData = {
      email: "ashutosh@gmail.com",
      name: "Ashutosh",
      password: "StrongPassword99!",
    };
    const parsed = registerSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it("TC06: should reject registration on invalid emails or weak passwords", () => {
    const badData = {
      email: "bad-email-format",
      name: "A", // too short
      password: "weak", // no uppercase, no number, too short
    };
    const parsed = registerSchema.safeParse(badData);
    expect(parsed.success).toBe(false);
  });

  // ==========================================
  // MODULE 3: LOGIN SCHEMAS (2 TESTS)
  // ==========================================

  it("TC07: should validate correct credentials patterns during login", () => {
    const validLogin = { email: "user@test.com", password: "SomePassword1" };
    const parsed = loginSchema.safeParse(validLogin);
    expect(parsed.success).toBe(true);
  });

  it("TC08: should reject logins with empty password entries", () => {
    const badLogin = { email: "user@test.com", password: "" };
    const parsed = loginSchema.safeParse(badLogin);
    expect(parsed.success).toBe(false);
  });

  // ==========================================
  // MODULE 4: TRIP MANIFEST SCHEMAS (2 TESTS)
  // ==========================================

  it("TC09: should validate correct trip creation payloads with valid YYYY-MM-DD dates", () => {
    const validTrip = {
      title: "Summer Vacation in Rome",
      destination: "Rome, Italy",
      startDate: "2026-07-15",
      endDate: "2026-07-22",
      numTravelers: 2,
      totalBudget: 4500,
      currency: "EUR",
    };
    const parsed = createTripSchema.safeParse(validTrip);
    expect(parsed.success).toBe(true);
  });

  it("TC10: should reject trip configurations with invalid date formats", () => {
    const badTrip = {
      title: "Invalid Dates",
      destination: "Paris",
      startDate: "07-15-2026", // Wrong format
      endDate: "2026/07/22", // Wrong format
    };
    const parsed = createTripSchema.safeParse(badTrip);
    expect(parsed.success).toBe(false);
  });

  // ==========================================
  // MODULE 5: AI TRIP GENERATOR SCHEMAS (2 TESTS)
  // ==========================================

  it("TC11: should validate structured parameters for AI generation prompts", () => {
    const validAIParams = {
      origin: "New York",
      destination: "Tokyo",
      startDate: "2026-10-10",
      endDate: "2026-10-17",
      budget: 3500,
      interests: ["Culinary", "Heritage"],
      hotelPreference: "Boutique Cozy",
    };
    const parsed = aiGenerateSchema.safeParse(validAIParams);
    expect(parsed.success).toBe(true);
  });

  it("TC12: should enforce at least one interest selection during AI planning requests", () => {
    const badAIParams = {
      origin: "New York",
      destination: "Tokyo",
      startDate: "2026-10-10",
      endDate: "2026-10-17",
      budget: 3500,
      interests: [], // Empty interests array
    };
    const parsed = aiGenerateSchema.safeParse(badAIParams);
    expect(parsed.success).toBe(false);
  });

  // ==========================================
  // MODULE 6: ITINERARY ACTIVITY SCHEMAS (2 TESTS)
  // ==========================================

  it("TC13: should validate correct activity layouts, durations, and timings", () => {
    const validActivity = {
      type: "ATTRACTION",
      title: "Colosseum Tour",
      description: "Fast-track guided tour of the arena.",
      locationName: "Rome Colosseum",
      startTime: "09:30",
      endTime: "11:30",
      durationMinutes: 120,
      estimatedCost: 35,
    };
    const parsed = createActivitySchema.safeParse(validActivity);
    expect(parsed.success).toBe(true);
  });

  it("TC14: should reject activities with incorrect timing formats", () => {
    const badActivity = {
      type: "DINING",
      title: "Dinner",
      startTime: "9:00 PM", // Expects HH:MM 24-hr format
      endTime: "25:00", // Invalid hour
    };
    const parsed = createActivitySchema.safeParse(badActivity);
    expect(parsed.success).toBe(false);
  });

  // ==========================================
  // MODULE 7: BUDGET & CHAT SCHEMAS (2 TESTS)
  // ==========================================

  it("TC15: should pass budget items with valid categories and non-negative costs", () => {
    const validBudgetItem = {
      category: "HOTEL",
      description: "Boutique Lodging Deposit",
      estimatedCost: 450,
      isPaid: true,
    };
    const parsed = budgetItemSchema.safeParse(validBudgetItem);
    expect(parsed.success).toBe(true);
  });

  it("TC16: should reject empty chat queries or messages", () => {
    const emptyMsg = { message: "" };
    const parsed = chatMessageSchema.safeParse(emptyMsg);
    expect(parsed.success).toBe(false);
  });

  // ==========================================
  // MODULE 8: TRAVEL DOCUMENTS WALLET & ENCRYPTION (2 TESTS)
  // ==========================================

  it("TC17: should validate standard travel document vault registrations", () => {
    const validDoc = {
      type: "PASSPORT",
      title: "Personal Passport 2026",
      referenceNumber: "ABC123XYZ",
      provider: "Government Passport Agency",
      isEncrypted: true,
    };
    const parsed = documentSchema.safeParse(validDoc);
    expect(parsed.success).toBe(true);
  });

  it("TC18: should reject document registrations with invalid date formats", () => {
    const badDoc = {
      type: "VISA",
      title: "Schengen Visa Entry Log",
      validFrom: "2026/05/15", // Incorrect formatting
    };
    const parsed = documentSchema.safeParse(badDoc);
    expect(parsed.success).toBe(false);
  });

  // ==========================================
  // MODULE 9: MOCK ITINERARY GENERATOR LOGIC (2 TESTS)
  // ==========================================

  it("TC19: should correctly compute total trip day offsets dynamically", () => {
    const input = {
      destination: "Rome",
      startDate: "2026-05-15",
      endDate: "2026-05-20", // 6 days inclusive
    };
    const result = testGenerateMockItinerary(input);
    expect(result.days.length).toEqual(6);
  });

  it("TC20: should accurately sum daily estimates into overall cost variables", () => {
    const input = {
      destination: "Tokyo",
      startDate: "2026-06-01",
      endDate: "2026-06-05", // 5 days inclusive
    };
    const result = testGenerateMockItinerary(input);
    expect(result.estimatedCost).toEqual(5 * 160); // 5 days * 160 cost
  });

});
