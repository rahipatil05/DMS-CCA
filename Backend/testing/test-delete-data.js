// Test Delete Account Data Feature
const baseUrl = "http://localhost:5000";
const testEmail = `deletetest_${Math.random().toString(36).substring(7)}@example.com`;

console.log("\n🗑️  Testing Delete Account Data Feature");
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

async function testDeleteAccountData() {
  try {
    // 1. Create user
    console.log("\n1️⃣  Creating test user...");
    const signupResult = await makeRequest(`${baseUrl}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: "Delete Test User",
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
    const agentIds = [];
    
    for (let i = 1; i <= 3; i++) {
      const agentResult = await makeRequest(`${baseUrl}/api/agents`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: `Test Agent ${i}`,
          prompt: `You are test agent number ${i}.`
        })
      });
      agentIds.push(agentResult.data._id);
      console.log(`   ✅ Created Agent ${i}: ${agentResult.data._id}`);
    }
    
    // 3. Create conversations
    console.log("\n3️⃣  Creating conversations...");
    
    for (let i = 0; i < agentIds.length; i++) {
      await makeRequest(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: `Hello from conversation ${i + 1}`,
          agentId: agentIds[i]
        })
      });
      console.log(`   ✅ Created conversation ${i + 1}`);
    }
    
    // 4. Verify data exists
    console.log("\n4️⃣  Verifying created data...");
    const agentsResult = await makeRequest(`${baseUrl}/api/agents`, {
      headers
    });
    console.log(`   📊 Total agents: ${agentsResult.data.length}`);
    
    // 5. Delete all account data
    console.log("\n5️⃣  Deleting all account data...");
    const deleteResult = await makeRequest(`${baseUrl}/api/auth/delete-account-data`, {
      method: 'DELETE',
      headers
    });
    
    console.log("✅ Delete successful!");
    console.log(`   🗑️  Conversations deleted: ${deleteResult.data.deleted.conversations}`);
    console.log(`   🗑️  Agents deleted: ${deleteResult.data.deleted.agents}`);
    
    // 6. Verify data is deleted
    console.log("\n6️⃣  Verifying deletion...");
    
    // Login again to get new token
    const loginResult = await makeRequest(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: "password123"
      })
    });
    
    const newToken = loginResult.token;
    const newHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${newToken}`
    };
    
    const verifyAgentsResult = await makeRequest(`${baseUrl}/api/agents`, {
      headers: newHeaders
    });
    
    console.log(`   📊 Agents after deletion: ${verifyAgentsResult.data.length}`);
    
    if (verifyAgentsResult.data.length === 0) {
      console.log("   ✅ All data successfully deleted!");
    } else {
      console.log("   ⚠️  Some data still exists");
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Delete account data test completed!");
    console.log("=".repeat(60));
    
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error(error);
  }
}

testDeleteAccountData();
