import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  numeric,
  integer,
  boolean,
  jsonb,
  date,
  time,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// =============================================
// Users
// =============================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  role: varchar("role", { length: 20 }).default("TRAVELER").notNull(),
  authProvider: varchar("auth_provider", { length: 20 }).default("LOCAL"),
  authProviderId: varchar("auth_provider_id", { length: 255 }),
  emailVerified: boolean("email_verified").default(false),
  isActive: boolean("is_active").default(true),
  preferences: jsonb("preferences").default({}),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  trips: many(trips),
  savedDestinations: many(savedDestinations),
  travelDocuments: many(travelDocuments),
  chatMessages: many(chatMessages),
}));

// =============================================
// Saved Destinations (Wishlist)
// =============================================

export const savedDestinations = pgTable("saved_destinations", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  destination: varchar("destination", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  notes: text("notes"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const savedDestinationsRelations = relations(savedDestinations, ({ one }) => ({
  user: one(users, {
    fields: [savedDestinations.userId],
    references: [users.id],
  }),
}));

// =============================================
// Trips
// =============================================

export const trips = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).default("DRAFT").notNull(),
  origin: varchar("origin", { length: 255 }),
  destination: varchar("destination", { length: 255 }).notNull(),
  originLat: numeric("origin_lat", { precision: 10, scale: 7 }),
  originLng: numeric("origin_lng", { precision: 10, scale: 7 }),
  destLat: numeric("dest_lat", { precision: 10, scale: 7 }),
  destLng: numeric("dest_lng", { precision: 10, scale: 7 }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  numTravelers: integer("num_travelers").default(1),
  totalBudget: numeric("total_budget", { precision: 12, scale: 2 }),
  estimatedCost: numeric("estimated_cost", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 3 }).default("USD"),
  aiGenerated: boolean("ai_generated").default(false),
  aiPrompt: text("ai_prompt"),
  coverImage: text("cover_image"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const tripsRelations = relations(trips, ({ one, many }) => ({
  user: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  itineraryDays: many(itineraryDays),
  budget: one(budgets),
  documents: many(travelDocuments),
}));

// =============================================
// Itinerary Days
// =============================================

export const itineraryDays = pgTable("itinerary_days", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  dayNumber: integer("day_number").notNull(),
  date: date("date").notNull(),
  title: varchar("title", { length: 255 }),
  summary: text("summary"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const itineraryDaysRelations = relations(itineraryDays, ({ one, many }) => ({
  trip: one(trips, {
    fields: [itineraryDays.tripId],
    references: [trips.id],
  }),
  activities: many(activities),
}));

// =============================================
// Activities
// =============================================

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  itineraryDayId: uuid("itinerary_day_id")
    .references(() => itineraryDays.id, { onDelete: "cascade" })
    .notNull(),
  orderIndex: integer("order_index").notNull(),
  type: varchar("type", { length: 30 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  locationName: varchar("location_name", { length: 255 }),
  locationLat: numeric("location_lat", { precision: 10, scale: 7 }),
  locationLng: numeric("location_lng", { precision: 10, scale: 7 }),
  startTime: time("start_time"),
  endTime: time("end_time"),
  durationMinutes: integer("duration_minutes"),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  bookingUrl: text("booking_url"),
  bookingStatus: varchar("booking_status", { length: 20 }).default("UNBOOKED"),
  notes: text("notes"),
  tags: jsonb("tags").default([]),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  itineraryDay: one(itineraryDays, {
    fields: [activities.itineraryDayId],
    references: [itineraryDays.id],
  }),
}));

// =============================================
// Budgets
// =============================================

export const budgets = pgTable("budgets", {
  id: uuid("id").defaultRandom().primaryKey(),
  tripId: uuid("trip_id")
    .references(() => trips.id, { onDelete: "cascade" })
    .notNull(),
  totalBudget: numeric("total_budget", { precision: 12, scale: 2 }).notNull(),
  spent: numeric("spent", { precision: 12, scale: 2 }).default("0"),
  currency: varchar("currency", { length: 3 }).default("USD"),
  alertThreshold: numeric("alert_threshold", { precision: 5, scale: 2 }).default("80"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const budgetsRelations = relations(budgets, ({ one, many }) => ({
  trip: one(trips, {
    fields: [budgets.tripId],
    references: [trips.id],
  }),
  items: many(budgetItems),
}));

// =============================================
// Budget Items
// =============================================

export const budgetItems = pgTable("budget_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  budgetId: uuid("budget_id")
    .references(() => budgets.id, { onDelete: "cascade" })
    .notNull(),
  category: varchar("category", { length: 30 }).notNull(),
  description: varchar("description", { length: 255 }).notNull(),
  estimatedCost: numeric("estimated_cost", { precision: 10, scale: 2 }).notNull(),
  actualCost: numeric("actual_cost", { precision: 10, scale: 2 }),
  isPaid: boolean("is_paid").default(false),
  activityId: uuid("activity_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const budgetItemsRelations = relations(budgetItems, ({ one }) => ({
  budget: one(budgets, {
    fields: [budgetItems.budgetId],
    references: [budgets.id],
  }),
}));

// =============================================
// Travel Documents (Wallet)
// =============================================

export const travelDocuments = pgTable("travel_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tripId: uuid("trip_id").references(() => trips.id, { onDelete: "set null" }),
  type: varchar("type", { length: 30 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  referenceNumber: varchar("reference_number", { length: 100 }),
  provider: varchar("provider", { length: 255 }),
  fileUrl: text("file_url"),
  fileType: varchar("file_type", { length: 10 }),
  validFrom: date("valid_from"),
  validUntil: date("valid_until"),
  encryptedData: text("encrypted_data"), // AES-256 encrypted JSON
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const travelDocumentsRelations = relations(travelDocuments, ({ one }) => ({
  user: one(users, {
    fields: [travelDocuments.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [travelDocuments.tripId],
    references: [trips.id],
  }),
}));

// =============================================
// Chat Messages
// =============================================

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'user' | 'assistant'
  content: text("content").notNull(),
  actions: jsonb("actions").default([]),
  tripContext: uuid("trip_context"), // optional trip being discussed
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  user: one(users, {
    fields: [chatMessages.userId],
    references: [users.id],
  }),
}));

// =============================================
// Destination Intelligence Cache
// =============================================

export const destinationIntelligence = pgTable("destination_intelligence", {
  id: uuid("id").defaultRandom().primaryKey(),
  destination: varchar("destination", { length: 255 }).notNull(),
  country: varchar("country", { length: 100 }).notNull(),
  countryCode: varchar("country_code", { length: 2 }),
  visaInfo: jsonb("visa_info").default({}),
  weatherData: jsonb("weather_data").default({}),
  localEvents: jsonb("local_events").default([]),
  safetyRating: numeric("safety_rating", { precision: 3, scale: 1 }),
  currencyCode: varchar("currency_code", { length: 3 }),
  timezone: varchar("timezone", { length: 50 }),
  language: varchar("language", { length: 50 }),
  tips: jsonb("tips").default([]),
  fetchedAt: timestamp("fetched_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});
