// =============================================
// TravelEngine — Core Type Definitions
// =============================================

// User types
export type UserRole = "TRAVELER" | "TRAVEL_AGENT" | "CORPORATE_ADMIN" | "SYSTEM_ADMIN";
export type AuthProvider = "LOCAL" | "GOOGLE" | "FACEBOOK";

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  role: UserRole;
  preferences?: TravelerPreferences | null;
  createdAt: Date;
}

export interface TravelerPreferences {
  travelStyle: string[];
  interests: string[];
  dietary: string[];
  accessibility: string[];
  hotelPref: string;
  transportPref: string[];
  budgetTier: string;
}

export interface SavedDestination {
  id: string;
  destination: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  createdAt: Date;
}

// Trip types
export type TripStatus = "DRAFT" | "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface Trip {
  id: string;
  userId: string;
  title: string;
  status: TripStatus;
  origin?: string;
  destination: string;
  startDate: string;
  endDate: string;
  numTravelers: number;
  totalBudget?: number;
  estimatedCost?: number;
  currency: string;
  aiGenerated: boolean;
  aiPrompt?: string;
  coverImage?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  itinerary?: ItineraryDay[];
  budget?: Budget;
}

// Itinerary types
export type ActivityType =
  | "TRANSPORT"
  | "ACCOMMODATION"
  | "ATTRACTION"
  | "DINING"
  | "ACTIVITY"
  | "SHOPPING"
  | "EVENT"
  | "REST"
  | "OTHER";

export type BookingStatus = "UNBOOKED" | "PENDING" | "BOOKED" | "CANCELLED";

export interface ItineraryDay {
  id: string;
  tripId: string;
  dayNumber: number;
  date: string;
  title?: string;
  summary?: string;
  estimatedCost: number;
  activities: Activity[];
}

export interface Activity {
  id: string;
  itineraryDayId: string;
  orderIndex: number;
  type: ActivityType;
  title: string;
  description?: string;
  locationName?: string;
  locationLat?: number;
  locationLng?: number;
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
  estimatedCost: number;
  currency: string;
  bookingUrl?: string;
  bookingStatus: BookingStatus;
  notes?: string;
  tags: string[];
}

// Budget types
export type BudgetCategory =
  | "FLIGHT"
  | "HOTEL"
  | "TRANSPORT"
  | "FOOD"
  | "ACTIVITY"
  | "SHOPPING"
  | "INSURANCE"
  | "VISA"
  | "OTHER";

export interface Budget {
  id: string;
  tripId: string;
  totalBudget: number;
  spent: number;
  currency: string;
  alertThreshold: number;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  category: BudgetCategory;
  description: string;
  estimatedCost: number;
  actualCost?: number;
  isPaid: boolean;
  activityId?: string;
}

// Travel Intelligence types
export interface DestinationIntelligence {
  destination: string;
  country: string;
  visaInfo: VisaInfo;
  weather: WeatherData[];
  events: LocalEvent[];
  safetyRating?: number;
  currency: string;
  timezone: string;
  language: string;
  tips: string[];
}

export interface VisaInfo {
  required: boolean;
  type?: string;
  duration?: string;
  processingTime?: string;
  cost?: string;
  notes?: string;
}

export interface WeatherData {
  date: string;
  tempHigh: number;
  tempLow: number;
  condition: string;
  precipitation: number;
  humidity: number;
  icon: string;
}

export interface LocalEvent {
  name: string;
  date: string;
  type: string;
  description: string;
  location?: string;
}

// Travel Wallet types
export type DocumentType =
  | "BOOKING"
  | "TICKET"
  | "HOTEL_RESERVATION"
  | "PASSPORT"
  | "VISA"
  | "INSURANCE"
  | "OTHER";

export interface TravelDocument {
  id: string;
  userId: string;
  tripId?: string;
  type: DocumentType;
  title: string;
  referenceNumber?: string;
  provider?: string;
  fileUrl?: string;
  fileType?: string;
  validFrom?: string;
  validUntil?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

// Chat types
export interface ChatMessage {
  id: string;
  userId: string;
  role: "user" | "assistant";
  content: string;
  actions?: ChatAction[];
  createdAt: Date;
}

export interface ChatAction {
  type: "TRIP_CREATED" | "TRIP_MODIFIED" | "SUGGESTION" | "LINK";
  label: string;
  tripId?: string;
  url?: string;
}

// AI Trip Generation
export interface TripGenerationInput {
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  currency?: string;
  numTravelers: number;
  interests: string[];
  hotelPreference?: string;
  transportPreference?: string[];
  additionalNotes?: string;
}

export interface AIItineraryResponse {
  title: string;
  summary: string;
  estimatedCost: number;
  days: {
    dayNumber: number;
    date: string;
    title: string;
    summary: string;
    estimatedCost: number;
    activities: {
      type: ActivityType;
      title: string;
      description: string;
      locationName: string;
      startTime: string;
      endTime: string;
      durationMinutes: number;
      estimatedCost: number;
      tips?: string;
      tags: string[];
    }[];
  }[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  statusCode: number;
  error: string;
  message: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
