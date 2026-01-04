import { sql } from '../config/database';
import type {
  Note,
  NoteWithTags,
  CreateNoteDto,
  UpdateNoteDto,
  SearchFilters,
} from '../types';

export class NoteService {
  async createNote(
    userId: string,
    dto: CreateNoteDto
  ): Promise<NoteWithTags> {
    const { title, content, workspace_id, tags } = dto;

    if (!title || title.trim().length === 0) {
      throw new Error('Title is required');
    }

    if (!content || content.trim().length === 0) {
      throw new Error('Content is required');
    }

    if (workspace_id) {
      const [workspace] = await sql`
        SELECT id FROM workspaces WHERE id = ${workspace_id} AND user_id = ${userId}
      `;

      if (!workspace) {
        throw new Error('Workspace not found or access denied');
      }
    }

    const [note] = await sql<Note[]>`
      INSERT INTO notes (title, content, user_id, workspace_id)
      VALUES (${title.trim()}, ${content.trim()}, ${userId}, ${workspace_id || null})
      RETURNING *
    `;

    if (!note) {
      throw new Error('Failed to create note');
    }

    if (tags && tags.length > 0) {
      await this.addTagsToNote(note.id, userId, tags);
    }

    return this.getNoteWithTags(note.id, userId);
  }

  async getNoteById(noteId: string, userId: string): Promise<NoteWithTags | null> {
    const [note] = await sql<Note[]>`
      SELECT n.* FROM notes n
      LEFT JOIN shared_notes sn ON sn.note_id = n.id AND sn.shared_with_user_id = ${userId}
      WHERE n.id = ${noteId}
        AND n.is_deleted = false
        AND (n.user_id = ${userId} OR sn.id IS NOT NULL)
    `;

    if (!note) {
      return null;
    }

    return this.getNoteWithTags(noteId, userId);
  }

  async getUserNotes(
    userId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notes: NoteWithTags[]; total: number }> {
    const offset = (page - 1) * limit;

    const notes = await sql<Note[]>`
      SELECT * FROM notes
      WHERE user_id = ${userId} AND is_deleted = false
      ORDER BY updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [countResult] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text as count FROM notes
      WHERE user_id = ${userId} AND is_deleted = false
    `;

    const notesWithTags = await Promise.all(
      notes.map((note) => this.getNoteWithTags(note.id, userId))
    );

    return {
      notes: notesWithTags,
      total: parseInt(countResult?.count || '0'),
    };
  }

  async updateNote(
    noteId: string,
    userId: string,
    dto: UpdateNoteDto
  ): Promise<NoteWithTags> {
    const canEdit = await this.canUserEditNote(noteId, userId);

    if (!canEdit) {
      throw new Error('Note not found or access denied');
    }

    const updates: string[] = [];
    const values: (string | null)[] = [];

    if (dto.title !== undefined) {
      if (dto.title.trim().length === 0) {
        throw new Error('Title cannot be empty');
      }
      updates.push('title');
      values.push(dto.title.trim());
    }

    if (dto.content !== undefined) {
      if (dto.content.trim().length === 0) {
        throw new Error('Content cannot be empty');
      }
      updates.push('content');
      values.push(dto.content.trim());
    }

    if (dto.workspace_id !== undefined) {
      if (dto.workspace_id) {
        const [workspace] = await sql`
          SELECT id FROM workspaces WHERE id = ${dto.workspace_id} AND user_id = ${userId}
        `;

        if (!workspace) {
          throw new Error('Workspace not found or access denied');
        }
      }
      updates.push('workspace_id');
      values.push(dto.workspace_id || null);
    }

    if (updates.length === 0) {
      return this.getNoteWithTags(noteId, userId);
    }

    const setClauses = updates.map((col, idx) => `${col} = $${idx + 1}`).join(', ');
    values.push(noteId);

    await sql.unsafe(
      `UPDATE notes SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = $${values.length}`,
      values
    );

    return this.getNoteWithTags(noteId, userId);
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    const [note] = await sql<Note[]>`
      SELECT * FROM notes WHERE id = ${noteId} AND user_id = ${userId}
    `;

    if (!note) {
      throw new Error('Note not found or access denied');
    }

    await sql`
      UPDATE notes
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${noteId}
    `;
  }

  async searchNotes(
    userId: string,
    filters: SearchFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<{ notes: NoteWithTags[]; total: number }> {
    const offset = (page - 1) * limit;
    let conditions: string[] = ['n.user_id = $1', 'n.is_deleted = false'];
    const values: (string | string[])[] = [userId];
    let paramCount = 1;

    if (filters.query) {
      paramCount++;
      conditions.push(
        `(to_tsvector('english', n.title || ' ' || n.content) @@ plainto_tsquery('english', $${paramCount}))`
      );
      values.push(filters.query);
    }

    if (filters.workspaceId) {
      paramCount++;
      conditions.push(`n.workspace_id = $${paramCount}`);
      values.push(filters.workspaceId);
    }

    if (filters.startDate) {
      paramCount++;
      conditions.push(`n.created_at >= $${paramCount}`);
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      paramCount++;
      conditions.push(`n.created_at <= $${paramCount}`);
      values.push(filters.endDate);
    }

    let tagJoin = '';
    if (filters.tags && filters.tags.length > 0) {
      paramCount++;
      tagJoin = `
        INNER JOIN note_tags nt ON nt.note_id = n.id
        INNER JOIN tags t ON t.id = nt.tag_id
      `;
      conditions.push(`t.name = ANY($${paramCount})`);
      values.push(filters.tags);
    }

    const whereClause = conditions.join(' AND ');

    values.push(limit.toString(), offset.toString());

    const query = `
      SELECT DISTINCT n.* FROM notes n
      ${tagJoin}
      WHERE ${whereClause}
      ORDER BY n.updated_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const countQuery = `
      SELECT COUNT(DISTINCT n.id)::text as count FROM notes n
      ${tagJoin}
      WHERE ${whereClause}
    `;

    const notes = await sql.unsafe<Note[]>(query, values);
    const [countResult] = await sql.unsafe<[{ count: string }]>(
      countQuery,
      values.slice(0, -2)
    );

    const notesWithTags = await Promise.all(
      notes.map((note) => this.getNoteWithTags(note.id, userId))
    );

    return {
      notes: notesWithTags,
      total: parseInt(countResult?.count || '0'),
    };
  }

  async addTagsToNote(
    noteId: string,
    userId: string,
    tagNames: string[]
  ): Promise<void> {
    for (const tagName of tagNames) {
      const normalizedTag = tagName.trim().toLowerCase();

      if (!normalizedTag) continue;

      let [tag] = await sql`
        SELECT id FROM tags WHERE name = ${normalizedTag} AND user_id = ${userId}
      `;

      if (!tag) {
        [tag] = await sql`
          INSERT INTO tags (name, user_id)
          VALUES (${normalizedTag}, ${userId})
          RETURNING id
        `;
      }

      if (tag) {
        await sql`
          INSERT INTO note_tags (note_id, tag_id)
          VALUES (${noteId}, ${tag.id})
          ON CONFLICT (note_id, tag_id) DO NOTHING
        `;
      }
    }
  }

  async removeTagFromNote(
    noteId: string,
    userId: string,
    tagName: string
  ): Promise<void> {
    const canEdit = await this.canUserEditNote(noteId, userId);

    if (!canEdit) {
      throw new Error('Note not found or access denied');
    }

    const normalizedTag = tagName.trim().toLowerCase();

    const [tag] = await sql`
      SELECT id FROM tags WHERE name = ${normalizedTag} AND user_id = ${userId}
    `;

    if (!tag) {
      return;
    }

    await sql`
      DELETE FROM note_tags
      WHERE note_id = ${noteId} AND tag_id = ${tag.id}
    `;
  }

  async getNoteWithTags(noteId: string, userId: string): Promise<NoteWithTags> {
    const [note] = await sql<Note[]>`
      SELECT n.* FROM notes n
      LEFT JOIN shared_notes sn ON sn.note_id = n.id AND sn.shared_with_user_id = ${userId}
      WHERE n.id = ${noteId}
        AND (n.user_id = ${userId} OR sn.id IS NOT NULL)
    `;

    if (!note) {
      throw new Error('Note not found');
    }

    const tags = await sql<[{ name: string }]>`
      SELECT t.name FROM tags t
      INNER JOIN note_tags nt ON nt.tag_id = t.id
      WHERE nt.note_id = ${noteId}
    `;

    return {
      ...note,
      tags: tags.map((t) => t.name),
    };
  }

  async canUserEditNote(noteId: string, userId: string): Promise<boolean> {
    const [result] = await sql<[{ can_edit: boolean }]>`
      SELECT 
        CASE 
          WHEN n.user_id = ${userId} THEN true
          WHEN sn.permission = 'edit' THEN true
          ELSE false
        END as can_edit
      FROM notes n
      LEFT JOIN shared_notes sn ON sn.note_id = n.id AND sn.shared_with_user_id = ${userId}
      WHERE n.id = ${noteId} AND n.is_deleted = false
    `;

    return result?.can_edit || false;
  }
}
