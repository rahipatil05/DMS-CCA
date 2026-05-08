# API Routes Documentation

Complete reference for all API endpoints in the DMSM CCA platform, including request bodies and code examples.

**Base URL:** `http://localhost:5000`

---

## Table of Contents
1. [Authentication Routes](#1-authentication-routes-apiauth)
2. [User Routes](#2-user-routes-apiuser)
3. [Agent Routes](#3-agent-routes-apiagents)
4. [Chat Routes](#4-chat-routes-apichat)
5. [Analytics Routes](#5-analytics-routes-apianalytics)
6. [Admin Routes](#6-admin-routes-apiadmin)

---

## 1. Authentication Routes (`/api/auth`)

### `GET /api/auth/check-auth`
Check if the current user is authenticated and get their details.
- **Auth:** Required (JWT)

**Example (JS Fetch):**
```javascript
const response = await fetch('/api/auth/check-auth', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const user = await response.json();
```

### `POST /api/auth/signup`
Create a new user account.
- **Body:** `{ fullName, email, password }`
- **Response:** 201 Created with user details + JWT cookie.

**Example (JS Fetch):**
```javascript
const response = await fetch('/api/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ fullName: 'John Doe', email: 'john@example.com', password: 'password123' })
});
```

### `POST /api/auth/login`
Authenticate an existing user.
- **Body:** `{ email, password }`
- **Response:** 200 OK with user details + JWT cookie.

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

### `POST /api/auth/logout`
Logout the current user.
- **Response:** 200 OK. Clears JWT cookie.

**Example (cURL):**
```bash
curl -X POST http://localhost:5000/api/auth/logout
```

### `PUT /api/auth/update-profile`
Update user profile picture.
- **Auth:** Required (JWT)
- **Body:** `{ profilePic (base64) }`

**Example (JS Fetch):**
```javascript
await fetch('/api/auth/update-profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ profilePic: 'data:image/jpeg;base64,...' })
});
```

### `DELETE /api/auth/delete-account-data`
Delete all user conversations and custom agents.
- **Auth:** Required (JWT)

**Example (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/auth/delete-account-data \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### `DELETE /api/auth/clear-agent-chat/:agentId`
Clear chat history with a specific agent.
- **Auth:** Required (JWT)

**Example (JS Fetch):**
```javascript
await fetch(`/api/auth/clear-agent-chat/${agentId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
```

---

## 2. User Routes (`/api/user`)

### `GET /api/user/dashboard-stats`
Get basic statistics for the user dashboard.
- **Auth:** Required (JWT)

**Example (JS Fetch):**
```javascript
const response = await fetch('/api/user/dashboard-stats', { headers: { 'Authorization': `Bearer ${token}` } });
const stats = await response.json();
```

### `PUT /api/user/profile`
Update user profile information.
- **Auth:** Required (JWT)
- **Body:** `{ fullName, email, dob, interests, personalityTraits }`

**Example (JS Fetch):**
```javascript
await fetch('/api/user/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ fullName: "Jane Doe", interests: ["Coding", "Music"] })
});
```

---

## 3. Agent Routes (`/api/agents`)

### `GET /api/agents`
Get all agents available to the user (public agents + their custom agents).
- **Auth:** Required (JWT)

**Example (cURL):**
```bash
curl -X GET http://localhost:5000/api/agents -H "Authorization: Bearer YOUR_TOKEN"
```

### `POST /api/agents`
Create a new custom agent.
- **Auth:** Required (JWT)
- **Body:** `{ name, prompt, description, icon, color, etc }`

**Example (JS Fetch):**
```javascript
await fetch('/api/agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ name: "Coding Bot", prompt: "You are a coding assistant" })
});
```

### `POST /api/agents/enhance-prompt`
Enhance an agent's prompt using the AI.
- **Auth:** Required (JWT)
- **Body:** `{ draft }`

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/agents/enhance-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ draft: "make it sound like a pirate" })
});
const { enhanced } = await res.json();
```

### `DELETE /api/agents/:id`
Delete a custom agent.
- **Auth:** Required (JWT)

**Example (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/agents/AGENT_ID -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 4. Chat Routes (`/api/chat`)

### `POST /api/chat` or `POST /api/chat/message`
Send a message to an agent.
- **Auth:** Required (JWT)
- **Body:** `{ message, agentId }`

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ message: "Hello there!", agentId: "12345" })
});
const data = await res.json();
console.log(data.reply, data.emotion);
```

### `GET /api/chat/:agentId`
Get the conversation history with a specific agent.
- **Auth:** Required (JWT)

**Example (JS Fetch):**
```javascript
const response = await fetch(`/api/chat/${agentId}`, { headers: { 'Authorization': `Bearer ${token}` } });
const conversation = await response.json();
```

### `DELETE /api/chat/:agentId`
Clear the chat history with a specific agent.
- **Auth:** Required (JWT)

**Example (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/chat/AGENT_ID -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 5. Analytics Routes (`/api/analytics`)

### `GET /api/analytics`
Get user analytics (emotion tracking, activity data).
- **Auth:** Required (JWT)

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/analytics', { headers: { 'Authorization': `Bearer ${token}` } });
const analytics = await res.json();
```

### `GET /api/analytics/journal`
Generate an AI-powered wellness journal based on recent interactions.
- **Auth:** Required (JWT)

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/analytics/journal', { headers: { 'Authorization': `Bearer ${token}` } });
const { journalEntry } = await res.json();
```

---

## 6. Admin Routes (`/api/admin`)
*Note: All admin routes require authentication AND the `admin` role.*

### `GET /api/admin/users`
Get all users in the system.

**Example (cURL):**
```bash
curl -X GET http://localhost:5000/api/admin/users -H "Authorization: Bearer ADMIN_TOKEN"
```

### `PUT /api/admin/users/:id`
Update a user's role or details.
- **Body:** `{ fullName, email, role }`

**Example (JS Fetch):**
```javascript
await fetch(`/api/admin/users/${userId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
  body: JSON.stringify({ role: "admin" })
});
```

### `DELETE /api/admin/users/:id`
Delete a user account entirely.

**Example (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/admin/users/USER_ID -H "Authorization: Bearer ADMIN_TOKEN"
```

### `GET /api/admin/agents`
Get all agents in the system.

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/admin/agents', { headers: { 'Authorization': `Bearer ${adminToken}` } });
const allAgents = await res.json();
```

### `POST /api/admin/agents`
Create a system-level agent (can be set as default).
- **Body:** `{ name, prompt, description, icon, color, isDefault, isPublic, preferredLength }`

**Example (JS Fetch):**
```javascript
await fetch('/api/admin/agents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
  body: JSON.stringify({ name: "System Bot", prompt: "...", isDefault: true })
});
```

### `PUT /api/admin/agents/:id`
Update an existing agent.

**Example (JS Fetch):**
```javascript
await fetch(`/api/admin/agents/${agentId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
  body: JSON.stringify({ name: "Updated System Bot Name" })
});
```

### `DELETE /api/admin/agents/:id`
Delete any agent from the system.

**Example (cURL):**
```bash
curl -X DELETE http://localhost:5000/api/admin/agents/AGENT_ID -H "Authorization: Bearer ADMIN_TOKEN"
```

### `GET /api/admin/stats`
Get platform-wide statistics (total users, conversations, monthly activity).

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/admin/stats', { headers: { 'Authorization': `Bearer ${adminToken}` } });
const stats = await res.json();
```

### `GET /api/admin/conversations`
Get all conversations across the platform (paginated).
- **Query:** `?page=1&limit=20`

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/admin/conversations?page=1&limit=10', { headers: { 'Authorization': `Bearer ${adminToken}` } });
const data = await res.json();
```

### `POST /api/admin/chat-query`
Execute a natural language query against the database using the AI database chatbot.
- **Body:** `{ question }`

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/admin/chat-query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
  body: JSON.stringify({ question: "How many users registered this week?" })
});
const result = await res.json();
```

### `POST /api/admin/enhance-prompt`
Enhance an agent prompt via AI (admin version).
- **Body:** `{ draft, agentName }`

**Example (JS Fetch):**
```javascript
const res = await fetch('/api/admin/enhance-prompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
  body: JSON.stringify({ draft: "Be helpful", agentName: "HelperBot" })
});
```
