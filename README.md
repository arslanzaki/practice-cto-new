# Notes API - Knowledge Base

A full-featured Notes/Knowledge Base API built with **Bun.js**, **Elysia.js**, and **PostgreSQL**. This API provides comprehensive functionality for creating, organizing, searching, and sharing notes with a robust tagging system.

## 🚀 Features

### Core Functionality
- ✅ **User Authentication** - JWT-based authentication with secure password hashing
- ✅ **Notes Management** - Full CRUD operations for notes with Markdown support
- ✅ **Tagging System** - Organize notes with customizable tags
- ✅ **Workspaces** - Group notes into workspaces/folders
- ✅ **Full-Text Search** - Search notes by content, title, tags, and date range
- ✅ **Sharing** - Share notes with other users with read/edit permissions
- ✅ **Soft Delete** - Safe deletion with recovery options
- ✅ **Pagination** - Efficient data handling for large datasets

### Technical Features
- ✅ TypeScript strict mode
- ✅ PostgreSQL with connection pooling
- ✅ Database migrations
- ✅ Input validation
- ✅ Consistent error handling
- ✅ Unit and integration tests
- ✅ Modular architecture

## 📋 Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [PostgreSQL](https://www.postgresql.org/) >= 14.0
- Node.js knowledge (optional, for understanding)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd notes-api
```

### 2. Install dependencies

```bash
bun install
```

### 3. Set up PostgreSQL

Create a PostgreSQL database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE notes_api;

# Create user (optional)
CREATE USER notes_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE notes_api TO notes_user;
```

### 4. Configure environment variables

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/notes_api
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notes_api
DB_USER=your_username
DB_PASSWORD=your_password
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# API Configuration
API_PREFIX=/api/v1
CORS_ORIGIN=*
```

### 5. Run database migrations

```bash
bun run migrate:up
```

To rollback migrations:

```bash
bun run migrate:down
```

## 🚦 Running the Application

### Development mode (with hot reload)

```bash
bun run dev
```

### Production mode

```bash
bun run start
```

The API will be available at `http://localhost:3000` (or your configured PORT).

## 🧪 Testing

### Run all tests

```bash
bun test
```

### Run unit tests only

```bash
bun run test:unit
```

### Run integration tests only

```bash
bun run test:integration
```

## 📚 API Documentation

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication Endpoints

#### Register a new user

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token"
  },
  "message": "User registered successfully"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Notes Endpoints

All notes endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

#### Create a note

```http
POST /api/v1/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "# Note content in Markdown\n\nThis is my note.",
  "workspace_id": "uuid (optional)",
  "tags": ["tag1", "tag2"] // optional
}
```

#### Get all notes (with pagination)

```http
GET /api/v1/notes?page=1&limit=20
Authorization: Bearer <token>
```

#### Get a specific note

```http
GET /api/v1/notes/:id
Authorization: Bearer <token>
```

#### Update a note

```http
PUT /api/v1/notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content",
  "workspace_id": "uuid (optional)"
}
```

#### Delete a note (soft delete)

```http
DELETE /api/v1/notes/:id
Authorization: Bearer <token>
```

#### Search notes

```http
POST /api/v1/notes/search?page=1&limit=20
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "search term",
  "tags": ["tag1"],
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "workspaceId": "uuid"
}
```

#### Add tags to a note

```http
POST /api/v1/notes/:id/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tags": ["tag1", "tag2"]
}
```

#### Remove a tag from a note

```http
DELETE /api/v1/notes/:id/tags/:tagName
Authorization: Bearer <token>
```

### Workspace Endpoints

#### Create workspace

```http
POST /api/v1/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Personal",
  "description": "My personal notes" // optional
}
```

#### Get all workspaces

```http
GET /api/v1/workspaces
Authorization: Bearer <token>
```

#### Get workspace by ID

```http
GET /api/v1/workspaces/:id
Authorization: Bearer <token>
```

#### Update workspace

```http
PUT /api/v1/workspaces/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete workspace

```http
DELETE /api/v1/workspaces/:id
Authorization: Bearer <token>
```

### Tag Endpoints

#### Get all tags

```http
GET /api/v1/tags
Authorization: Bearer <token>
```

#### Create tag

```http
POST /api/v1/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "important"
}
```

#### Get tag by ID (with note count)

```http
GET /api/v1/tags/:id
Authorization: Bearer <token>
```

#### Delete tag

```http
DELETE /api/v1/tags/:id
Authorization: Bearer <token>
```

### Sharing Endpoints

#### Share a note

```http
POST /api/v1/sharing/notes/:noteId/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "user_id": "uuid",
  "permission": "read" // or "edit"
}
```

#### Unshare a note

```http
DELETE /api/v1/sharing/notes/:noteId/share/:userId
Authorization: Bearer <token>
```

#### Get notes shared with me

```http
GET /api/v1/sharing/shared-with-me
Authorization: Bearer <token>
```

#### Get notes I've shared

```http
GET /api/v1/sharing/shared-by-me
Authorization: Bearer <token>
```

#### Get all shares for a note

```http
GET /api/v1/sharing/notes/:noteId/shares
Authorization: Bearer <token>
```

## 🏗️ Project Structure

```
notes-api/
├── src/
│   ├── config/
│   │   ├── database.ts      # PostgreSQL connection & pooling
│   │   └── env.ts            # Environment configuration
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── note.controller.ts
│   │   ├── workspace.controller.ts
│   │   ├── sharing.controller.ts
│   │   └── tag.controller.ts
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── note.service.ts
│   │   ├── workspace.service.ts
│   │   ├── sharing.service.ts
│   │   └── tag.service.ts
│   ├── middleware/
│   │   └── auth.middleware.ts
│   ├── types/
│   │   └── index.ts          # TypeScript types & interfaces
│   ├── utils/
│   │   ├── password.ts       # Password hashing utilities
│   │   ├── validation.ts     # Input validation
│   │   └── response.ts       # Response formatters
│   ├── db/
│   │   ├── schema.sql        # Database schema
│   │   ├── migrate.ts        # Migration runner
│   │   └── migrations/
│   │       └── 001_initial_schema.ts
│   └── index.ts              # Application entry point
├── tests/
│   ├── unit/
│   │   ├── password.test.ts
│   │   ├── validation.test.ts
│   │   └── response.test.ts
│   └── integration/
│       └── auth.test.ts
├── .env.example
├── .env
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🗄️ Database Schema

### Tables

- **users** - User accounts
- **notes** - Note entries with soft delete support
- **workspaces** - Organizational folders for notes
- **tags** - User-defined tags
- **note_tags** - Many-to-many relationship between notes and tags
- **shared_notes** - Note sharing with permissions

### Key Features

- UUID primary keys
- Automatic timestamps (created_at, updated_at)
- Full-text search indexes on note content and titles
- Foreign key constraints with cascade deletes
- Optimized indexes for common queries

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT-based authentication
- Protected routes with middleware
- Input validation on all endpoints
- SQL injection protection (parameterized queries)
- CORS configuration

## 📊 Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

## 🧑‍💻 Development

### Adding a New Migration

1. Create a new migration file in `src/db/migrations/`
2. Export `up()` and `down()` functions
3. Add the migration to the migrations array in `src/db/migrate.ts`
4. Run `bun run migrate:up`

### Running in Docker (Optional)

You can use Docker Compose to run PostgreSQL:

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: notes_api
      POSTGRES_USER: notes_user
      POSTGRES_PASSWORD: your_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Run with:

```bash
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning or production.

## 🙏 Acknowledgments

- Built with [Bun.js](https://bun.sh/)
- Framework: [Elysia.js](https://elysiajs.com/)
- Database: [PostgreSQL](https://www.postgresql.org/)
- Database Client: [postgres.js](https://github.com/porsager/postgres)

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

Made with ❤️ using Bun.js and Elysia.js
