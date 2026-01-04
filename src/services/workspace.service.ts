import { sql } from '../config/database';
import type { Workspace, CreateWorkspaceDto } from '../types';

export class WorkspaceService {
  async createWorkspace(
    userId: string,
    dto: CreateWorkspaceDto
  ): Promise<Workspace> {
    const { name, description } = dto;

    if (!name || name.trim().length === 0) {
      throw new Error('Workspace name is required');
    }

    const [workspace] = await sql<Workspace[]>`
      INSERT INTO workspaces (name, description, user_id)
      VALUES (${name.trim()}, ${description?.trim() || null}, ${userId})
      RETURNING *
    `;

    if (!workspace) {
      throw new Error('Failed to create workspace');
    }

    return workspace;
  }

  async getWorkspaceById(
    workspaceId: string,
    userId: string
  ): Promise<Workspace | null> {
    const [workspace] = await sql<Workspace[]>`
      SELECT * FROM workspaces
      WHERE id = ${workspaceId} AND user_id = ${userId}
    `;

    return workspace || null;
  }

  async getUserWorkspaces(userId: string): Promise<Workspace[]> {
    const workspaces = await sql<Workspace[]>`
      SELECT * FROM workspaces
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return workspaces;
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    dto: Partial<CreateWorkspaceDto>
  ): Promise<Workspace> {
    const [workspace] = await sql<Workspace[]>`
      SELECT * FROM workspaces
      WHERE id = ${workspaceId} AND user_id = ${userId}
    `;

    if (!workspace) {
      throw new Error('Workspace not found or access denied');
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (dto.name !== undefined) {
      if (dto.name.trim().length === 0) {
        throw new Error('Workspace name cannot be empty');
      }
      updates.push('name');
      values.push(dto.name.trim());
    }

    if (dto.description !== undefined) {
      updates.push('description');
      values.push(dto.description?.trim() || null);
    }

    if (updates.length === 0) {
      return workspace;
    }

    const setClauses = updates.map((col, idx) => `${col} = $${idx + 1}`).join(', ');
    values.push(workspaceId);

    const [updated] = await sql.unsafe<Workspace[]>(
      `UPDATE workspaces SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (!updated) {
      throw new Error('Failed to update workspace');
    }

    return updated;
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const [workspace] = await sql<Workspace[]>`
      SELECT * FROM workspaces
      WHERE id = ${workspaceId} AND user_id = ${userId}
    `;

    if (!workspace) {
      throw new Error('Workspace not found or access denied');
    }

    await sql`
      DELETE FROM workspaces WHERE id = ${workspaceId}
    `;
  }

  async getWorkspaceNoteCount(workspaceId: string, userId: string): Promise<number> {
    const [result] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text as count FROM notes
      WHERE workspace_id = ${workspaceId} 
        AND user_id = ${userId}
        AND is_deleted = false
    `;

    return parseInt(result?.count || '0');
  }
}
