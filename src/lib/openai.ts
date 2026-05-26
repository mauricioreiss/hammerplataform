import OpenAI from "openai"

const apiKey = process.env.OPENAI_API_KEY

export function getOpenAIClient(): OpenAI {
  if (!apiKey || apiKey === "your-openai-api-key-here") {
    throw new Error("OPENAI_API_KEY not configured")
  }
  return new OpenAI({ apiKey })
}

export async function generateCompletion(prompt: string): Promise<string> {
  const client = getOpenAIClient()

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2000,
  })

  return response.choices[0]?.message?.content ?? ""
}
