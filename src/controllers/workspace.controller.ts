import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { WorkspaceService } from '../services/workspace.service';
import { successResponse, errorResponse } from '../utils/response';

const workspaceService = new WorkspaceService();

export const workspaceController = new Elysia({ prefix: '/workspaces' })
  .use(authMiddleware)
  .post(
    '/',
    async ({ body, user, set }) => {
      try {
        const workspace = await workspaceService.createWorkspace(
          user.userId,
          body
        );
        set.status = 201;
        return successResponse(workspace, 'Workspace created successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to create workspace'
        );
      }
    },
    {
      body: t.Object({
        name: t.String({ minLength: 1, maxLength: 255 }),
        description: t.Optional(t.String()),
      }),
    }
  )
  .get('/', async ({ user, set }) => {
    try {
      const workspaces = await workspaceService.getUserWorkspaces(user.userId);
      return successResponse(workspaces);
    } catch (error) {
      set.status = 500;
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch workspaces'
      );
    }
  })
  .get(
    '/:id',
    async ({ params, user, set }) => {
      try {
        const workspace = await workspaceService.getWorkspaceById(
          params.id,
          user.userId
        );

        if (!workspace) {
          set.status = 404;
          return errorResponse('Workspace not found');
        }

        const noteCount = await workspaceService.getWorkspaceNoteCount(
          params.id,
          user.userId
        );

        return successResponse({
          ...workspace,
          noteCount,
        });
      } catch (error) {
        set.status = 500;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to fetch workspace'
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
    async ({ params, body, user, set }) => {
      try {
        const workspace = await workspaceService.updateWorkspace(
          params.id,
          user.userId,
          body
        );
        return successResponse(workspace, 'Workspace updated successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to update workspace'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
        description: t.Optional(t.String()),
      }),
    }
  )
  .delete(
    '/:id',
    async ({ params, user, set }) => {
      try {
        await workspaceService.deleteWorkspace(params.id, user.userId);
        return successResponse(null, 'Workspace deleted successfully');
      } catch (error) {
        set.status = 400;
        return errorResponse(
          error instanceof Error ? error.message : 'Failed to delete workspace'
        );
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  );
