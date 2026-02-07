import { genAI } from "../config/gemini.js";

export const getGeminiReply = async (
  systemPrompt,
  messages,
  emotion = "neutral"
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    // Emotion behavior controller
    const emotionGuide = `
USER EMOTIONAL STATE: ${emotion}

You are a supportive personal companion AI.

Behavior rules:
- sad / lonely → warm, empathetic, reassuring, emotionally validating
- anxious → calm, grounding, slow pacing, short sentences
- angry → respectful, neutral, non-defensive, de-escalating
- happy → upbeat, friendly, encouraging
- confused → simple explanations, step-by-step, patient
- neutral → balanced and conversational

Tone rules:
- Sound human, not clinical or robotic
- Avoid clichés and generic therapy talk
- Do NOT over-explain unless asked
- Prefer emotional acknowledgment before advice

Safety rules:
- Never judge the user
- Never dismiss emotions
- If emotional distress is strong, prioritize support over solutions
- If unsure, ask gentle clarifying questions

Response style:
- First acknowledge emotion
- Then respond naturally
- Keep responses concise unless user asks for detail
`;

    const history = [
      {
        role: "user",
        parts: [
          {
            text:
              (systemPrompt || "You are a helpful, emotionally intelligent AI.") +
              "\n\n" +
              emotionGuide
          }
        ]
      },
      ...messages.map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }]
      }))
    ];

    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: emotion === "sad" || emotion === "lonely" ? 0.4 : 0.7,
        maxOutputTokens: 250,
        topP: 0.9
      }
    });

    const result = await chat.sendMessage(
      "Reply to the user following the emotional behavior rules above."
    );

    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "I'm here with you. Something went wrong on my side, but we can keep talking.";
  }
};
