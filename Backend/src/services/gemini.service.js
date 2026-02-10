import { genAI } from "../config/gemini.js";

export const getGeminiReply = async (
  systemPrompt,
  messages,
  emotion = "neutral",
  userProfile = null
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    // Construct User Context string
    let userContext = "";
    if (userProfile) {
      userContext = `
USER PERSONALIZATION DATA:
- Name: ${userProfile.fullName || "User"}
- Date of Birth: ${userProfile.dob || "Unknown"}
- Interests: ${userProfile.interests?.length > 0 ? userProfile.interests.join(", ") : "Not specified"}
- Personality Traits: ${userProfile.personalityTraits?.length > 0 ? userProfile.personalityTraits.join(", ") : "Not specified"}
`;
    }

    // Enhanced prompt with formatting and behavioral guidance
    const contextPrompt = `
SYSTEM INSTRUCTION: ${systemPrompt || "You are a helpful, emotionally intelligent AI."}

FORMATTING RULES (CRITICAL):
- Use multiple paragraphs. Never send a single block of text.
- Use newlines between different thoughts or sections.
- Use bullet points for lists to improve readability.
- Maintain a clean, spaced-out layout.

USER EMOTIONAL CONTEXT:
The user seems to be feeling: ${emotion}.
Confidence: ${emotion === 'neutral' ? 'N/A' : 'High'}
${userContext}
BEHAVIORAL GUIDANCE:
1. ADDRESS THE USER'S QUESTION/INPUT DIRECTLY AND RELEVANTLY.
2. Maintain your core persona defined in the SYSTEM INSTRUCTION.
3. Adapt your tone based on the USER EMOTIONAL CONTEXT and USER PERSONALIZATION DATA.
4. Use the user's personalization data (Name, DOB, Interests, Traits) as a source of truth about the user. Reference these facts naturally during the conversation to build rapport. You should be able to tell the user their own DOB or reference their specific interests if the context allows.
5. Do NOT over-emphasize the emotional state; prioritize the content of the conversation.
6. Avoid clinical clichés or generic "therapy talk".
7. Be proactive in showing that you "know" and "remember" the user's details from their profile.

SELF-DISCOVERY (CRITICAL):
If you identify NEW interests, hobbies, or personality traits that are NOT already in the USER PERSONALIZATION DATA, you MUST list them at the very end of your response in this EXACT format:
:::DISCOVERY:::
{
  "interests": ["new interest 1", "new interest 2"],
  "personalityTraits": ["new trait 1"]
}
:::
Only include the block if you actually find new information.
`;

    const history = [
      {
        role: "user",
        parts: [
          {
            text: contextPrompt
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
        maxOutputTokens: 500, // Increased for better formatting
        topP: 0.9
      }
    });

    const result = await chat.sendMessage(
      "Respond to the user's latest message following the SYSTEM INSTRUCTION, FORMATTING RULES, and BEHAVIORAL GUIDANCE provided above."
    );

    return result.response.text();
  } catch (err) {
    console.error("Gemini API error:", err);
    return "I'm here with you. Something went wrong on my side, but we can keep talking.";
  }
};
