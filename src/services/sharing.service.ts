import { sql } from '../config/database';
import type { SharedNote, SharedNoteWithDetails, ShareNoteDto } from '../types';

export class SharingService {
  async shareNote(
    noteId: string,
    userId: string,
    dto: ShareNoteDto
  ): Promise<SharedNote> {
    const { user_id: sharedWithUserId, permission } = dto;

    const [note] = await sql`
      SELECT * FROM notes WHERE id = ${noteId} AND user_id = ${userId} AND is_deleted = false
    `;

    if (!note) {
      throw new Error('Note not found or you do not have permission to share it');
    }

    if (sharedWithUserId === userId) {
      throw new Error('Cannot share note with yourself');
    }

    const [targetUser] = await sql`
      SELECT id FROM users WHERE id = ${sharedWithUserId}
    `;

    if (!targetUser) {
      throw new Error('Target user not found');
    }

    const [existingShare] = await sql<SharedNote[]>`
      SELECT * FROM shared_notes
      WHERE note_id = ${noteId} AND shared_with_user_id = ${sharedWithUserId}
    `;

    if (existingShare) {
      const [updated] = await sql<SharedNote[]>`
        UPDATE shared_notes
        SET permission = ${permission}
        WHERE id = ${existingShare.id}
        RETURNING *
      `;

      if (!updated) {
        throw new Error('Failed to update share permission');
      }

      return updated;
    }

    const [share] = await sql<SharedNote[]>`
      INSERT INTO shared_notes (note_id, shared_with_user_id, shared_by_user_id, permission)
      VALUES (${noteId}, ${sharedWithUserId}, ${userId}, ${permission})
      RETURNING *
    `;

    if (!share) {
      throw new Error('Failed to share note');
    }

    return share;
  }

  async unshareNote(
    noteId: string,
    userId: string,
    sharedWithUserId: string
  ): Promise<void> {
    const [note] = await sql`
      SELECT * FROM notes WHERE id = ${noteId} AND user_id = ${userId}
    `;

    if (!note) {
      throw new Error('Note not found or access denied');
    }

    await sql`
      DELETE FROM shared_notes
      WHERE note_id = ${noteId} 
        AND shared_with_user_id = ${sharedWithUserId}
        AND shared_by_user_id = ${userId}
    `;
  }

  async getSharedWithMe(userId: string): Promise<SharedNoteWithDetails[]> {
    const shares = await sql<SharedNoteWithDetails[]>`
      SELECT 
        sn.*,
        n.title as note_title,
        n.content as note_content,
        u.username as shared_by_username
      FROM shared_notes sn
      INNER JOIN notes n ON n.id = sn.note_id
      INNER JOIN users u ON u.id = sn.shared_by_user_id
      WHERE sn.shared_with_user_id = ${userId}
        AND n.is_deleted = false
      ORDER BY sn.created_at DESC
    `;

    return shares;
  }

  async getSharedByMe(userId: string): Promise<SharedNoteWithDetails[]> {
    const shares = await sql<SharedNoteWithDetails[]>`
      SELECT 
        sn.*,
        n.title as note_title,
        n.content as note_content,
        u.username as shared_by_username
      FROM shared_notes sn
      INNER JOIN notes n ON n.id = sn.note_id
      INNER JOIN users u ON u.id = sn.shared_by_user_id
      WHERE sn.shared_by_user_id = ${userId}
        AND n.is_deleted = false
      ORDER BY sn.created_at DESC
    `;

    return shares;
  }

  async getNoteShares(noteId: string, userId: string): Promise<SharedNote[]> {
    const [note] = await sql`
      SELECT * FROM notes WHERE id = ${noteId} AND user_id = ${userId}
    `;

    if (!note) {
      throw new Error('Note not found or access denied');
    }

    const shares = await sql<SharedNote[]>`
      SELECT sn.*, u.username
      FROM shared_notes sn
      INNER JOIN users u ON u.id = sn.shared_with_user_id
      WHERE sn.note_id = ${noteId}
      ORDER BY sn.created_at DESC
    `;

    return shares;
  }
}
