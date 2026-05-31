import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { trips, itineraryDays, activities, budgets, budgetItems } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/middleware";
import { aiGenerateSchema } from "@/lib/validators";
import { buildTripPlannerPrompt, TRIP_ITINERARY_SCHEMA } from "@/lib/ai/prompts";
import { generateStructuredOutput } from "@/lib/ai/openai";
import type { AIItineraryResponse } from "@/types";
import { eq } from "drizzle-orm";

function mapActivityTypeToBudgetCategory(type: string): "FLIGHT" | "HOTEL" | "TRANSPORT" | "FOOD" | "ACTIVITY" | "SHOPPING" | "INSURANCE" | "VISA" | "OTHER" {
  switch (type) {
    case "TRANSPORT":
      return "TRANSPORT";
    case "ACCOMMODATION":
      return "HOTEL";
    case "DINING":
      return "FOOD";
    case "SHOPPING":
      return "SHOPPING";
    case "REST":
      return "FOOD";
    default:
      return "ACTIVITY";
  }
}

function generateMockItinerary(input: {
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
}): AIItineraryResponse {
  const daysCount = Math.ceil(
    (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1;

  const mockDays = [];
  const interestLabel = input.interests.slice(0, 2).join(" & ");

  for (let i = 1; i <= daysCount; i++) {
    const dayDate = new Date(new Date(input.startDate).getTime() + (i - 1) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    mockDays.push({
      dayNumber: i,
      date: dayDate,
      title: `${interestLabel} Adventures - Day ${i}`,
      summary: `A curated mix of ${interestLabel} activities and sightseeing in ${input.destination}.`,
      estimatedCost: 160,
      activities: [
        {
          type: "TRANSPORT" as const,
          title: `Transit to ${input.destination} center`,
          description: "Take the primary express route to the city center and check-in.",
          locationName: `${input.destination} Terminal`,
          startTime: "09:00",
          endTime: "10:00",
          durationMinutes: 60,
          estimatedCost: 20,
          tips: "Pre-buy tickets on the app for direct boarding.",
          tags: ["transit", "commute"]
        },
        {
          type: "ACCOMMODATION" as const,
          title: `Checking in at Central Cozy Stay`,
          description: `Comfortable stay close to transit lines and popular attractions.`,
          locationName: `${input.destination} Boutique Lodging`,
          startTime: "10:30",
          endTime: "11:00",
          durationMinutes: 30,
          estimatedCost: 0,
          tips: "Verify if early check-in is available or drop your bags.",
          tags: ["lodging", "hotel"]
        },
        {
          type: "DINING" as const,
          title: "Lunch: Landmark Local Flavors",
          description: "Savor highly recommended native dishes from standard local restaurants.",
          locationName: "Local Culinary House",
          startTime: "12:00",
          endTime: "13:00",
          durationMinutes: 60,
          estimatedCost: 30,
          tips: "Order the highly recommended chef's choice special.",
          tags: ["food", "lunch"]
        },
        {
          type: "ATTRACTION" as const,
          title: `Exploring top ${interestLabel} landmarks`,
          description: "Immersive self-guided tour of scenic places.",
          locationName: "Central Arts & Historical District",
          startTime: "13:30",
          endTime: "16:30",
          durationMinutes: 180,
          estimatedCost: 40,
          tips: "Pre-book online tickets to save up to 15%.",
          tags: ["sightseeing", "culture"]
        },
        {
          type: "REST" as const,
          title: "Afternoon Coffee & local tea service",
          description: "Sit back and relax in a picturesque local garden cafe.",
          locationName: "Nature Garden Cafe",
          startTime: "17:00",
          endTime: "18:00",
          durationMinutes: 60,
          estimatedCost: 15,
          tips: "Try the signature matcha latte or pour-over coffee.",
          tags: ["cafe", "rest"]
        },
        {
          type: "DINING" as const,
          title: "Dinner: Signature Gourmet Dining",
          description: "Top culinary delight for an awesome trip experience.",
          locationName: "Epicurean Bistro",
          startTime: "19:00",
          endTime: "21:00",
          durationMinutes: 120,
          estimatedCost: 55,
          tips: "Pre-book a window table for beautiful night views.",
          tags: ["food", "dinner"]
        }
      ]
    });
  }

  return {
    title: `Sensational Trip to ${input.destination}`,
    summary: `A dynamically optimized ${daysCount}-day itinerary for ${input.destination} featuring custom tailored experiences around ${input.interests.join(", ")}.`,
    estimatedCost: daysCount * 160,
    days: mockDays
  };
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const body = await request.json();
    const result = aiGenerateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation Error", message: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const inputData = result.data;
    let aiItinerary: AIItineraryResponse;

    if (process.env.OPENAI_API_KEY) {
      try {
        const prompt = buildTripPlannerPrompt(inputData);
        aiItinerary = await generateStructuredOutput<AIItineraryResponse>(
          [
            {
              role: "system",
              content: "You are an expert travel assistant. Generate JSON following the exact schema.",
            },
            { role: "user", content: prompt },
          ],
          TRIP_ITINERARY_SCHEMA
        );
      } catch (aiError) {
        console.warn("OpenAI API call failed, falling back to mock generation:", aiError);
        aiItinerary = generateMockItinerary(inputData);
      }
    } else {
      console.log("No OPENAI_API_KEY set, utilizing dynamic mock generator");
      aiItinerary = generateMockItinerary(inputData);
    }

    // Begin database inserts transactionally or sequentially
    const [newTrip] = await db
      .insert(trips)
      .values({
        userId: authUser.userId,
        title: aiItinerary.title,
        status: "PLANNED",
        origin: inputData.origin,
        destination: inputData.destination,
        startDate: inputData.startDate,
        endDate: inputData.endDate,
        numTravelers: inputData.numTravelers,
        totalBudget: String(inputData.budget),
        estimatedCost: String(aiItinerary.estimatedCost),
        currency: inputData.currency ?? "USD",
        aiGenerated: true,
        aiPrompt: JSON.stringify(inputData),
      })
      .returning();

    // Insert Days and Activities
    for (const day of aiItinerary.days) {
      const [newDay] = await db
        .insert(itineraryDays)
        .values({
          tripId: newTrip.id,
          dayNumber: day.dayNumber,
          date: day.date,
          title: day.title,
          summary: day.summary,
          estimatedCost: String(day.estimatedCost),
        })
        .returning();

      if (day.activities && day.activities.length > 0) {
        let orderIndex = 0;
        for (const act of day.activities) {
          await db.insert(activities).values({
            itineraryDayId: newDay.id,
            orderIndex: orderIndex++,
            type: act.type,
            title: act.title,
            description: act.description,
            locationName: act.locationName,
            startTime: act.startTime,
            endTime: act.endTime,
            durationMinutes: act.durationMinutes,
            estimatedCost: String(act.estimatedCost),
            bookingStatus: "UNBOOKED",
            notes: act.tips ?? "",
            tags: act.tags ?? [],
          });
        }
      }
    }

    // Insert Budget
    const [newBudget] = await db
      .insert(budgets)
      .values({
        tripId: newTrip.id,
        totalBudget: String(inputData.budget),
        spent: "0",
        currency: inputData.currency ?? "USD",
        alertThreshold: "80",
      })
      .returning();

    // Create budget items from activities
    for (const day of aiItinerary.days) {
      if (day.activities) {
        for (const act of day.activities) {
          if (act.estimatedCost > 0) {
            await db.insert(budgetItems).values({
              budgetId: newBudget.id,
              category: mapActivityTypeToBudgetCategory(act.type),
              description: act.title,
              estimatedCost: String(act.estimatedCost),
              actualCost: "0",
              isPaid: false,
            });
          }
        }
      }
    }

    // Query full trip with nested info to return
    const completeTrip = await db.query.trips.findFirst({
      where: eq(trips.id, newTrip.id),
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

    return NextResponse.json({ data: completeTrip }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("AI Generate trip error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: error.message },
      { status: 500 }
    );
  }
}
