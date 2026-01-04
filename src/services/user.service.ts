import { sql } from '../config/database';
import type { User, UserResponse, CreateUserDto } from '../types';
import { hashPassword, comparePassword } from '../utils/password';
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeString,
} from '../utils/validation';

export class UserService {
  async createUser(dto: CreateUserDto): Promise<UserResponse> {
    const email = sanitizeString(dto.email.toLowerCase());
    const username = sanitizeString(dto.username);
    const password = dto.password;

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidUsername(username)) {
      throw new Error('Username must be between 3 and 100 characters');
    }

    if (!isValidPassword(password)) {
      throw new Error('Password must be at least 8 characters');
    }

    const existingUser = await sql<User[]>`
      SELECT id FROM users WHERE email = ${email} OR username = ${username}
    `;

    if (existingUser.length > 0) {
      throw new Error('User with this email or username already exists');
    }

    const passwordHash = await hashPassword(password);

    const [user] = await sql<User[]>`
      INSERT INTO users (email, username, password_hash)
      VALUES (${email}, ${username}, ${passwordHash})
      RETURNING id, email, username, created_at, updated_at
    `;

    if (!user) {
      throw new Error('Failed to create user');
    }

    return this.toUserResponse(user);
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<UserResponse> {
    const normalizedEmail = sanitizeString(email.toLowerCase());

    const [user] = await sql<User[]>`
      SELECT * FROM users WHERE email = ${normalizedEmail}
    `;

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    return this.toUserResponse(user);
  }

  async getUserById(userId: string): Promise<UserResponse | null> {
    const [user] = await sql<User[]>`
      SELECT id, email, username, created_at, updated_at
      FROM users
      WHERE id = ${userId}
    `;

    return user ? this.toUserResponse(user) : null;
  }

  async getUserByEmail(email: string): Promise<UserResponse | null> {
    const normalizedEmail = sanitizeString(email.toLowerCase());

    const [user] = await sql<User[]>`
      SELECT id, email, username, created_at, updated_at
      FROM users
      WHERE email = ${normalizedEmail}
    `;

    return user ? this.toUserResponse(user) : null;
  }

  private toUserResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
