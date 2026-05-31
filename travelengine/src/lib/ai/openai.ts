import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "dummy-key-for-build-and-fallback",
});

export default openai;

export async function* streamChatCompletion(
  messages: OpenAI.ChatCompletionMessageParam[],
  options?: { temperature?: number; maxTokens?: number }
) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens ?? 4096,
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      yield content;
    }
  }
}

export async function generateStructuredOutput<T>(
  messages: OpenAI.ChatCompletionMessageParam[],
  schema: Record<string, unknown>,
  options?: { temperature?: number }
): Promise<T> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: options?.temperature ?? 0.7,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "travel_response",
        strict: true,
        schema: schema as Record<string, unknown>,
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");
  return JSON.parse(content) as T;
}
