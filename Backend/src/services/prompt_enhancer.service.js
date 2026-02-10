import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://127.0.0.1:11434' });

export const enhancePrompt = async (prompt) => {
    try {
        const model = "llama3.1:latest";

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

        const response = await ollama.chat({
            model: model,
            messages: [{ role: 'user', content: instruction }],
            options: {
                temperature: 0.7,
            },
            stream: false,
        });

        return response.message.content.trim();
    } catch (error) {
        console.error("❌ Ollama AI Enhancement Error:", {
            message: error.message,
            stack: error.stack,
            promptSnippet: prompt.substring(0, 50) + "..."
        });
        throw new Error(`AI Enhancement Failed: ${error.message}`);
    }
};
