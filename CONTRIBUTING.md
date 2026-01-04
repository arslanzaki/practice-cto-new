# Contributing to Notes API

Thank you for your interest in contributing to the Notes API! This document provides guidelines and instructions for contributing to the project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/notes-api.git
   cd notes-api
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up your environment**
   ```bash
   cp .env.example .env
   # Update .env with your local PostgreSQL credentials
   ```

4. **Start PostgreSQL**
   ```bash
   docker-compose up -d
   ```

5. **Run migrations**
   ```bash
   bun run migrate:up
   ```

6. **Run tests**
   ```bash
   bun test
   ```

## Code Style and Standards

### TypeScript

- Use **TypeScript strict mode** (already configured)
- Define explicit types for all function parameters and return values
- Avoid using `any` type - use `unknown` if truly dynamic
- Use interfaces for object shapes
- Use type aliases for unions and complex types

### Code Organization

- **Controllers**: Handle HTTP requests/responses, validation, and call services
- **Services**: Contain business logic and database operations
- **Middleware**: Handle cross-cutting concerns (auth, logging, etc.)
- **Utils**: Pure utility functions with no side effects
- **Types**: TypeScript types and interfaces

### Naming Conventions

- **Files**: `kebab-case.ts` (e.g., `user.service.ts`)
- **Classes**: `PascalCase` (e.g., `UserService`)
- **Functions/Variables**: `camelCase` (e.g., `getUserById`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `SALT_ROUNDS`)
- **Interfaces/Types**: `PascalCase` (e.g., `User`, `CreateUserDto`)

### Database

- Use parameterized queries (never string interpolation)
- Always use transactions for multi-step operations
- Add indexes for frequently queried columns
- Use meaningful constraint names

## Testing

### Unit Tests

- Test all utility functions
- Test service methods in isolation
- Mock database calls
- Aim for 80%+ code coverage

```bash
bun test tests/unit
```

### Integration Tests

- Test API endpoints end-to-end
- Use a test database
- Clean up test data after each test

```bash
bun test tests/integration
```

### Writing Tests

```typescript
import { describe, test, expect } from 'bun:test';

describe('Feature Name', () => {
  test('should do something specific', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Git Workflow

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code
   - Add/update tests
   - Update documentation

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(notes): add full-text search functionality
fix(auth): resolve JWT expiration issue
docs(readme): update API documentation
test(user): add unit tests for user service
```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Ensure all tests pass
   - Request review from maintainers

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] All tests pass (`bun test`)
- [ ] New code has test coverage
- [ ] Documentation is updated (if needed)
- [ ] No TypeScript errors
- [ ] Commit messages follow conventions

### PR Description Template

```markdown
## Description
Brief description of what this PR does

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe the tests you added/modified

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests passing
```

## Adding New Features

### Adding a New Endpoint

1. **Define types** in `src/types/index.ts`
   ```typescript
   export interface NewFeatureDto {
     field: string;
   }
   ```

2. **Create service** in `src/services/`
   ```typescript
   export class NewFeatureService {
     async create(data: NewFeatureDto) {
       // Business logic
     }
   }
   ```

3. **Create controller** in `src/controllers/`
   ```typescript
   export const newFeatureController = new Elysia()
     .post('/', async ({ body }) => {
       // Handle request
     });
   ```

4. **Register controller** in `src/index.ts`
   ```typescript
   app.use(newFeatureController);
   ```

5. **Write tests** in `tests/`

6. **Update documentation** in `README.md` and `API_EXAMPLES.md`

### Adding a New Migration

1. Create migration file in `src/db/migrations/`
   ```typescript
   // 002_add_feature.ts
   export async function up() {
     await sql`CREATE TABLE ...`;
   }
   
   export async function down() {
     await sql`DROP TABLE ...`;
   }
   ```

2. Register in `src/db/migrate.ts`
   ```typescript
   import * as migration002 from './migrations/002_add_feature';
   
   const migrations = [
     // ...existing
     { name: '002_add_feature', ...migration002 },
   ];
   ```

3. Test migration
   ```bash
   bun run migrate:up
   bun run migrate:down
   ```

## Code Review Process

1. **Automated checks** run on every PR
2. **Maintainer review** - at least one approval required
3. **Address feedback** - make requested changes
4. **Merge** - maintainer will merge when approved

## Reporting Issues

### Bug Reports

Include:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (Bun version, PostgreSQL version, OS)
- Error messages/logs

### Feature Requests

Include:
- Description of the feature
- Use case/motivation
- Proposed implementation (optional)
- Alternatives considered

## Questions?

- Open an issue for questions about the project
- Check existing issues before creating new ones
- Be respectful and constructive

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to Notes API! 🎉
