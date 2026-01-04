# Changelog

All notable changes to the Notes API project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-15

### 🎉 Initial Release

Complete Notes/Knowledge Base API built with Bun.js, Elysia.js, and PostgreSQL.

### Added

#### Authentication
- User registration with email, username, and password
- User login with JWT token generation
- JWT-based authentication middleware
- Password hashing with bcryptjs (10 salt rounds)
- Bearer token authentication

#### Notes Management
- Create notes with title and Markdown content
- Retrieve single note by ID
- List all user notes with pagination
- Update note title, content, or workspace
- Soft delete notes (recoverable)
- Note metadata (created_at, updated_at, owner)
- Assign notes to workspaces

#### Tagging System
- Add multiple tags to notes
- Remove tags from notes
- Create standalone tags
- List all user tags
- Get tag with note count
- Delete tags
- Query notes by tags
- Automatic tag normalization (lowercase)
- Many-to-many tag-note relationship

#### Workspaces
- Create workspaces/folders for organization
- List all user workspaces
- Get workspace with note count
- Update workspace details
- Delete workspaces
- Organize notes in workspaces

#### Search & Filtering
- Full-text search across note title and content
- Search by tags (single or multiple)
- Filter by date range (startDate, endDate)
- Filter by workspace
- Combined search with multiple criteria
- Pagination support for search results
- PostgreSQL GIN indexes for performance

#### Sharing
- Share notes with other users
- Set permissions (read or edit)
- Update share permissions
- Unshare notes
- List notes shared with me
- List notes I've shared
- View all shares for a specific note
- Permission enforcement for shared notes

#### Database
- PostgreSQL schema with 6 tables
- UUID primary keys
- Foreign key constraints with cascade deletes
- Automatic timestamps with triggers
- Soft delete support
- Full-text search indexes (GIN)
- Performance indexes on common queries
- Connection pooling (2-10 connections)
- Database migration system
- Migration rollback support

#### API Features
- RESTful API design
- Consistent JSON response format
- Proper HTTP status codes
- Input validation with Elysia schemas
- CORS support
- Error handling middleware
- Health check endpoint
- API versioning (/api/v1)

#### Code Quality
- TypeScript strict mode
- Modular architecture (controllers, services, middleware)
- Clean separation of concerns
- Parameterized queries (SQL injection prevention)
- Input validation on all endpoints
- Proper error handling and propagation
- Consistent naming conventions
- Self-documenting code

#### Testing
- Bun test runner integration
- Unit tests for utilities (13 tests)
  - Password hashing and comparison
  - Input validation
  - Response formatting
- Integration test framework
  - Authentication flow tests
- Test database configuration
- All tests passing

#### Documentation
- Comprehensive README with setup instructions
- API endpoint documentation with examples
- PostgreSQL setup guide
- Quick Start Guide (QUICKSTART.md)
- API Examples (API_EXAMPLES.md)
- Architecture Documentation (ARCHITECTURE.md)
- Contributing Guidelines (CONTRIBUTING.md)
- Environment file examples
- JSDoc comments on key functions

#### DevOps
- Docker Compose for PostgreSQL
- Environment configuration (.env support)
- Setup script for automated configuration
- Multiple environment support (dev, test, prod)
- Git workflow setup
- Package.json scripts for common tasks

### Technical Details

#### Dependencies
- **Runtime**: Bun.js 1.3+
- **Framework**: Elysia.js 1.4+
- **Database**: PostgreSQL 14+
- **DB Client**: postgres.js 3.4+
- **Security**: bcryptjs 3.0+
- **Auth**: @elysiajs/jwt 1.4+
- **TypeScript**: 5.9+

#### Performance
- Connection pooling (configurable 2-10 connections)
- Database indexes on frequently queried columns
- Full-text search with GIN indexes
- Pagination to limit result sets
- Efficient query patterns
- Optimized TypeScript compilation

#### Security
- Password hashing with bcrypt
- JWT authentication with configurable expiry
- Parameterized database queries
- Input validation on all endpoints
- CORS configuration
- Protected routes with middleware
- User resource isolation

### File Structure

```
notes-api/
├── src/                      # Source code
│   ├── config/              # Configuration
│   ├── controllers/         # HTTP handlers (5 controllers)
│   ├── services/            # Business logic (5 services)
│   ├── middleware/          # Middleware (auth)
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Utility functions (3 utils)
│   ├── db/                  # Database & migrations
│   └── index.ts             # Entry point
├── tests/                   # Test suite
│   ├── unit/               # Unit tests (13 tests)
│   └── integration/        # Integration tests
├── scripts/                # Utility scripts
├── docs/                   # Additional documentation
└── config files            # Various configuration
```

### API Endpoints (25+)

#### Authentication (2)
- POST /api/v1/auth/register
- POST /api/v1/auth/login

#### Notes (8)
- POST /api/v1/notes
- GET /api/v1/notes
- GET /api/v1/notes/:id
- PUT /api/v1/notes/:id
- DELETE /api/v1/notes/:id
- POST /api/v1/notes/search
- POST /api/v1/notes/:id/tags
- DELETE /api/v1/notes/:id/tags/:tagName

#### Workspaces (5)
- POST /api/v1/workspaces
- GET /api/v1/workspaces
- GET /api/v1/workspaces/:id
- PUT /api/v1/workspaces/:id
- DELETE /api/v1/workspaces/:id

#### Tags (4)
- GET /api/v1/tags
- POST /api/v1/tags
- GET /api/v1/tags/:id
- DELETE /api/v1/tags/:id

#### Sharing (5)
- POST /api/v1/sharing/notes/:noteId/share
- DELETE /api/v1/sharing/notes/:noteId/share/:userId
- GET /api/v1/sharing/shared-with-me
- GET /api/v1/sharing/shared-by-me
- GET /api/v1/sharing/notes/:noteId/shares

#### System (2)
- GET /health
- GET /

### Known Limitations

- No rate limiting (should be added for production)
- No request logging (should be added for production)
- No email verification (can be added)
- No password reset (can be added)
- No file attachments (can be added)
- No real-time updates (can be added with WebSocket)

### Future Enhancements

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed future enhancements including:
- Redis caching
- Rate limiting
- Request logging
- Email notifications
- File attachments
- Real-time collaboration
- Version history
- Note templates
- Export functionality
- Mobile API optimizations

---

## [Unreleased]

### Planned Features
- Rate limiting middleware
- Request logging
- Email verification
- Password reset functionality
- File attachments support
- Note templates
- Export to PDF/Markdown
- Version history for notes
- Real-time collaboration

---

## Release Notes

### Version 1.0.0 - Production Ready

This is the first production-ready release of the Notes API. It includes all core functionality for a complete knowledge base system:

✅ **Fully Functional**: All 25+ endpoints working
✅ **Well Tested**: 13 unit tests passing
✅ **Documented**: Comprehensive documentation
✅ **Secure**: JWT auth, password hashing, SQL injection prevention
✅ **Scalable**: Connection pooling, indexed queries
✅ **Maintainable**: Clean architecture, TypeScript strict mode

### Installation

See [QUICKSTART.md](QUICKSTART.md) for installation instructions.

### Upgrade Notes

This is the initial release, no upgrade path needed.

---

For more information, see:
- [README.md](README.md) - Main documentation
- [QUICKSTART.md](QUICKSTART.md) - Getting started
- [API_EXAMPLES.md](API_EXAMPLES.md) - API usage examples
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - How to contribute
