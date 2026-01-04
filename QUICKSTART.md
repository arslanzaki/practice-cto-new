# Quick Start Guide

Get the Notes API up and running in 5 minutes!

## Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14.0 (or use Docker)

## Option 1: Quick Setup with Docker

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd notes-api

# Install dependencies
bun install
```

### 2. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts PostgreSQL with:
- Database: `notes_api`
- User: `notes_user`
- Password: `notes_password`
- Port: `5432`

### 3. Configure Environment

```bash
# Copy and update .env
cp .env.example .env
```

Update `.env` with Docker PostgreSQL credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_api
DB_USER=notes_user
DB_PASSWORD=notes_password
```

### 4. Run Migrations

```bash
bun run migrate:up
```

### 5. Start the Server

```bash
bun run dev
```

The API is now running at `http://localhost:3000` 🎉

## Option 2: Manual PostgreSQL Setup

### 1. Install PostgreSQL

Follow the [PostgreSQL installation guide](https://www.postgresql.org/download/) for your OS.

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE notes_api;

# Create user (optional)
CREATE USER notes_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE notes_api TO notes_user;

# Exit
\q
```

### 3. Follow Steps 1, 3, 4, 5 from Option 1

Update `.env` with your PostgreSQL credentials.

## Test the API

### 1. Check Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123"
  }'
```

Save the `token` from the response!

### 3. Create a Note

Replace `YOUR_TOKEN` with the token from step 2:

```bash
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "My First Note",
    "content": "Hello from Notes API!",
    "tags": ["test", "first-note"]
  }'
```

### 4. Get Your Notes

```bash
curl http://localhost:3000/api/v1/notes \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## What's Next?

### Explore the API

- 📖 Read the full [API Documentation](README.md#api-documentation)
- 🔍 Try [API Examples](API_EXAMPLES.md)
- 🏗️ Learn about the [Architecture](ARCHITECTURE.md)

### Development

```bash
# Run tests
bun test

# Run with hot reload
bun run dev

# Run in production mode
bun run start
```

### Key Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/auth/register` | POST | Register new user |
| `/api/v1/auth/login` | POST | Login user |
| `/api/v1/notes` | GET | List all notes |
| `/api/v1/notes` | POST | Create note |
| `/api/v1/notes/:id` | GET | Get note |
| `/api/v1/notes/:id` | PUT | Update note |
| `/api/v1/notes/:id` | DELETE | Delete note |
| `/api/v1/notes/search` | POST | Search notes |
| `/api/v1/workspaces` | GET | List workspaces |
| `/api/v1/tags` | GET | List tags |
| `/api/v1/sharing/shared-with-me` | GET | Shared notes |

## Common Issues

### Database Connection Failed

**Problem**: Can't connect to PostgreSQL

**Solutions**:
1. Make sure PostgreSQL is running: `docker-compose ps` or `pg_isready`
2. Check credentials in `.env`
3. Verify PostgreSQL is listening on port 5432

### Port Already in Use

**Problem**: Port 3000 is already taken

**Solution**: Change `PORT` in `.env`:
```env
PORT=3001
```

### Migration Failed

**Problem**: Database migration errors

**Solutions**:
1. Check database exists: `psql -U postgres -l`
2. Check user has permissions
3. Drop and recreate database (dev only):
   ```sql
   DROP DATABASE notes_api;
   CREATE DATABASE notes_api;
   ```
4. Run migrations again: `bun run migrate:up`

### JWT Token Invalid

**Problem**: Getting 401 Unauthorized

**Solutions**:
1. Check token is included in header: `Authorization: Bearer <token>`
2. Token might be expired (7 days default) - login again
3. Check `JWT_SECRET` matches between server restarts

## Using with Postman/Insomnia

### 1. Import Collection

Create a new collection with these variables:
- `baseUrl`: `http://localhost:3000/api/v1`
- `token`: (will be set after login)

### 2. Authentication

**Register/Login Request**:
```
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Save token from response** to the `token` variable.

### 3. Authenticated Requests

For all other requests, add header:
```
Authorization: Bearer {{token}}
```

## Production Deployment

### Environment Variables

Update `.env` for production:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<generate-strong-secret>
DB_HOST=<production-db-host>
DB_PASSWORD=<strong-db-password>
CORS_ORIGIN=https://yourdomain.com
```

### Generate Strong JWT Secret

```bash
openssl rand -base64 32
```

### Run in Production

```bash
# Set environment
export NODE_ENV=production

# Run migrations
bun run migrate:up

# Start server
bun run start
```

### Use Process Manager

**With PM2** (Node.js process manager):
```bash
pm2 start "bun run start" --name notes-api
pm2 save
pm2 startup
```

## Need Help?

- 📖 [Full Documentation](README.md)
- 🔧 [Architecture Details](ARCHITECTURE.md)
- 💡 [API Examples](API_EXAMPLES.md)
- 🤝 [Contributing Guide](CONTRIBUTING.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)

## Next Steps

1. ✅ API is running
2. 📝 Create some notes
3. 🏷️ Organize with tags and workspaces
4. 🤝 Share notes with other users
5. 🔍 Try full-text search
6. 🧪 Run the tests
7. 🚀 Deploy to production

Happy coding! 🎉
