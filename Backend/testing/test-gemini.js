import dotenv from "dotenv";
dotenv.config();

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing in .env");
  process.exit(1);
}

console.log("✅ API Key found:", apiKey.substring(0, 10) + "...\n");

const genAI = new GoogleGenerativeAI(apiKey);

// Test different model names
const modelsToTest = [
  "gemini-pro",
  "gemini-1.5-pro",
  "gemini-1.5-flash",
  "gemini-1.0-pro"
];

async function testModel(modelName) {
  console.log(`\n📝 Testing model: ${modelName}`);
  console.log("=".repeat(50));
  
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    const prompt = "Say hello and tell me your model name in one sentence.";
    console.log(`Prompt: "${prompt}"`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("✅ SUCCESS!");
    console.log("Response:", text);
    return true;
  } catch (error) {
    console.log("❌ FAILED");
    console.log("Error:", error.message);
    if (error.status) {
      console.log("Status:", error.status, error.statusText);
    }
    return false;
  }
}

async function listAvailableModels() {
  console.log("\n🔍 Attempting to list available models...");
  console.log("=".repeat(50));
  
  try {
    // Try to list models using the API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    );
    
    if (!response.ok) {
      console.log("❌ Could not list models:", response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log("✅ Available models:");
    
    if (data.models && data.models.length > 0) {
      data.models.forEach((model) => {
        console.log(`  - ${model.name}`);
        if (model.supportedGenerationMethods) {
          console.log(`    Methods: ${model.supportedGenerationMethods.join(", ")}`);
        }
      });
    } else {
      console.log("  No models found in response");
    }
  } catch (error) {
    console.log("❌ Error listing models:", error.message);
  }
}

async function main() {
  console.log("🚀 Gemini API Test Script");
  console.log("=".repeat(50));
  
  // List available models
  await listAvailableModels();
  
  console.log("\n\n🧪 Testing Models");
  console.log("=".repeat(50));
  
  // Test each model
  let workingModel = null;
  for (const modelName of modelsToTest) {
    const success = await testModel(modelName);
    if (success && !workingModel) {
      workingModel = modelName;
    }
  }
  
  console.log("\n\n📊 Summary");
  console.log("=".repeat(50));
  if (workingModel) {
    console.log(`✅ Working model found: ${workingModel}`);
    console.log(`\nUpdate src/services/gemini.service.js to use: "${workingModel}"`);
  } else {
    console.log("❌ No working models found");
    console.log("\nPossible issues:");
    console.log("1. API key may be invalid or expired");
    console.log("2. API key may not have access to these models");
    console.log("3. Network or firewall issues");
    console.log("\nPlease check:");
    console.log("- https://makersuite.google.com/app/apikey");
    console.log("- https://ai.google.dev/");
  }
}

main().catch(console.error);
