import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const createTripSchema = z.object({
  title: z.string().min(1, "Title is required"),
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  numTravelers: z.number().int().positive().default(1),
  totalBudget: z.number().positive().optional(),
  currency: z.string().length(3).default("USD"),
  origin: z.string().optional(),
});

export const updateTripSchema = createTripSchema.partial();

export const aiGenerateSchema = z.object({
  origin: z.string().min(1, "Origin is required"),
  destination: z.string().min(1, "Destination is required"),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"),
  budget: z.number().positive("Budget must be a positive number"),
  currency: z.string().length(3).optional(),
  numTravelers: z.number().int().positive().default(1),
  interests: z.array(z.string()).min(1, "Select at least one interest"),
  hotelPreference: z.string().optional(),
  transportPreference: z.array(z.string()).optional(),
  additionalNotes: z.string().optional(),
});

export const createActivitySchema = z.object({
  type: z.enum([
    "TRANSPORT",
    "ACCOMMODATION",
    "ATTRACTION",
    "DINING",
    "ACTIVITY",
    "SHOPPING",
    "EVENT",
    "REST",
  ]),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  locationName: z.string().optional(),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM").optional(),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM").optional(),
  durationMinutes: z.number().int().positive().optional(),
  estimatedCost: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const budgetItemSchema = z.object({
  category: z.enum([
    "FLIGHT",
    "HOTEL",
    "TRANSPORT",
    "FOOD",
    "ACTIVITY",
    "SHOPPING",
    "INSURANCE",
    "VISA",
    "OTHER",
  ]),
  description: z.string().min(1, "Description is required"),
  estimatedCost: z.number().nonnegative("Estimated cost must be non-negative"),
  actualCost: z.number().nonnegative("Actual cost must be non-negative").optional(),
  isPaid: z.boolean().default(false),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  tripId: z.string().uuid().optional(),
});

export const documentSchema = z.object({
  type: z.enum(["PASSPORT", "VISA", "TICKET", "BOOKING", "INSURANCE", "OTHER"]),
  title: z.string().min(1, "Title is required"),
  referenceNumber: z.string().optional(),
  provider: z.string().optional(),
  validFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD").optional(),
  fileData: z.string().optional(), // base64 representation of file for simple storing
  fileName: z.string().optional(),
  isEncrypted: z.boolean().default(false),
});
