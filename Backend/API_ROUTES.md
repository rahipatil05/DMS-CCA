# API Routes Documentation

Complete reference for all API endpoints with request/response examples.

**Base URL:** `http://localhost:5000`

---

## Table of Contents
1. [Authentication Routes](#authentication-routes)
2. [Agent Routes](#agent-routes)
3. [Chat Routes](#chat-routes)
4. [Admin Routes](#admin-routes)
5. [Quick Reference](#quick-reference)

---

# Authentication Routes

Base path: `/api/auth`

## 1. Signup

**POST** `/api/auth/signup`

Create a new user account.

**Authentication:** None required

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "_id": "6985fe99e60fb4c055b51338",
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400` - Missing fields, short password, invalid email, or email already exists
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

**Example - cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Example - PowerShell:**
```powershell
$body = @{
    fullName = "John Doe"
    email = "john@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Notes:**
- Password must be at least 6 characters
- Email must be valid format
- Sets HTTP-only JWT cookie on success

---

## 2. Login

**POST** `/api/auth/login`

Authenticate an existing user.

**Authentication:** None required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "_id": "6985fe99e60fb4c055b51338",
  "fullName": "John Doe",
  "email": "john@example.com"
}
```

**Error Responses:**
- `400` - Missing fields or invalid credentials
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const data = await response.json();
console.log(data);
```

**Example - cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Notes:**
- Sets HTTP-only JWT cookie on success
- Token expires in 7 days
- Use generic error message for security

---

## 3. Logout

**POST** `/api/auth/logout`

Logout the current user.

**Authentication:** None required

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/logout', {
  method: 'POST'
});

const data = await response.json();
console.log(data.message);
```

**Example - cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/logout
```

**Notes:**
- Clears JWT cookie
- Can be called without authentication

---

## 4. Update Profile

**PUT** `/api/auth/update-profile`

Update user profile picture.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "profilePic": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
}
```

**Success Response (200):**
```json
{
  "_id": "6985fe99e60fb4c055b51338",
  "fullName": "John Doe",
  "email": "john@example.com",
  "profilePic": "https://res.cloudinary.com/..."
}
```

**Error Responses:**
- `400` - Profile pic required
- `401` - Unauthorized
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/update-profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    profilePic: 'data:image/jpeg;base64,...'
  })
});

const data = await response.json();
console.log(data);
```

**Example - cURL:**
```bash
curl -X PUT http://localhost:5000/api/auth/update-profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "profilePic": "data:image/jpeg;base64,..."
  }'
```

**Notes:**
- Requires Cloudinary configuration
- Accepts base64 encoded image

---

## 5. Delete Account Data

**DELETE** `/api/auth/delete-account-data`

Delete all user conversations and custom agents.

**Authentication:** Required (JWT token)

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "All account data deleted successfully",
  "deleted": {
    "conversations": 5,
    "agents": 3
  }
}
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/auth/delete-account-data', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(`Deleted ${data.deleted.conversations} conversations`);
console.log(`Deleted ${data.deleted.agents} agents`);
```

**Example - cURL:**
```bash
curl -X DELETE http://localhost:5000/api/auth/delete-account-data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Notes:**
- Deletes ALL conversations
- Deletes ALL custom agents created by user
- Clears JWT cookie
- User account remains active

---

## 6. Clear Agent Chat

**DELETE** `/api/auth/clear-agent-chat/:agentId`

Clear chat history with a specific agent.

**Authentication:** Required (JWT token)

**URL Parameters:**
- `agentId` (required) - The ID of the agent

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "Agent chat history cleared successfully",
  "deleted": {
    "conversations": 1
  }
}
```

**Error Responses:**
- `400` - Agent ID required
- `401` - Unauthorized
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const agentId = '6985fe9be60fb4c055b51340';

const response = await fetch(`http://localhost:5000/api/auth/clear-agent-chat/${agentId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await response.json();
console.log(data.message);
```

**Example - cURL:**
```bash
curl -X DELETE http://localhost:5000/api/auth/clear-agent-chat/AGENT_ID_HERE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Notes:**
- Only deletes conversations with specified agent
- Other agent conversations remain intact
- User stays logged in

---

# Agent Routes

Base path: `/api/agents`

## 1. Get Agents

**GET** `/api/agents`

Get all agents (public agents + user's custom agents).

**Authentication:** Required (JWT token)

**Request Body:** None

**Success Response (200):**
```json
[
  {
    "_id": "6985fe9be60fb4c055b51340",
    "name": "Friendly Helper",
    "prompt": "You are a friendly and helpful AI assistant.",
    "isCustom": false,
    "createdByType": "user",
    "createdBy": "6985fe99e60fb4c055b51338",
    "createdAt": "2026-02-06T14:45:47.149Z",
    "updatedAt": "2026-02-06T14:45:47.149Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/agents', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const agents = await response.json();
console.log(`Found ${agents.length} agents`);
```

**Example - cURL:**
```bash
curl -X GET http://localhost:5000/api/agents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Notes:**
- Returns public agents AND agents created by current user
- Filtered by `isPublic: true` OR `createdBy: userId`

---

## 2. Create Agent

**POST** `/api/agents`

Create a new custom agent.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "name": "My Custom Agent",
  "prompt": "You are a specialized assistant for coding help."
}
```

**Success Response (200):**
```json
{
  "_id": "6985fe9be60fb4c055b51340",
  "name": "My Custom Agent",
  "prompt": "You are a specialized assistant for coding help.",
  "isCustom": false,
  "createdByType": "user",
  "createdBy": "6985fe99e60fb4c055b51338",
  "createdAt": "2026-02-06T14:45:47.149Z",
  "updatedAt": "2026-02-06T14:45:47.149Z"
}
```

**Error Responses:**
- `400` - Name and prompt required
- `401` - Unauthorized
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/agents', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'My Custom Agent',
    prompt: 'You are a specialized assistant for coding help.'
  })
});

const agent = await response.json();
console.log(`Created agent: ${agent.name}`);
```

**Example - cURL:**
```bash
curl -X POST http://localhost:5000/api/agents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "My Custom Agent",
    "prompt": "You are a specialized assistant for coding help."
  }'
```

**Notes:**
- `createdBy` automatically set to current user
- `createdByType` set based on user role (admin/user)
- Prompt defines agent's personality and behavior

---

# Chat Routes

Base path: `/api/chat`

## 1. Send Message

**POST** `/api/chat` or **POST** `/api/chat/message`

Send a message to an agent.

**Authentication:** Required (JWT token)

**Request Body:**
```json
{
  "message": "Hello! How can you help me?",
  "agentId": "6985fe9be60fb4c055b51340"
}
```

**Success Response (200):**
```json
{
  "reply": "Hello! I'm here to help you with any questions or tasks you have. What would you like assistance with today?",
  "emotion": {
    "emotion": "neutral",
    "confidence": 0.5,
    "intensity": "low",
    "rawLabel": "neutral"
  }
}
```

**Error Responses:**
- `400` - Message or Agent ID required
- `401` - Unauthorized
- `404` - Agent not found
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Hello! How can you help me?',
    agentId: '6985fe9be60fb4c055b51340'
  })
});

const data = await response.json();
console.log('AI:', data.reply);
console.log('Emotion detected:', data.emotion.emotion);
```

**Example - cURL:**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "message": "Hello! How can you help me?",
    "agentId": "AGENT_ID_HERE"
  }'
```

**Example - React Component:**
```jsx
function ChatBox({ agentId }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  
  const sendMessage = async () => {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, agentId })
    });
    
    const data = await response.json();
    
    setMessages([
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: data.reply }
    ]);
    
    setMessage('');
  };
  
  return (
    <div>
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={msg.role}>
            {msg.content}
          </div>
        ))}
      </div>
      <input 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
```

**Notes:**
- Creates conversation if doesn't exist
- Appends messages to existing conversation
- Detects emotion from user message
- Returns AI response with emotion data
- Uses Gemini AI for responses

---

# Admin Routes

Base path: `/api/admin`

**Note:** All admin routes require authentication AND admin role.

## 1. Get All Users

**GET** `/api/admin/users`

Get all users in the system.

**Authentication:** Required (JWT token + Admin role)

**Request Body:** None

**Success Response (200):**
```json
[
  {
    "_id": "6985fe99e60fb4c055b51338",
    "fullName": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  {
    "_id": "6985fe99e60fb4c055b51339",
    "fullName": "Jane Smith",
    "email": "jane@example.com",
    "role": "admin"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/admin/users', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const users = await response.json();
console.log(`Total users: ${users.length}`);
```

**Example - cURL:**
```bash
curl -X GET http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Notes:**
- Password field excluded from response
- Only accessible by admin users

---

## 2. Delete User

**DELETE** `/api/admin/users/:id`

Delete a user account.

**Authentication:** Required (JWT token + Admin role)

**URL Parameters:**
- `id` (required) - The user ID to delete

**Request Body:** None

**Success Response (200):**
```json
{
  "message": "User deleted"
}
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `404` - User not found
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const userId = '6985fe99e60fb4c055b51338';

const response = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const data = await response.json();
console.log(data.message);
```

**Example - cURL:**
```bash
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID_HERE \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Notes:**
- Permanently deletes user account
- Only accessible by admin users

---

## 3. Get All Agents

**GET** `/api/admin/agents`

Get all agents in the system (admin view).

**Authentication:** Required (JWT token + Admin role)

**Request Body:** None

**Success Response (200):**
```json
[
  {
    "_id": "6985fe9be60fb4c055b51340",
    "name": "Agent 1",
    "prompt": "You are agent 1",
    "isCustom": false,
    "createdByType": "user",
    "createdBy": "6985fe99e60fb4c055b51338",
    "createdAt": "2026-02-06T14:45:47.149Z",
    "updatedAt": "2026-02-06T14:45:47.149Z"
  }
]
```

**Error Responses:**
- `401` - Unauthorized
- `403` - Forbidden (not admin)
- `500` - Internal server error

**Example - JavaScript:**
```javascript
const response = await fetch('http://localhost:5000/api/admin/agents', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});

const agents = await response.json();
console.log(`Total agents: ${agents.length}`);
```

**Example - cURL:**
```bash
curl -X GET http://localhost:5000/api/admin/agents \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

**Notes:**
- Returns ALL agents (no filtering)
- Only accessible by admin users

---

# Quick Reference

## Authentication Headers

All authenticated endpoints require:
```javascript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Content Type

For POST/PUT requests with body:
```javascript
headers: {
  'Content-Type': 'application/json'
}
```

## Base URLs

**Development:**
```
http://localhost:5000
```

**Production:**
```
https://your-domain.com
```

---

## Endpoint Summary Table

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/signup` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| POST | `/api/auth/logout` | No | Logout |
| PUT | `/api/auth/update-profile` | Yes | Update profile pic |
| DELETE | `/api/auth/delete-account-data` | Yes | Delete all user data |
| DELETE | `/api/auth/clear-agent-chat/:agentId` | Yes | Clear specific agent chat |
| GET | `/api/agents` | Yes | Get agents |
| POST | `/api/agents` | Yes | Create agent |
| POST | `/api/chat` | Yes | Send message |
| POST | `/api/chat/message` | Yes | Send message (alt) |
| GET | `/api/admin/users` | Admin | Get all users |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |
| GET | `/api/admin/agents` | Admin | Get all agents |

---

## Response Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (no/invalid token) |
| 403 | Forbidden (not admin) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Common Patterns

### Complete Chat Flow
```javascript
// 1. Signup
const signupRes = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fullName: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  })
});

// 2. Extract token from cookie or login
const loginRes = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const token = 'JWT_TOKEN_HERE';

// 3. Get agents
const agentsRes = await fetch('/api/agents', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const agents = await agentsRes.json();

// 4. Send message
const chatRes = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    message: 'Hello!',
    agentId: agents[0]._id
  })
});

const chat = await chatRes.json();
console.log('AI:', chat.reply);
```

---

## Testing with Postman

### 1. Setup Environment Variables
```
base_url: http://localhost:5000
token: (will be set after login)
```

### 2. Test Sequence

**a) Signup:**
- Method: POST
- URL: `{{base_url}}/api/auth/signup`
- Body (JSON):
  ```json
  {
    "fullName": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }
  ```

**b) Login:**
- Method: POST
- URL: `{{base_url}}/api/auth/login`
- Body (JSON):
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- Tests tab: `pm.environment.set("token", pm.response.json().token);`

**c) Create Agent:**
- Method: POST
- URL: `{{base_url}}/api/agents`
- Headers: `Authorization: Bearer {{token}}`
- Body (JSON):
  ```json
  {
    "name": "Test Agent",
    "prompt": "You are a test agent."
  }
  ```

**d) Send Message:**
- Method: POST
- URL: `{{base_url}}/api/chat`
- Headers: `Authorization: Bearer {{token}}`
- Body (JSON):
  ```json
  {
    "message": "Hello!",
    "agentId": "AGENT_ID_FROM_PREVIOUS_STEP"
  }
  ```

---

## Error Handling Best Practices

```javascript
async function apiCall(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('Unauthorized')) {
      // Redirect to login
      window.location.href = '/login';
    }
    
    throw error;
  }
}

// Usage
try {
  const data = await apiCall('/api/agents', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(data);
} catch (error) {
  alert('Failed to load agents');
}
```

---

## Rate Limiting Recommendations

**Not currently implemented, but recommended:**

```javascript
// Add to middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', limiter);
```

---

## CORS Configuration

**Current:** Allows all origins
```javascript
app.use(cors());
```

**Production recommendation:**
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

---

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store JWT in HTTP-only cookies** (already implemented)
3. **Validate all input** (already implemented)
4. **Use environment variables for secrets** (already implemented)
5. **Implement rate limiting** (recommended)
6. **Add request logging** (partially implemented)
7. **Regular security audits**

---

*Last Updated: February 7, 2026*
*API Version: 1.0.0*
