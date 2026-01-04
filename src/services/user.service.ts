import { sql } from '../config/database';
import type { User, UserResponse } from '../types';
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  sanitizeString,
} from '../utils/validation';

interface CreateUserProfileDto {
  id: string;
  email: string;
  username: string;
}

export class UserService {
  async createUserProfile(dto: CreateUserProfileDto): Promise<UserResponse> {
    const email = sanitizeString(dto.email.toLowerCase());
    const username = sanitizeString(dto.username);

    if (!isValidEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!isValidUsername(username)) {
      throw new Error('Username must be between 3 and 100 characters');
    }

    // Check if user profile already exists
    const existingUser = await sql<User[]>`
      SELECT id FROM users WHERE id = ${dto.id}
    `;

    if (existingUser.length > 0) {
      // Update existing user profile
      const [user] = await sql<User[]>`
        UPDATE users 
        SET email = ${email}, username = ${username}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${dto.id}
        RETURNING id, email, username, created_at, updated_at
      `;

      if (!user) {
        throw new Error('Failed to update user profile');
      }

      return this.toUserResponse(user);
    }

    // Create new user profile
    const [user] = await sql<User[]>`
      INSERT INTO users (id, email, username)
      VALUES (${dto.id}, ${email}, ${username})
      RETURNING id, email, username, created_at, updated_at
    `;

    if (!user) {
      throw new Error('Failed to create user profile');
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

  async getUserByUsername(username: string): Promise<UserResponse | null> {
    const normalizedUsername = sanitizeString(username);

    const [user] = await sql<User[]>`
      SELECT id, email, username, created_at, updated_at
      FROM users
      WHERE username = ${normalizedUsername}
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
