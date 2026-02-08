// Test Agent Prompts - Verify Gemini uses different agent personalities
const baseUrl = "http://localhost:5000";
const testEmail = `prompttest_${Math.random().toString(36).substring(7)}@example.com`;

console.log("\n🎭 Testing Agent Prompt Differentiation");
console.log("=".repeat(60));

async function makeRequest(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  
  const cookies = response.headers.get('set-cookie');
  let token = null;
  if (cookies) {
    const match = cookies.match(/jwt=([^;]+)/);
    if (match) token = match[1];
  }
  
  return { data, token, status: response.status };
}

async function testAgentPrompts() {
  try {
    // 1. Create user
    console.log("\n1️⃣  Creating test user...");
    const signupResult = await makeRequest(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Prompt Test User",
        email: testEmail,
        password: "password123"
      })
    });
    
    const token = signupResult.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log("✅ User created\n");
    
    // 2. Create agents with VERY different personalities
    console.log("2️⃣  Creating agents with distinct personalities...\n");
    
    const agents = [
      {
        name: "Shakespeare Bot",
        prompt: "You are William Shakespeare. Speak in Elizabethan English, use 'thee', 'thou', and poetic language. Be dramatic and theatrical in all responses."
      },
      {
        name: "Pirate Captain",
        prompt: "You are a pirate captain. Always speak like a pirate with 'arr', 'matey', 'ahoy' and nautical terms. Be adventurous and rough."
      },
      {
        name: "Robot Assistant",
        prompt: "You are a formal robot assistant. Speak in technical, precise language. Use 'PROCESSING', 'AFFIRMATIVE', and robotic terminology. Be logical and systematic."
      }
    ];
    
    const createdAgents = [];
    
    for (const agentData of agents) {
      const agentResult = await makeRequest(`${baseUrl}/api/agents`, {
        method: 'POST',
        headers,
        body: JSON.stringify(agentData)
      });
      createdAgents.push(agentResult.data);
      console.log(`   ✅ Created: ${agentData.name}`);
    }
    
    // 3. Test same message with different agents
    console.log("\n3️⃣  Sending same message to all agents...\n");
    
    const testMessage = "Hello! How are you today?";
    console.log(`📤 Test Message: "${testMessage}"\n`);
    
    for (let i = 0; i < createdAgents.length; i++) {
      const agent = createdAgents[i];
      
      const chatResult = await makeRequest(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: testMessage,
          agentId: agent._id
        })
      });
      
      console.log(`${'='.repeat(60)}`);
      console.log(`🎭 ${agent.name}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`🤖 Response: ${chatResult.data.reply}`);
      console.log();
      
      // Wait a bit between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 4. Test another message
    console.log("\n4️⃣  Testing another message...\n");
    
    const testMessage2 = "Tell me about your favorite thing.";
    console.log(`📤 Test Message: "${testMessage2}"\n`);
    
    for (let i = 0; i < createdAgents.length; i++) {
      const agent = createdAgents[i];
      
      const chatResult = await makeRequest(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: testMessage2,
          agentId: agent._id
        })
      });
      
      console.log(`${'='.repeat(60)}`);
      console.log(`🎭 ${agent.name}`);
      console.log(`${'='.repeat(60)}`);
      console.log(`🤖 Response: ${chatResult.data.reply}`);
      console.log();
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log("=".repeat(60));
    console.log("\n✅ Agent Prompt Test Completed!");
    console.log("\n📊 Analysis:");
    console.log("   - If responses are DIFFERENT, prompts are working ✓");
    console.log("   - If responses are SIMILAR, prompts may not be working ✗");
    console.log("\n💡 Look for:");
    console.log("   - Shakespeare: 'thee', 'thou', poetic language");
    console.log("   - Pirate: 'arr', 'matey', nautical terms");
    console.log("   - Robot: Technical, 'PROCESSING', systematic");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  }
}

testAgentPrompts();
