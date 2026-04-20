import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const GROQ_MODEL = "llama-3.1-8b-instant";

export const enhancePrompt = async (prompt) => {
    try {

        const instruction = `
You are an expert AI Prompt Engineer. Your task is to rewrite the given AI system prompt to be more detailed, professional, and effective.

REWRITING RULES:
1. Maintain the original core purpose and persona of the prompt.
2. Add specific behavioral guidelines and tone instructions.
3. Use clear, structured language.
4. If the input is very short (1-5 words), expand it into a comprehensive 3-5 sentence persona.
5. Do NOT include any introductory or concluding text like "Here is the enhanced prompt:". ONLY return the enhanced prompt text itself.
6. The resulting prompt should be ready to use in a system instruction field.

INPUT PROMPT:
"${prompt}"

ENHANCED PROMPT:
`;

        const response = await groq.chat.completions.create({
            model: GROQ_MODEL,
            messages: [{ role: 'user', content: instruction }],
            temperature: 0.7,
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
