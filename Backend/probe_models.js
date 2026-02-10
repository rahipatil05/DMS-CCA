import { genAI } from "./src/config/gemini.js";

async function probe() {
    const models = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
        "gemini-1.5-flash-latest",
        "gemini-1.5-flash-8b",
        "gemini-2.0-flash-lite-preview-02-05"
    ];

    for (const modelName of models) {
        try {
            console.log(`Probing ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("hi");
            console.log(`✅ ${modelName} is working!`);
            return;
        } catch (error) {
            console.log(`❌ ${modelName} failed: ${error.message}`);
        }
    }
}

probe();
