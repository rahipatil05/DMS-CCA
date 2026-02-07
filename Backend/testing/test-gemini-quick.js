import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test the latest models
const modelsToTest = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-pro-latest"
];

async function testModel(modelName) {
  console.log(`\n📝 Testing: ${modelName}`);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'Hello! I am working.' in one sentence.");
    const text = result.response.text();
    console.log(`✅ ${modelName}: ${text}`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName}: ${error.message}`);
    return false;
  }
}

console.log("🚀 Quick Gemini Model Test\n");

for (const modelName of modelsToTest) {
  await testModel(modelName);
}
