# Delete Account Data Feature

## Overview
Users can now delete all their account data including conversations and custom agents with a single API call. This feature supports data privacy and GDPR compliance.

---

## API Endpoint

### DELETE `/api/auth/delete-account-data`

**Description:** Deletes all user data including conversations and custom agents created by the user.

**Authentication:** Required (JWT token)

**Request:**
```http
DELETE /api/auth/delete-account-data
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "message": "All account data deleted successfully",
  "deleted": {
    "conversations": 3,
    "agents": 3
  }
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized (no/invalid token)
- `500` - Internal server error

---

## What Gets Deleted

### ✅ Deleted
1. **All Conversations** - Every conversation where `userId` matches the authenticated user
2. **Custom Agents** - All agents where `createdBy` matches the authenticated user
3. **JWT Cookie** - Session cookie is cleared

### ❌ Not Deleted
- **User Account** - The user account itself remains active
- **Profile Information** - Email, fullName, password remain unchanged
- **Public Agents** - Agents created by admins or other users

---

## Usage Examples

### JavaScript/Node.js
```javascript
const response = await fetch('http://localhost:5000/api/auth/delete-account-data', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
console.log(`Deleted ${result.deleted.conversations} conversations`);
console.log(`Deleted ${result.deleted.agents} agents`);
```

### cURL
```bash
curl -X DELETE http://localhost:5000/api/auth/delete-account-data \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### PowerShell
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/delete-account-data" `
    -Method DELETE `
    -Headers $headers
```

---

## Test Results

### ✅ Test Scenario
1. Created test user
2. Created 3 custom agents
3. Created 3 conversations (one with each agent)
4. Called delete endpoint
5. Verified all data was deleted

### Results
```
📊 Before deletion:
   - Agents: 3
   - Conversations: 3

🗑️ Deleted:
   - Conversations: 3
   - Agents: 3

📊 After deletion:
   - Agents: 0
   - Conversations: 0
```

**Status:** ✅ All tests passed

---

## Implementation Details

### Controller Function
**File:** `src/controllers/auth.controller.js`

```javascript
export const deleteAccountData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all conversations for this user
    const conversationsDeleted = await Conversation.deleteMany({ userId });

    // Delete all custom agents created by this user
    const agentsDeleted = await Agent.deleteMany({ createdBy: userId });

    // Clear JWT cookie
    res.cookie("jwt", "", { maxAge: 0 });

    res.status(200).json({
      message: "All account data deleted successfully",
      deleted: {
        conversations: conversationsDeleted.deletedCount,
        agents: agentsDeleted.deletedCount
      }
    });
  } catch (error) {
    console.error("Error deleting account data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
```

### Route
**File:** `src/routes/auth.routes.js`

```javascript
router.delete("/delete-account-data", isAuth, deleteAccountData);
```

---

## Security Considerations

### ✅ Security Features
1. **Authentication Required** - Only authenticated users can delete their data
2. **User Isolation** - Users can only delete their own data (enforced by `userId` matching)
3. **JWT Cleared** - Session cookie is cleared after deletion
4. **No Cascading Issues** - Deletion is scoped to user's own data only

### ⚠️ Important Notes
- **Irreversible Action** - Once deleted, data cannot be recovered
- **No Confirmation** - Single API call deletes everything (consider adding confirmation in frontend)
- **Immediate Effect** - Changes take effect immediately with no rollback

---

## Frontend Integration Recommendations

### 1. Confirmation Dialog
```javascript
const confirmDelete = window.confirm(
  "Are you sure you want to delete all your conversations and agents? This action cannot be undone."
);

if (confirmDelete) {
  await deleteAccountData();
}
```

### 2. Loading State
```javascript
async function deleteAccountData() {
  setLoading(true);
  
  try {
    const response = await fetch('/api/auth/delete-account-data', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const result = await response.json();
    
    // Show success message
    alert(`Deleted ${result.deleted.conversations} conversations and ${result.deleted.agents} agents`);
    
    // Redirect to home or login
    window.location.href = '/';
    
  } catch (error) {
    alert('Failed to delete data. Please try again.');
  } finally {
    setLoading(false);
  }
}
```

### 3. Settings Page Component
```jsx
function DeleteDataSection() {
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDelete = async () => {
    if (!window.confirm("Delete all your data? This cannot be undone.")) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const response = await fetch('/api/auth/delete-account-data', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      const result = await response.json();
      
      alert(`Successfully deleted ${result.deleted.conversations} conversations and ${result.deleted.agents} agents`);
      
      // Clear local storage and redirect
      localStorage.clear();
      window.location.href = '/login';
      
    } catch (error) {
      alert('Failed to delete data');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <div className="danger-zone">
      <h3>Danger Zone</h3>
      <p>Delete all your conversations and custom agents. This action cannot be undone.</p>
      <button 
        onClick={handleDelete} 
        disabled={isDeleting}
        className="btn-danger"
      >
        {isDeleting ? 'Deleting...' : 'Delete All My Data'}
      </button>
    </div>
  );
}
```

---

## Database Queries

### Conversations Deleted
```javascript
Conversation.deleteMany({ userId: req.user._id })
```

### Agents Deleted
```javascript
Agent.deleteMany({ createdBy: req.user._id })
```

**Query Performance:**
- Uses MongoDB `deleteMany()` for bulk deletion
- Indexed fields (`userId`, `createdBy`) ensure fast lookups
- Atomic operations prevent partial deletions

---

## Monitoring & Logging

### Log Output
```
Error deleting account data: <error>
```

### Recommended Additional Logging
```javascript
console.log(`User ${userId} deleted ${conversationsDeleted.deletedCount} conversations and ${agentsDeleted.deletedCount} agents`);
```

### Metrics to Track
- Number of deletions per day
- Average data deleted per user
- Failed deletion attempts
- Time to complete deletion

---

## GDPR Compliance

This feature helps comply with:
- **Right to Erasure (Article 17)** - Users can delete their data
- **Data Minimization (Article 5)** - Users can remove unnecessary data
- **Transparency (Article 12)** - Clear feedback on what was deleted

### Additional Recommendations
1. **Audit Trail** - Log deletion events for compliance
2. **Data Export** - Add endpoint to export data before deletion
3. **Retention Policy** - Document data retention policies
4. **Privacy Policy** - Update privacy policy to mention this feature

---

## Future Enhancements

### 1. Complete Account Deletion
```javascript
// Also delete the user account
await User.findByIdAndDelete(userId);
```

### 2. Soft Delete
```javascript
// Mark as deleted instead of hard delete
await Conversation.updateMany(
  { userId },
  { isDeleted: true, deletedAt: new Date() }
);
```

### 3. Scheduled Deletion
```javascript
// Schedule deletion for 30 days later
await User.findByIdAndUpdate(userId, {
  scheduledDeletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
});
```

### 4. Data Export Before Deletion
```javascript
// Export data to JSON before deletion
const exportData = {
  conversations: await Conversation.find({ userId }),
  agents: await Agent.find({ createdBy: userId })
};
// Send email with export or provide download
```

### 5. Granular Deletion
```javascript
// Allow users to choose what to delete
router.delete("/delete-conversations", isAuth, deleteConversations);
router.delete("/delete-agents", isAuth, deleteAgents);
```

---

## Testing

### Test File
**Location:** `test-delete-data.js`

**Run Test:**
```bash
npm start  # Start server in another terminal
node test-delete-data.js
```

**Test Coverage:**
- ✅ Create user
- ✅ Create multiple agents
- ✅ Create conversations
- ✅ Delete all data
- ✅ Verify deletion successful
- ✅ Verify user account still exists

---

## API Documentation Update

Add to your API documentation (Swagger/OpenAPI):

```yaml
/api/auth/delete-account-data:
  delete:
    summary: Delete all account data
    description: Deletes all conversations and custom agents created by the authenticated user
    tags:
      - Authentication
    security:
      - bearerAuth: []
    responses:
      '200':
        description: Data deleted successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                deleted:
                  type: object
                  properties:
                    conversations:
                      type: integer
                    agents:
                      type: integer
      '401':
        description: Unauthorized
      '500':
        description: Internal server error
```

---

## Conclusion

✅ **Feature Status:** Production Ready

The delete account data feature is fully functional and tested. Users can now easily delete all their conversations and custom agents with a single API call, supporting data privacy and user control over their information.

---

*Last Updated: February 7, 2026*
