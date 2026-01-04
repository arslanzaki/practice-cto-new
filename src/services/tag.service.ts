import { sql } from '../config/database';
import type { Tag } from '../types';

export class TagService {
  async getUserTags(userId: string): Promise<Tag[]> {
    const tags = await sql<Tag[]>`
      SELECT * FROM tags
      WHERE user_id = ${userId}
      ORDER BY name ASC
    `;

    return tags;
  }

  async getTagById(tagId: string, userId: string): Promise<Tag | null> {
    const [tag] = await sql<Tag[]>`
      SELECT * FROM tags
      WHERE id = ${tagId} AND user_id = ${userId}
    `;

    return tag || null;
  }

  async createTag(userId: string, name: string): Promise<Tag> {
    const normalizedName = name.trim().toLowerCase();

    if (!normalizedName) {
      throw new Error('Tag name is required');
    }

    const [existingTag] = await sql<Tag[]>`
      SELECT * FROM tags
      WHERE name = ${normalizedName} AND user_id = ${userId}
    `;

    if (existingTag) {
      return existingTag;
    }

    const [tag] = await sql<Tag[]>`
      INSERT INTO tags (name, user_id)
      VALUES (${normalizedName}, ${userId})
      RETURNING *
    `;

    if (!tag) {
      throw new Error('Failed to create tag');
    }

    return tag;
  }

  async deleteTag(tagId: string, userId: string): Promise<void> {
    const [tag] = await sql<Tag[]>`
      SELECT * FROM tags
      WHERE id = ${tagId} AND user_id = ${userId}
    `;

    if (!tag) {
      throw new Error('Tag not found or access denied');
    }

    await sql`
      DELETE FROM tags WHERE id = ${tagId}
    `;
  }

  async getTagNoteCount(tagId: string, userId: string): Promise<number> {
    const [result] = await sql<[{ count: string }]>`
      SELECT COUNT(*)::text as count FROM note_tags nt
      INNER JOIN notes n ON n.id = nt.note_id
      WHERE nt.tag_id = ${tagId} 
        AND n.user_id = ${userId}
        AND n.is_deleted = false
    `;

    return parseInt(result?.count || '0');
  }
}
