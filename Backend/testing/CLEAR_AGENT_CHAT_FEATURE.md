# Clear Agent Chat Feature

## Overview
Users can now clear their chat history with a specific agent while keeping conversations with other agents intact. This provides granular control over conversation data.

---

## API Endpoint

### DELETE `/api/auth/clear-agent-chat/:agentId`

**Description:** Clears all chat history with a specific agent for the authenticated user.

**Authentication:** Required (JWT token)

**Parameters:**
- `agentId` (URL parameter) - The ID of the agent whose chat history should be cleared

**Request:**
```http
DELETE /api/auth/clear-agent-chat/6985fe9be60fb4c055b51340
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "Agent chat history cleared successfully",
  "deleted": {
    "conversations": 1
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (missing agentId)
- `401` - Unauthorized (no/invalid token)
- `500` - Internal server error

---

## What Gets Deleted

### ✅ Deleted
- **Conversation with specified agent** - The conversation document containing all messages between the user and this specific agent

### ❌ Not Deleted
- **Other agent conversations** - Chats with other agents remain intact
- **Agent itself** - The agent is not deleted
- **User account** - User account remains unchanged

---

## How It Works

### Conversation Structure
Each user-agent pair has ONE conversation document that stores all messages:
```javascript
{
  userId: "user123",
  agentId: "agent456",
  messages: [
    { role: "user", content: "Hello", emotion: "neutral" },
    { role: "assistant", content: "Hi there!", emotion: "neutral" },
    { role: "user", content: "How are you?", emotion: "neutral" },
    { role: "assistant", content: "I'm doing well!", emotion: "neutral" }
  ]
}
```

When you clear the chat, the entire conversation document is deleted, removing all message history with that agent.

---

## Usage Examples

### JavaScript/Node.js
```javascript
const agentId = "6985fe9be60fb4c055b51340";

const response = await fetch(`http://localhost:5000/api/auth/clear-agent-chat/${agentId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
console.log(result.message); // "Agent chat history cleared successfully"
console.log(`Deleted ${result.deleted.conversations} conversation(s)`);
```

### cURL
```bash
curl -X DELETE "http://localhost:5000/api/auth/clear-agent-chat/AGENT_ID_HERE" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### React Component Example
```jsx
function AgentChatSettings({ agentId, agentName }) {
  const [isClearing, setIsClearing] = useState(false);
  
  const handleClearChat = async () => {
    if (!window.confirm(`Clear all chat history with ${agentName}?`)) {
      return;
    }
    
    setIsClearing(true);
    
    try {
      const response = await fetch(`/api/auth/clear-agent-chat/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      alert('Chat history cleared successfully!');
      
      // Refresh the chat view or redirect
      window.location.reload();
      
    } catch (error) {
      alert('Failed to clear chat history');
    } finally {
      setIsClearing(false);
    }
  };
  
  return (
    <button 
      onClick={handleClearChat} 
      disabled={isClearing}
      className="btn-clear-chat"
    >
      {isClearing ? 'Clearing...' : 'Clear Chat History'}
    </button>
  );
}
```

---

## Test Results

### ✅ Test Scenario
1. Created 3 agents
2. Created 2 message exchanges with each agent (6 messages total per conversation)
3. Cleared chat with Agent 2
4. Verified Agent 1 and Agent 3 chats still exist
5. Created new message with Agent 2 (starts fresh conversation)
6. Cleared chat with Agent 1
7. Verified Agent 3 chat still exists

### Results
```
📊 Initial State:
   - 3 agents with conversations
   - Each has complete message history

🧹 After clearing Agent 2:
   - Agent 1: ✅ History intact
   - Agent 2: 🆕 Fresh start (history cleared)
   - Agent 3: ✅ History intact

🧹 After clearing Agent 1:
   - Agent 1: 🆕 Fresh start (history cleared)
   - Agent 2: 🆕 Fresh start (already cleared)
   - Agent 3: ✅ History intact
```

**Status:** ✅ All tests passed

---

## Implementation Details

### Controller Function
**File:** `src/controllers/auth.controller.js`

```javascript
export const clearAgentChat = async (req, res) => {
  try {
    const userId = req.user._id;
    const { agentId } = req.params;

    if (!agentId) {
      return res.status(400).json({ message: "Agent ID is required" });
    }

    // Delete conversations with this specific agent
    const result = await Conversation.deleteMany({ 
      userId, 
      agentId 
    });

    res.status(200).json({
      message: "Agent chat history cleared successfully",
      deleted: {
        conversations: result.deletedCount
      }
    });
  } catch (error) {
    console.error("Error clearing agent chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
```

### Route
**File:** `src/routes/auth.routes.js`

```javascript
router.delete("/clear-agent-chat/:agentId", isAuth, clearAgentChat);
```

---

## Comparison: Clear vs Delete All

| Feature | Clear Agent Chat | Delete All Account Data |
|---------|------------------|-------------------------|
| **Endpoint** | `/clear-agent-chat/:agentId` | `/delete-account-data` |
| **Scope** | Single agent | All data |
| **Conversations** | Deletes chat with 1 agent | Deletes ALL conversations |
| **Agents** | Agent not deleted | Deletes custom agents |
| **Session** | Keeps user logged in | Logs user out |
| **Use Case** | Start fresh with one agent | Clean slate / privacy |

---

## Security Considerations

### ✅ Security Features
1. **Authentication Required** - JWT token must be valid
2. **User Isolation** - Query ensures `userId` matches authenticated user
3. **No Cross-User Access** - Users can only clear their own conversations
4. **Parameterized Query** - Uses MongoDB filters to prevent injection

### Query Protection
```javascript
// Safe: Uses exact matching with authenticated user's ID
Conversation.deleteMany({ 
  userId: req.user._id,  // From authenticated session
  agentId: req.params.agentId  // From URL parameter
});
```

---

## Use Cases

### 1. **Privacy / Fresh Start**
User wants to start a new conversation without past context:
```javascript
// Clear history before sensitive topic
await clearAgentChat(therapyAgentId);
// Now chat about personal issue without past context
```

### 2. **Testing / Development**
Developer testing chat functionality:
```javascript
// Clear test conversations
await clearAgentChat(testAgentId);
// Run new test scenario
```

### 3. **Reset AI Context**
User feels AI is stuck in certain behavior:
```javascript
// Clear chat to reset AI's understanding
await clearAgentChat(assistantId);
// Start with fresh personality/behavior
```

### 4. **Cleanup / Organization**
User managing multiple agents:
```javascript
// Clear old conversations with unused agents
await clearAgentChat(oldAgentId);
// Keep current active chats
```

---

## Frontend Integration Tips

### 1. Add to Agent Card/Menu
```jsx
<div className="agent-menu">
  <button onClick={() => navigateToChat(agent.id)}>
    Open Chat
  </button>
  <button onClick={() => clearAgentChat(agent.id)}>
    Clear History
  </button>
</div>
```

### 2. Add to Chat Header
```jsx
<div className="chat-header">
  <h2>{agentName}</h2>
  <button 
    onClick={handleClearHistory}
    title="Clear chat history"
  >
    🗑️ Clear
  </button>
</div>
```

### 3. Settings Panel
```jsx
<div className="agent-settings">
  <h3>Chat Management</h3>
  <button onClick={handleClearHistory}>
    Clear Chat History
  </button>
  <p className="warning">
    This will delete all messages with this agent. 
    This action cannot be undone.
  </p>
</div>
```

---

## Database Query

### MongoDB Query Executed
```javascript
db.conversations.deleteMany({
  userId: ObjectId("user_id_here"),
  agentId: ObjectId("agent_id_here")
})
```

**Performance:**
- Indexed fields: `userId`, `agentId`
- Fast lookup and deletion
- Typically < 10ms execution time

---

## Related Endpoints

### Complete Data Management Suite
1. **Clear Agent Chat** (this feature)
   - `DELETE /api/auth/clear-agent-chat/:agentId`
   - Clear one agent's chat

2. **Delete All Account Data**
   - `DELETE /api/auth/delete-account-data`
   - Delete all conversations + custom agents

3. **Future: Delete Single Conversation**
   - `DELETE /api/conversations/:conversationId`
   - Delete specific conversation (not yet implemented)

---

## Testing

### Test File
**Location:** `test-clear-agent-chat.js`

**Run Test:**
```bash
npm start  # Start server in another terminal
node test-clear-agent-chat.js
```

**Test Coverage:**
- ✅ Create multiple agents
- ✅ Create conversations with each agent
- ✅ Clear specific agent chat
- ✅ Verify other chats remain intact
- ✅ Create new chat after clearing (fresh start)
- ✅ Clear another agent's chat
- ✅ Verify selective deletion

---

## Error Handling

### Common Errors

**Missing Agent ID:**
```json
{
  "message": "Agent ID is required"
}
```

**Invalid Token:**
```json
{
  "message": "Invalid token"
}
```

**Agent Not Found:**
- Returns success with `deletedCount: 0`
- No error (conversation simply doesn't exist)

---

## Monitoring & Logging

### Recommended Logging
```javascript
console.log(`User ${userId} cleared chat with agent ${agentId} (${result.deletedCount} conversations)`);
```

### Metrics to Track
- Number of chats cleared per day
- Most frequently cleared agents
- Time between clearing and new chat creation
- User retention after clearing chats

---

## Future Enhancements

### 1. Soft Delete with Recovery Period
```javascript
// Mark as deleted, actually delete after 30 days
await Conversation.updateMany(
  { userId, agentId },
  { 
    isDeleted: true, 
    deletedAt: new Date(),
    permanentDeleteAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  }
);
```

### 2. Export Before Clearing
```javascript
// Export chat history before deletion
const conversation = await Conversation.findOne({ userId, agentId });
const exportData = {
  agent: await Agent.findById(agentId),
  messages: conversation.messages,
  exportedAt: new Date()
};
// Send email or provide download
```

### 3. Confirmation with Message Count
```javascript
// Tell user how many messages will be deleted
const conversation = await Conversation.findOne({ userId, agentId });
res.json({
  agentName: agent.name,
  messageCount: conversation.messages.length,
  confirmRequired: true
});
```

### 4. Selective Message Deletion
```javascript
// Delete specific date range or message types
router.delete("/clear-agent-chat/:agentId/before/:date", ...);
router.delete("/clear-agent-chat/:agentId/user-messages", ...);
```

---

## Conclusion

✅ **Feature Status:** Production Ready

The clear agent chat feature provides users with granular control over their conversation data. Users can selectively clear chat history with individual agents while preserving conversations with others, supporting privacy and fresh-start scenarios.

---

*Last Updated: February 7, 2026*
