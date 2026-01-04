# Notes API - Knowledge Base

A full-featured Notes/Knowledge Base API built with **Bun.js**, **Elysia.js**, **Supabase Auth**, and **Supabase PostgreSQL**. This API provides comprehensive functionality for creating, organizing, searching, and sharing notes with a robust tagging system.

## 🚀 Features

### Core Functionality
- ✅ **User Authentication** - Supabase Auth with email/password and OAuth providers
- ✅ **Notes Management** - Full CRUD operations for notes with Markdown support
- ✅ **Tagging System** - Organize notes with customizable tags
- ✅ **Workspaces** - Group notes into workspaces/folders
- ✅ **Full-Text Search** - Search notes by content, title, tags, and date range
- ✅ **Sharing** - Share notes with other users with read/edit permissions
- ✅ **Soft Delete** - Safe deletion with recovery options
- ✅ **Pagination** - Efficient data handling for large datasets

### Technical Features
- ✅ TypeScript strict mode
- ✅ Supabase PostgreSQL with connection pooling
- ✅ Row Level Security (RLS) policies
- ✅ Database migrations
- ✅ Input validation
- ✅ Consistent error handling
- ✅ Unit and integration tests
- ✅ Modular architecture
- ✅ Supabase Auth integration

## 📋 Prerequisites

- [Bun](https://bun.sh/) >= 1.0.0
- [Supabase](https://supabase.com/) account and project
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

### 3. Set up Supabase

#### Create a Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Note down your project URL and anon key from Settings > API

#### Set up Database Schema

The application will automatically create the required tables when you run migrations, but you can also set them up manually in the Supabase SQL editor:

```sql
-- The schema will be created automatically by migrations
-- See src/db/schema.sql for the complete schema
```

### 4. Configure environment variables

Copy the example environment file and update it with your Supabase settings:

```bash
cp .env.example .env
```

Edit `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration (for direct PostgreSQL access with Supabase connection)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres
DB_HOST=db.[YOUR-PROJECT].supabase.co
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=[YOUR-DATABASE-PASSWORD]
DB_POOL_MIN=2
DB_POOL_MAX=10

# API Configuration
API_PREFIX=/api/v1
CORS_ORIGIN=*
```

#### Getting Supabase Credentials

1. **Project URL**: Found in Settings > API > Project URL
2. **Anon Key**: Found in Settings > API > Project API keys > anon public
3. **Service Role Key**: Found in Settings > API > Project API keys > service_role (keep this secret!)

### 5. Run database migrations

```bash
bun run migrate:up
```

To rollback migrations:

```bash
bun run migrate:down
```

### 6. Set up Row Level Security (RLS)

After running migrations, RLS policies will be automatically applied. These policies ensure that:

- Users can only access their own data
- Shared notes respect read/edit permissions
- All database access is secured at the database level

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

### Authentication

This API uses Supabase Auth. Register and login endpoints provide JWT tokens that should be included in the Authorization header:

```http
Authorization: Bearer <token>
```

### Endpoints

#### Authentication

##### Register a new user

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "securepassword"
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
      "created_at": "2023-01-01T00:00:00Z",
      "updated_at": "2023-01-01T00:00:00Z"
    },
    "token": "jwt-token"
  },
  "message": "User registered successfully"
}
```

##### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

##### Logout

```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

#### Notes Management

##### Get all notes

```http
GET /api/v1/notes
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search in title and content
- `tags` (optional): Filter by tags (comma-separated)
- `workspace_id` (optional): Filter by workspace
- `start_date` (optional): Filter from date (ISO string)
- `end_date` (optional): Filter to date (ISO string)

##### Get a single note

```http
GET /api/v1/notes/:id
Authorization: Bearer <token>
```

##### Create a note

```http
POST /api/v1/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Note Title",
  "content": "Note content in markdown",
  "workspace_id": "workspace-uuid (optional)",
  "tags": ["tag1", "tag2"]
}
```

##### Update a note

```http
PUT /api/v1/notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "content": "Updated content"
}
```

##### Delete a note (soft delete)

```http
DELETE /api/v1/notes/:id
Authorization: Bearer <token>
```

##### Restore a deleted note

```http
PATCH /api/v1/notes/:id/restore
Authorization: Bearer <token>
```

##### Permanently delete a note

```http
DELETE /api/v1/notes/:id/permanent
Authorization: Bearer <token>
```

#### Workspaces

##### Get all workspaces

```http
GET /api/v1/workspaces
Authorization: Bearer <token>
```

##### Create a workspace

```http
POST /api/v1/workspaces
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "My Workspace",
  "description": "Workspace description"
}
```

##### Update a workspace

```http
PUT /api/v1/workspaces/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Workspace Name",
  "description": "Updated description"
}
```

##### Delete a workspace

```http
DELETE /api/v1/workspaces/:id
Authorization: Bearer <token>
```

#### Tags

##### Get all tags

```http
GET /api/v1/tags
Authorization: Bearer <token>
```

##### Create a tag

```http
POST /api/v1/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "my-tag"
}
```

##### Delete a tag

```http
DELETE /api/v1/tags/:id
Authorization: Bearer <token>
```

#### Sharing

##### Share a note

```http
POST /api/v1/sharing/share
Authorization: Bearer <token>
Content-Type: application/json

{
  "note_id": "note-uuid",
  "user_id": "user-uuid",
  "permission": "read"
}
```

##### Revoke access to a note

```http
DELETE /api/v1/sharing/notes/:noteId/users/:userId
Authorization: Bearer <token>
```

##### Get notes shared with me

```http
GET /api/v1/sharing/shared-with-me
Authorization: Bearer <token>
```

##### Get notes I've shared

```http
GET /api/v1/sharing/shared-by-me
Authorization: Bearer <token>
```

##### Get all shares for a note

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
│   │   ├── env.ts           # Environment configuration
│   │   └── supabase.ts      # Supabase client configuration
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
│   │   └── index.ts         # TypeScript types & interfaces
│   ├── utils/
│   │   ├── validation.ts    # Input validation
│   │   └── response.ts      # Response formatters
│   ├── db/
│   │   ├── schema.sql       # Database schema
│   │   ├── migrate.ts       # Migration runner
│   │   └── migrations/
│   │       ├── 001_initial_schema.ts
│   │       └── 002_setup_rls_policies.ts
│   └── index.ts             # Application entry point
├── tests/
│   ├── unit/
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

- **users** - User accounts (managed by Supabase Auth + profile data)
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
- Row Level Security (RLS) policies for data protection

### Row Level Security

Supabase RLS policies ensure:

1. **Users can only access their own data** unless explicitly shared
2. **Shared notes respect permissions** (read vs edit)
3. **Database-level security** that works even if API is bypassed
4. **Automatic user context** through Supabase auth

## 🔒 Security Features

- Supabase Auth with JWT tokens
- Row Level Security (RLS) policies
- Protected routes with middleware
- Input validation on all endpoints
- SQL injection protection (parameterized queries)
- CORS configuration
- Environment variable protection

## 🔧 Supabase Integration Details

### Authentication Flow

1. **Registration/Login**: Uses Supabase Auth methods
2. **Token Validation**: JWT tokens verified with Supabase
3. **User Context**: Automatically available through `auth.uid()`
4. **Session Management**: Handled by Supabase client

### Database Access

- **Direct PostgreSQL**: Uses postgres.js for complex queries
- **Supabase Client**: Used for auth operations
- **RLS Policies**: Secure all database access
- **Service Role**: Admin operations when needed

### Migration Strategy

- **Schema Migrations**: Create and update database structure
- **RLS Policies**: Secure data access at database level
- **Backward Compatibility**: Optional fields for gradual migration

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

### Supabase CLI (Optional)

For local development with Supabase:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Start local development (optional)
supabase start
```

### Environment Variables

Ensure all required environment variables are set:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)
- `DATABASE_URL` - PostgreSQL connection string for direct access

## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

### Common Issues

**Supabase Connection Failed**
- Check your Supabase URL and keys
- Ensure your Supabase project is active
- Verify network connectivity

**RLS Policy Errors**
- Ensure migrations ran successfully
- Check that RLS is enabled on all tables
- Verify user is authenticated

**Migration Errors**
- Ensure database connection is working
- Check that schema doesn't conflict with existing data
- Verify Supabase service role permissions

---

Made with ❤️ using Bun.js, Elysia.js, and Supabase