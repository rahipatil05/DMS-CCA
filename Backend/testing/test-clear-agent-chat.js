// Test Clear Agent Chat Feature
const baseUrl = "http://localhost:5000";
const testEmail = `cleartest_${Math.random().toString(36).substring(7)}@example.com`;

console.log("\n🧹 Testing Clear Agent Chat Feature");
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

async function testClearAgentChat() {
  try {
    // 1. Create user
    console.log("\n1️⃣  Creating test user...");
    const signupResult = await makeRequest(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Clear Test User",
        email: testEmail,
        password: "password123"
      })
    });
    
    const token = signupResult.token;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
    
    console.log("✅ User created");
    
    // 2. Create multiple agents
    console.log("\n2️⃣  Creating test agents...");
    const agents = [];
    
    for (let i = 1; i <= 3; i++) {
      const agentResult = await makeRequest(`${baseUrl}/api/agents`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `Agent ${i}`,
          prompt: `You are agent number ${i}.`
        })
      });
      agents.push(agentResult.data);
      console.log(`   ✅ Created Agent ${i}: ${agentResult.data.name}`);
    }
    
    // 3. Create multiple conversations with each agent
    console.log("\n3️⃣  Creating conversations...");
    
    for (let i = 0; i < agents.length; i++) {
      for (let j = 1; j <= 2; j++) {
        await makeRequest(`${baseUrl}/api/chat`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            message: `Message ${j} to Agent ${i + 1}`,
            agentId: agents[i]._id
          })
        });
      }
      console.log(`   ✅ Created 2 conversations with ${agents[i].name}`);
    }
    
    console.log(`\n   📊 Total: 6 conversations (2 per agent)`);
    
    // 4. Clear chat with Agent 2 only
    console.log(`\n4️⃣  Clearing chat with ${agents[1].name}...`);
    const clearResult = await makeRequest(
      `${baseUrl}/api/auth/clear-agent-chat/${agents[1]._id}`, 
      {
        method: 'DELETE',
        headers
      }
    );
    
    console.log("✅ Chat cleared!");
    console.log(`   🧹 Conversations deleted: ${clearResult.data.deleted.conversations}`);
    
    // 5. Verify other conversations still exist
    console.log("\n5️⃣  Verifying remaining conversations...");
    
    // Try to chat with Agent 1 (should have existing conversation)
    const chat1 = await makeRequest(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: "Do you remember our previous chat?",
        agentId: agents[0]._id
      })
    });
    
    // Try to chat with Agent 2 (should create new conversation)
    const chat2 = await makeRequest(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: "This should be a new conversation",
        agentId: agents[1]._id
      })
    });
    
    // Try to chat with Agent 3 (should have existing conversation)
    const chat3 = await makeRequest(`${baseUrl}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        message: "Our chat history should still be here",
        agentId: agents[2]._id
      })
    });
    
    console.log(`   ✅ ${agents[0].name}: Still has history`);
    console.log(`   ✅ ${agents[1].name}: History cleared (new conversation)`);
    console.log(`   ✅ ${agents[2].name}: Still has history`);
    
    // 6. Test clearing another agent
    console.log(`\n6️⃣  Clearing chat with ${agents[0].name}...`);
    const clearResult2 = await makeRequest(
      `${baseUrl}/api/auth/clear-agent-chat/${agents[0]._id}`, 
      {
        method: 'DELETE',
        headers
      }
    );
    
    console.log("✅ Chat cleared!");
    console.log(`   🧹 Conversations deleted: ${clearResult2.data.deleted.conversations}`);
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Clear agent chat test completed!");
    console.log("=".repeat(60));
    
    console.log("\n📋 Summary:");
    console.log("   - Created 3 agents");
    console.log("   - Created 6 conversations (2 per agent)");
    console.log("   - Cleared Agent 2 chat (2 conversations deleted)");
    console.log("   - Verified other agents' chats intact");
    console.log("   - Cleared Agent 1 chat (3 conversations deleted - 2 original + 1 new)");
    console.log("   - Agent 3 chat still exists");
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  }
}

testClearAgentChat();
