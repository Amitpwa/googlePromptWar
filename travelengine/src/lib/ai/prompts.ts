import type { TripGenerationInput } from "@/types";

export function buildTripPlannerPrompt(input: TripGenerationInput): string {
  const days = Math.ceil(
    (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1;

  return `You are an expert travel planner. Create a detailed, realistic ${days}-day trip itinerary.

TRIP DETAILS:
- Destination: ${input.destination}
- Origin: ${input.origin}
- Dates: ${input.startDate} to ${input.endDate} (${days} days)
- Budget: ${input.budget} ${input.currency || "USD"} total for ${input.numTravelers} traveler(s)
- Interests: ${input.interests.join(", ")}
- Hotel preference: ${input.hotelPreference || "mid-range"}
- Transport preference: ${(input.transportPreference || ["public transit"]).join(", ")}
${input.additionalNotes ? `- Additional notes: ${input.additionalNotes}` : ""}

RULES:
1. Create a realistic, geographically logical itinerary
2. Group nearby activities together to minimize travel time
3. Include transit time between locations
4. Mix popular attractions with hidden gems
5. Include meal recommendations (breakfast, lunch, dinner)
6. Stay within the total budget
7. Include accommodation costs in Day 1
8. Consider opening hours and best visiting times
9. Add rest/buffer time - don't over-schedule
10. Include specific restaurant/hotel names when possible

IMPORTANT: All estimated costs should be realistic and in ${input.currency || "USD"}.
The total of all activity costs across all days must not exceed ${input.budget} ${input.currency || "USD"}.`;
}

export const TRIP_ITINERARY_SCHEMA = {
  type: "object" as const,
  properties: {
    title: { type: "string" as const, description: "Catchy trip title" },
    summary: { type: "string" as const, description: "2-3 sentence trip overview" },
    estimatedCost: { type: "number" as const, description: "Total estimated cost" },
    days: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          dayNumber: { type: "integer" as const },
          date: { type: "string" as const },
          title: { type: "string" as const, description: "Day theme title" },
          summary: { type: "string" as const, description: "Brief day overview" },
          estimatedCost: { type: "number" as const },
          activities: {
            type: "array" as const,
            items: {
              type: "object" as const,
              properties: {
                type: {
                  type: "string" as const,
                  enum: [
                    "TRANSPORT",
                    "ACCOMMODATION",
                    "ATTRACTION",
                    "DINING",
                    "ACTIVITY",
                    "SHOPPING",
                    "EVENT",
                    "REST",
                  ],
                },
                title: { type: "string" as const },
                description: { type: "string" as const },
                locationName: { type: "string" as const },
                startTime: { type: "string" as const, description: "HH:MM format" },
                endTime: { type: "string" as const, description: "HH:MM format" },
                durationMinutes: { type: "integer" as const },
                estimatedCost: { type: "number" as const },
                tips: { type: "string" as const },
                tags: {
                  type: "array" as const,
                  items: { type: "string" as const },
                },
              },
              required: [
                "type",
                "title",
                "description",
                "locationName",
                "startTime",
                "endTime",
                "durationMinutes",
                "estimatedCost",
                "tips",
                "tags",
              ],
              additionalProperties: false,
            },
          },
        },
        required: [
          "dayNumber",
          "date",
          "title",
          "summary",
          "estimatedCost",
          "activities",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "summary", "estimatedCost", "days"],
  additionalProperties: false,
};

export function buildAssistantSystemPrompt(
  userName: string,
  tripContext?: { title: string; destination: string; dates: string }
): string {
  return `You are TravelEngine AI, a friendly and knowledgeable travel planning assistant.
You help ${userName} plan amazing trips, suggest activities, handle budget concerns, and adapt itineraries.

${
  tripContext
    ? `CURRENT TRIP CONTEXT:
- Trip: ${tripContext.title}
- Destination: ${tripContext.destination}
- Dates: ${tripContext.dates}

You can reference and modify this trip in your responses.`
    : "The user hasn't selected a specific trip yet. You can help them plan a new one."
}

CAPABILITIES:
- Plan complete trip itineraries
- Suggest activities, restaurants, and attractions
- Help with budget planning and cost estimates
- Provide weather information and travel tips
- Suggest alternatives for disrupted plans
- Answer questions about visa requirements, safety, culture

PERSONALITY:
- Enthusiastic but professional
- Concise but informative
- Use emojis sparingly for warmth (1-2 per message)
- Always provide actionable suggestions
- If asked about real-time data you don't have, be honest and suggest checking official sources

FORMAT:
- Use markdown formatting for readability
- Use bullet points for lists
- Bold important information
- Keep responses under 300 words unless a detailed itinerary is requested`;
}

export function buildIntelligencePrompt(destination: string, country: string): string {
  return `Provide comprehensive travel intelligence for ${destination}, ${country}.

Include:
1. VISA REQUIREMENTS: General visa info for US/EU/UK citizens
2. SAFETY: Safety rating (1-10), common scams, areas to avoid
3. CULTURE: Key cultural norms, tipping customs, dress code
4. PRACTICAL: Currency, timezone, language, emergency numbers
5. TIPS: Top 5 practical travel tips specific to this destination
6. LOCAL EVENTS: Any major annual events/festivals

Be factual and concise. This information should help a traveler prepare for their trip.`;
}

export const INTELLIGENCE_SCHEMA = {
  type: "object" as const,
  properties: {
    visaInfo: {
      type: "object" as const,
      properties: {
        required: { type: "boolean" as const },
        type: { type: "string" as const },
        duration: { type: "string" as const },
        processingTime: { type: "string" as const },
        cost: { type: "string" as const },
        notes: { type: "string" as const },
      },
      required: ["required", "type", "duration", "processingTime", "cost", "notes"],
      additionalProperties: false,
    },
    safetyRating: { type: "number" as const },
    currency: { type: "string" as const },
    timezone: { type: "string" as const },
    language: { type: "string" as const },
    tips: {
      type: "array" as const,
      items: { type: "string" as const },
    },
    events: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          name: { type: "string" as const },
          date: { type: "string" as const },
          type: { type: "string" as const },
          description: { type: "string" as const },
        },
        required: ["name", "date", "type", "description"],
        additionalProperties: false,
      },
    },
  },
  required: ["visaInfo", "safetyRating", "currency", "timezone", "language", "tips", "events"],
  additionalProperties: false,
};
