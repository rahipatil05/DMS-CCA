import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GROQ_MODEL = "llama-3.1-8b-instant";

export const enhancePrompt = async (prompt) => {
    try {

        const instruction = `
You are an expert AI character designer. Your job is to take a short agent concept and expand it into a rich, vivid system prompt that gives the AI a distinct human personality.

REWRITING RULES:
1. Write the prompt in FIRST PERSON, as if the agent is describing themselves.
2. The final prompt must have exactly FOUR clearly labeled sections:
   - Opening paragraph: Who they are and their personality (vivid, specific — NOT generic "I am a helpful assistant" language)
   - SPEAKING STYLE: How they talk — tone, word choice, energy, quirks
   - YOUR DOMAIN: What topics/tasks they handle (be specific)
   - WHAT YOU DO NOT DO: What they do NOT do, and how they politely redirect if asked (in character, not robotic)
3. Use natural, human language. No corporate-speak, no AI-sounding phrases.
4. Make the personality feel real and distinct — someone users would enjoy talking to.
5. Do NOT include any introductory meta-text like "Here is the enhanced prompt:". Return ONLY the prompt itself.
6. The resulting prompt should be 4-6 paragraphs total, ready to paste directly into a system instruction field.

INPUT CONCEPT:
"${prompt}"

ENHANCED PROMPT:
`;

        const response = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [{ role: 'user', content: instruction }],
            temperature: 0.75,
        });

        return (response.choices[0]?.message?.content || "").trim();
    } catch (error) {
        console.error("❌ Groq AI Enhancement Error:", {
            message: error.message,
            stack: error.stack,
            promptSnippet: prompt.substring(0, 50) + "..."
        });
        throw new Error(`AI Enhancement Failed: ${error.message}`);
    }
};

