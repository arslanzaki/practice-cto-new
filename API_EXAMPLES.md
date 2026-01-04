# API Usage Examples

This document provides practical examples of how to use the Notes API.

## Setup

First, make sure the API is running:

```bash
bun run dev
```

## Authentication Flow

### 1. Register a New User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "username": "john_doe",
    "password": "securepassword123"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "john@example.com",
      "username": "john_doe",
      "created_at": "2024-01-15T10:30:00.000Z",
      "updated_at": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

Save the token from the response for subsequent requests!

## Working with Notes

### 3. Create a Note

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My First Note",
    "content": "# Welcome\n\nThis is my first note using **Markdown**!",
    "tags": ["personal", "getting-started"]
  }'
```

### 4. Get All Notes

```bash
curl http://localhost:3000/api/v1/notes?page=1&limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Get a Specific Note

```bash
curl http://localhost:3000/api/v1/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Update a Note

```bash
curl -X PUT http://localhost:3000/api/v1/notes/NOTE_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Title",
    "content": "Updated content with more information"
  }'
```

### 7. Search Notes

```bash
curl -X POST http://localhost:3000/api/v1/notes/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "Markdown",
    "tags": ["personal"]
  }'
```

### 8. Add Tags to a Note

```bash
curl -X POST http://localhost:3000/api/v1/notes/NOTE_ID/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tags": ["important", "urgent"]
  }'
```

### 9. Remove a Tag from a Note

```bash
curl -X DELETE http://localhost:3000/api/v1/notes/NOTE_ID/tags/important \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 10. Delete a Note

```bash
curl -X DELETE http://localhost:3000/api/v1/notes/NOTE_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Working with Workspaces

### 11. Create a Workspace

```bash
curl -X POST http://localhost:3000/api/v1/workspaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Work Projects",
    "description": "Notes related to work projects"
  }'
```

### 12. Get All Workspaces

```bash
curl http://localhost:3000/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 13. Create a Note in a Workspace

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Project Meeting Notes",
    "content": "## Meeting with team\n\n- Discussed timeline\n- Assigned tasks",
    "workspace_id": "WORKSPACE_ID",
    "tags": ["work", "meeting"]
  }'
```

## Working with Tags

### 14. Get All Tags

```bash
curl http://localhost:3000/api/v1/tags \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 15. Create a Tag

```bash
curl -X POST http://localhost:3000/api/v1/tags \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "important"
  }'
```

### 16. Get Tag Details (with note count)

```bash
curl http://localhost:3000/api/v1/tags/TAG_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Sharing Notes

### 17. Share a Note with Another User

First, you need the other user's ID. Then:

```bash
curl -X POST http://localhost:3000/api/v1/sharing/notes/NOTE_ID/share \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "user_id": "OTHER_USER_ID",
    "permission": "read"
  }'
```

Permissions:
- `read` - User can view the note
- `edit` - User can view and edit the note

### 18. Get Notes Shared With Me

```bash
curl http://localhost:3000/api/v1/sharing/shared-with-me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 19. Get Notes I've Shared

```bash
curl http://localhost:3000/api/v1/sharing/shared-by-me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 20. Get All Shares for a Specific Note

```bash
curl http://localhost:3000/api/v1/sharing/notes/NOTE_ID/shares \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 21. Unshare a Note

```bash
curl -X DELETE http://localhost:3000/api/v1/sharing/notes/NOTE_ID/share/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Advanced Search Examples

### Search by Multiple Criteria

```bash
curl -X POST http://localhost:3000/api/v1/notes/search?page=1&limit=20 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "meeting",
    "tags": ["work", "important"],
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "workspaceId": "WORKSPACE_ID"
  }'
```

### Search by Tags Only

```bash
curl -X POST http://localhost:3000/api/v1/notes/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "tags": ["urgent", "todo"]
  }'
```

### Full-Text Search

```bash
curl -X POST http://localhost:3000/api/v1/notes/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "query": "database migration"
  }'
```

## Using with JavaScript/TypeScript

### Example with Fetch API

```javascript
// Register
const register = async () => {
  const response = await fetch('http://localhost:3000/api/v1/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      username: 'username',
      password: 'password123'
    }),
  });
  
  const data = await response.json();
  return data.data.token;
};

// Create a note
const createNote = async (token) => {
  const response = await fetch('http://localhost:3000/api/v1/notes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'My Note',
      content: 'Note content here',
      tags: ['example']
    }),
  });
  
  return await response.json();
};

// Usage
const token = await register();
const note = await createNote(token);
console.log(note);
```

### Example with Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Login and set token
const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  api.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
  return data.data.token;
};

// Get all notes
const getNotes = async (page = 1, limit = 20) => {
  const { data } = await api.get('/notes', {
    params: { page, limit }
  });
  return data;
};

// Usage
await login('user@example.com', 'password123');
const notes = await getNotes();
console.log(notes);
```

## Health Check

Check if the API and database are running:

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Tips

1. **Save your token**: After login/register, save the JWT token for subsequent requests
2. **Token expiry**: Tokens expire after 7 days (configurable in `.env`)
3. **Pagination**: Use `page` and `limit` query parameters for list endpoints
4. **Markdown support**: Use full Markdown syntax in note content
5. **Tag normalization**: Tags are automatically converted to lowercase
6. **Soft delete**: Deleted notes can potentially be recovered from the database
