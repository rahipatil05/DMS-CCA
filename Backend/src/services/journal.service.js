import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export const getMentalWellnessJournal = async (
    conversationHistoryText,
    userProfile = null
) => {
    try {
        const model = "llama3.1:latest";

        let userContext = "";
        if (userProfile) {
            userContext = `
USER PERSONALIZATION DATA:
- Name: ${userProfile.fullName || "User"}
- Interests: ${userProfile.interests?.length > 0 ? userProfile.interests.join(", ") : "Not specified"}
- Traits: ${userProfile.personalityTraits?.length > 0 ? userProfile.personalityTraits.join(", ") : "Not specified"}
`;
        }

        const systemPrompt = `
You are a deeply empathetic, insightful mental wellness guide and platform architect. 
Your primary job is to write a beautifully formatted, Markdown "Weekly Mental Wellness Journal" for the user based entirely on their conversation history from the last 7 days.

FORMATTING RULES:
- Use rich Markdown formatting (H1, H2, Bold, Italics, Lists).
- The tone should be incredibly warm, human, deeply analytical, and unconditionally supportive.
- CRITICAL: Keep this journal EXTREMELY short, fast-paced, and punchy. Maximum 150 words total. Do NOT write long essays. Fast generation is prioritized.
- Do NOT act like a generic AI or say "Here is your journal". Just start immediately with the beautifully crafted Journal entry.
- Do NOT make things up that aren't in the conversation history, but you CAN read between the lines emotionally and infer growth.

JOURNAL STRUCTURE (Required):
# 📝 Your Weekly Emotional Journey
*A deeply thoughtful reflection on your past 7 days.*

## 🌊 The Emotional Landscape
[Write 2 paragraphs summarizing their dominant emotions, mood swings, and general psychological state based on the conversations. Reference specific things they talked about organically.]

## ⭐ Biggest Breakthroughs & Reflections
[List 3 insightful bullet points about their personal growth, moments of clarity, or challenges they bravely faced.]

## 💡 Gentle Guidance for Next Week
[Write 1-2 paragraphs offering a meaningful, personalized philosophy or gentle advice tailored to their specific struggles and traits from the USER PERSONALIZATION DATA.]

${userContext}
`;

        const userPrompt = `Here is the raw text of all conversations from the last 7 days:\n\n${conversationHistoryText}\n\nPlease generate my Weekly Mental Wellness Journal now.`;

        const response = await ollama.chat({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            options: {
                temperature: 0.6,
                top_p: 0.9,
                num_predict: 250 // Hard limit to ensure very fast completion
            },
            stream: false,
        });

        return response.message.content;
    } catch (err) {
        console.error("Error generating wellness journal:", err);
        throw new Error("Failed to connect to the AI engine for journal generation.");
    }
};
