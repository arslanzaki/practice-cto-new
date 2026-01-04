import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { NoteService } from '../services/note.service';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response';
import type { JWTPayload } from '../types';

const noteService = new NoteService();

export const noteController = new Elysia({ prefix: '/notes' })
  .use(authMiddleware)
  .post(
    '/',
    async ({ body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const note = await noteService.createNote(user.userId, body);
        set.status = 201;
        return successResponse(note, 'Note created successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to create note'
        );
      }
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1, maxLength: 500 }),
        content: t.String({ minLength: 1 }),
        workspace_id: t.Optional(t.String()),
        tags: t.Optional(t.Array(t.String())),
      }),
    }
  )
  .get('/', async ({ query, set, ...context }) => {
    try {
      const user = (context as any).user as JWTPayload;
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');

      const { notes, total } = await noteService.getUserNotes(
        user.userId,
        page,
        limit
      );

      return paginatedResponse(notes, page, limit, total);
    } catch (error) {
      set.status = 500;
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch notes'
      );
    }
  })
  .get(
    '/:id',
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const note = await noteService.getNoteById(params.id, user.userId);

        if (!note) {
          set.status = 404;
          return errorResponse('Note not found');
        }

        return successResponse(note);
      } catch (error) {
        set.status = 500;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to fetch note'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .put(
    '/:id',
    async ({ params, body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const note = await noteService.updateNote(params.id, user.userId, body);
        return successResponse(note, 'Note updated successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to update note'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        title: t.Optional(t.String({ minLength: 1, maxLength: 500 })),
        content: t.Optional(t.String({ minLength: 1 })),
        workspace_id: t.Optional(t.String()),
      }),
    }
  )
  .delete(
    '/:id',
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        await noteService.deleteNote(params.id, user.userId);
        return successResponse(null, 'Note deleted successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to delete note'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    '/search',
    async ({ body, query, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const page = parseInt(query.page || '1');
        const limit = parseInt(query.limit || '20');

        const { notes, total } = await noteService.searchNotes(
          user.userId,
          body,
          page,
          limit
        );

        return paginatedResponse(notes, page, limit, total);
      } catch (error) {
        set.status = 500;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to search notes'
        );
      }
    },
    {
      body: t.Object({
        query: t.Optional(t.String()),
        tags: t.Optional(t.Array(t.String())),
        startDate: t.Optional(t.String()),
        endDate: t.Optional(t.String()),
        workspaceId: t.Optional(t.String()),
      }),
    }
  )
  .post(
    '/:id/tags',
    async ({ params, body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        await noteService.addTagsToNote(params.id, user.userId, body.tags);
        const note = await noteService.getNoteWithTags(params.id, user.userId);
        return successResponse(note, 'Tags added successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to add tags'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        tags: t.Array(t.String()),
      }),
    }
  )
  .delete(
    '/:id/tags/:tagName',
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        await noteService.removeTagFromNote(
          params.id,
          user.userId,
          params.tagName
        );
        return successResponse(null, 'Tag removed successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to remove tag'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
        tagName: t.String(),
      }),
    }
  );
