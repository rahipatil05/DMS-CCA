import { genAI } from "./src/config/gemini.js";

async function probe() {
    const modelName = "gemini-2.5-flash-lite";
    try {
        console.log(`Probing ${modelName}...`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("hi");
        console.log(`✅ ${modelName} is working!`);
    } catch (error) {
        console.log(`❌ ${modelName} failed: ${error.message}`);
    }
}

probe();
