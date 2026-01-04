# Notes API - Architecture Documentation

## Overview

The Notes API is a full-featured Knowledge Base system built with modern technologies and following best practices for scalability, maintainability, and security.

## Technology Stack

### Runtime & Framework
- **Bun.js** - Fast JavaScript runtime with built-in TypeScript support
- **Elysia.js** - Lightweight and performant web framework
- **TypeScript** - Type-safe development with strict mode enabled

### Database
- **PostgreSQL** - Relational database for data persistence
- **postgres.js** - High-performance PostgreSQL client with connection pooling

### Security
- **bcryptjs** - Password hashing
- **@elysiajs/jwt** - JWT authentication
- **@elysiajs/bearer** - Bearer token handling

### Development
- **Bun Test** - Built-in test runner
- **TypeScript Compiler** - Type checking

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│                  (HTTP/REST Requests)                        │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                     API Layer (Elysia)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Middleware: CORS, Error Handling, JWT Auth          │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Controllers: Auth, Notes, Workspaces, Tags, Sharing │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                   Business Logic Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services: User, Note, Workspace, Tag, Sharing       │  │
│  │  - Business rules validation                         │  │
│  │  - Data transformation                               │  │
│  │  - Orchestration                                     │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                      Data Access Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Client (postgres.js)                     │  │
│  │  - Connection pooling                                │  │
│  │  - Parameterized queries                             │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  - Users, Notes, Workspaces, Tags, Shared Notes            │
│  - Full-text search indexes                                 │
│  - Foreign key constraints                                  │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
notes-api/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.ts   # DB connection & pooling
│   │   └── env.ts        # Environment variables
│   │
│   ├── controllers/      # HTTP request handlers
│   │   ├── auth.controller.ts
│   │   ├── note.controller.ts
│   │   ├── workspace.controller.ts
│   │   ├── sharing.controller.ts
│   │   └── tag.controller.ts
│   │
│   ├── services/         # Business logic
│   │   ├── user.service.ts
│   │   ├── note.service.ts
│   │   ├── workspace.service.ts
│   │   ├── sharing.service.ts
│   │   └── tag.service.ts
│   │
│   ├── middleware/       # Cross-cutting concerns
│   │   └── auth.middleware.ts
│   │
│   ├── types/            # TypeScript definitions
│   │   └── index.ts
│   │
│   ├── utils/            # Utility functions
│   │   ├── password.ts
│   │   ├── validation.ts
│   │   └── response.ts
│   │
│   ├── db/               # Database related
│   │   ├── schema.sql
│   │   ├── migrate.ts
│   │   └── migrations/
│   │       └── 001_initial_schema.ts
│   │
│   └── index.ts          # Application entry point
│
├── tests/
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
│
└── scripts/              # Utility scripts
    └── setup.sh
```

## Layer Responsibilities

### Controllers
- **Purpose**: Handle HTTP requests and responses
- **Responsibilities**:
  - Request validation (using Elysia schemas)
  - Authentication check
  - Call appropriate service methods
  - Format responses
  - Error handling
- **Rules**:
  - No business logic
  - No direct database access
  - Minimal data transformation

### Services
- **Purpose**: Implement business logic
- **Responsibilities**:
  - Business rules enforcement
  - Data validation
  - Database operations
  - Transaction management
  - Complex data transformations
- **Rules**:
  - No HTTP-specific code
  - Throw errors for invalid operations
  - Return domain objects

### Middleware
- **Purpose**: Cross-cutting concerns
- **Responsibilities**:
  - Authentication
  - Authorization
  - Request logging
  - Error handling
  - CORS handling

### Utils
- **Purpose**: Reusable utility functions
- **Responsibilities**:
  - Pure functions
  - No side effects
  - Single responsibility

## Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│    Users    │
│─────────────│
│ id (PK)     │◄─────┐
│ email       │      │
│ username    │      │
│ password    │      │
└─────────────┘      │
       ▲             │
       │             │
       │             │
┌──────┴──────┐      │
│ Workspaces  │      │
│─────────────│      │
│ id (PK)     │      │
│ name        │      │
│ user_id(FK) ├──────┘
└─────────────┘
       ▲
       │
       │
┌──────┴──────┐
│    Notes    │
│─────────────│
│ id (PK)     │◄───────┐
│ title       │        │
│ content     │        │
│ user_id(FK) ├────┐   │
│workspace_id │    │   │
│ is_deleted  │    │   │
└─────────────┘    │   │
       ▲           │   │
       │           │   │
       │           │   │
┌──────┴────────┐  │   │
│  Note_Tags    │  │   │
│───────────────│  │   │
│ note_id (FK)  ├──┘   │
│ tag_id (FK)   ├──┐   │
└───────────────┘  │   │
                   │   │
┌────────────┐     │   │
│    Tags    │     │   │
│────────────│     │   │
│ id (PK)    │◄────┘   │
│ name       │         │
│ user_id(FK)├─────────┘
└────────────┘
       
┌──────────────┐
│ Shared_Notes │
│──────────────│
│ id (PK)      │
│ note_id (FK) ├──────┐
│ shared_with  │      │
│ shared_by    │      └──► References Notes
│ permission   │
└──────────────┘
```

### Key Design Decisions

1. **UUID Primary Keys**: Better for distributed systems and security
2. **Soft Delete**: `is_deleted` flag instead of hard deletes
3. **Full-Text Search**: GIN indexes on content and title
4. **Timestamps**: Automatic `created_at` and `updated_at` via triggers
5. **Cascade Deletes**: User deletion cascades to all related entities

## Data Flow

### Create Note Example

```
1. Client Request
   POST /api/v1/notes
   Headers: { Authorization: Bearer <token> }
   Body: { title, content, tags[] }
   
2. Middleware Layer
   - CORS check
   - JWT validation
   - Extract user from token
   
3. Controller (note.controller.ts)
   - Validate request body schema
   - Extract user from context
   - Call noteService.createNote()
   
4. Service (note.service.ts)
   - Validate business rules
   - Create note in database
   - Create/link tags
   - Return note with tags
   
5. Controller
   - Format response
   - Return 201 Created
   
6. Client Response
   { success: true, data: note }
```

## Security Architecture

### Authentication Flow

```
┌──────────┐                                   ┌──────────┐
│  Client  │                                   │   API    │
└────┬─────┘                                   └────┬─────┘
     │                                              │
     │  1. POST /auth/register or /auth/login      │
     ├──────────────────────────────────────────►  │
     │     { email, password }                     │
     │                                              │
     │  2. Hash password with bcrypt               │
     │     (10 salt rounds)                        │
     │                                              ▼
     │                                         ┌─────────┐
     │  3. Query database                      │   DB    │
     │                                         └────┬────┘
     │                                              ▲
     │  4. Generate JWT token                      │
     │     Payload: { userId, email, username }    │
     │     Secret: from .env                       │
     │     Expiry: 7 days                          │
     │                                              │
     │  5. Return user + token                     │
     │ ◄────────────────────────────────────────── │
     │     { data: { user, token } }               │
     │                                              │
     │  6. Store token in client                   │
     │                                              │
     │  7. Include token in subsequent requests    │
     ├──────────────────────────────────────────►  │
     │     Authorization: Bearer <token>           │
     │                                              │
     │  8. Verify token with JWT secret            │
     │     Extract user info from payload          │
     │     Check expiry                            │
     │                                              │
     │  9. Allow/Deny request                      │
     │                                              │
```

### Security Measures

1. **Password Security**
   - Bcrypt hashing with 10 salt rounds
   - Never store plain text passwords
   - Password minimum length: 8 characters

2. **JWT Security**
   - Secret key from environment variable
   - Token expiry (7 days default)
   - Stateless authentication

3. **Database Security**
   - Parameterized queries (SQL injection prevention)
   - Connection pooling with limits
   - Prepared statements

4. **Authorization**
   - User can only access their own resources
   - Share permissions (read/edit) enforced
   - Middleware guards protected routes

5. **Input Validation**
   - Schema validation on all endpoints
   - Email format validation
   - String length limits
   - Type checking

## Performance Optimizations

### Database
1. **Indexes**
   - Primary keys (UUID)
   - Foreign keys
   - Full-text search (GIN indexes)
   - Common query columns

2. **Connection Pooling**
   - Min: 2 connections
   - Max: 10 connections
   - Idle timeout: 20s

3. **Query Optimization**
   - Use of indexes
   - Limit result sets
   - Pagination
   - Select only needed columns

### Application
1. **Efficient TypeScript**
   - Strict mode for optimization
   - No unnecessary type conversions

2. **Response Format**
   - Consistent JSON structure
   - Minimal payload size

3. **Error Handling**
   - Early returns
   - Proper error propagation

## Scalability Considerations

### Horizontal Scaling
- Stateless authentication (JWT)
- No server-side sessions
- Database connection pooling

### Vertical Scaling
- Efficient queries
- Indexed searches
- Connection limits

### Future Enhancements
- Redis caching layer
- Read replicas for database
- CDN for static assets
- Message queue for async tasks
- Rate limiting
- Request throttling

## Testing Strategy

### Unit Tests
- **What**: Individual functions and methods
- **Where**: `tests/unit/`
- **Coverage**: Utils, validation, password hashing

### Integration Tests
- **What**: API endpoints end-to-end
- **Where**: `tests/integration/`
- **Coverage**: Authentication, CRUD operations

### Test Database
- Separate test database
- Clean state before each test
- Use `.env.test` configuration

## Error Handling

### Error Flow

```
Controller → Service → Database
   ↓           ↓          ↓
 Error ← ← ← ← ← ← ← ← ← Error
   ↓
Format Error Response
   ↓
Return to Client
```

### Error Types
1. **Validation Errors** (400)
   - Invalid input format
   - Missing required fields

2. **Authentication Errors** (401)
   - Invalid token
   - Expired token
   - Missing token

3. **Authorization Errors** (403)
   - Insufficient permissions

4. **Not Found Errors** (404)
   - Resource doesn't exist

5. **Server Errors** (500)
   - Database errors
   - Unexpected errors

## Monitoring and Logging

### Current Implementation
- Console logging for errors
- Database connection status
- Health check endpoint

### Recommended Additions
- Structured logging (JSON)
- Log aggregation (ELK stack)
- APM (Application Performance Monitoring)
- Error tracking (Sentry)
- Metrics collection (Prometheus)

## Deployment

### Prerequisites
- Bun.js installed
- PostgreSQL database
- Environment variables configured

### Steps
1. Install dependencies: `bun install`
2. Configure `.env` file
3. Run migrations: `bun run migrate:up`
4. Start server: `bun run start`

### Production Considerations
- Use process manager (PM2, systemd)
- Set NODE_ENV=production
- Use strong JWT secret
- Enable HTTPS
- Configure firewall
- Set up monitoring
- Regular database backups
- Log rotation

## API Versioning

Current version: `v1`
- All endpoints prefixed with `/api/v1`
- Future versions: `/api/v2`, etc.
- Version in URL for clarity
- Maintain backward compatibility within version

## Conclusion

This architecture provides a solid foundation for a scalable, maintainable, and secure Notes API. The layered approach ensures separation of concerns, making it easy to:

- Add new features
- Write tests
- Debug issues
- Scale the application
- Onboard new developers

The use of modern technologies (Bun.js, Elysia.js, PostgreSQL) ensures good performance and developer experience.
