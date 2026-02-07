// Test Chat Flow with Real AI Response
const baseUrl = "http://localhost:5000";
const testEmail = `chattest_${Math.random().toString(36).substring(7)}@example.com`;

console.log("\n🚀 Testing Complete Chat Flow with Gemini AI");
console.log("=".repeat(60));

async function makeRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  
  // Extract JWT cookie if present
  const cookies = response.headers.get('set-cookie');
  let token = null;
  if (cookies) {
    const match = cookies.match(/jwt=([^;]+)/);
    if (match) token = match[1];
  }
  
  return { data, token, status: response.status };
}

async function testChatFlow() {
  try {
    // 1. Signup
    console.log("\n1️⃣  Creating test user...");
    const signupResult = await makeRequest(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Chat Test User",
        email: testEmail,
        password: "password123"
      })
    });
    
    if (!signupResult.token) {
      console.log("❌ Failed to create user");
      return;
    }
    
    console.log("✅ User created successfully");
    console.log(`   Token: ${signupResult.token.substring(0, 20)}...`);
    
    const token = signupResult.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    // 2. Create Agent
    console.log("\n2️⃣  Creating AI agent...");
    const agentResult = await makeRequest(`${baseUrl}/api/agents`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: "Friendly Helper",
        prompt: "You are a friendly and helpful AI assistant. Be warm, empathetic, and concise."
      })
    });
    
    console.log(`✅ Agent created: ${agentResult.data.name}`);
    console.log(`   ID: ${agentResult.data._id}`);
    
    const agentId = agentResult.data._id;
    
    // 3. Send test messages
    console.log("\n3️⃣  Testing conversation...");
    
    const testMessages = [
      "Hello! How are you today?",
      "I'm feeling a bit stressed about work.",
      "Thank you for listening!"
    ];
    
    for (const message of testMessages) {
      console.log(`\n📤 User: ${message}`);
      
      const chatResult = await makeRequest(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          agentId
        })
      });
      
      console.log(`🤖 AI: ${chatResult.data.reply}`);
      console.log(`   Emotion: ${chatResult.data.emotion.emotion} (confidence: ${chatResult.data.emotion.confidence})`);
      
      // Wait a bit between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Chat flow test completed successfully!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  }
}

testChatFlow();
