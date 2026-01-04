import { Elysia, t } from 'elysia';
import { authMiddleware } from '../middleware/auth.middleware';
import { WorkspaceService } from '../services/workspace.service';
import { successResponse, errorResponse } from '../utils/response';
import type { JWTPayload } from '../types';

const workspaceService = new WorkspaceService();

export const workspaceController = new Elysia({ prefix: '/workspaces' })
  .use(authMiddleware)
  .post(
    '/',
    async ({ body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
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
  .get('/', async ({ set, ...context }) => {
    try {
      const user = (context as any).user as JWTPayload;
      const workspaces = await workspaceService.getUserWorkspaces(user.userId);
      return successResponse(workspaces, 'Workspaces retrieved successfully');
    } catch (error) {
      set.status = 500;
      return errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch workspaces'
      );
    }
  })
  .get(
    '/:id',
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const workspace = await workspaceService.getWorkspaceById(
          user.userId,
          params.id
        );

        if (!workspace) {
          set.status = 404;
          return errorResponse('Workspace not found');
        }

        return successResponse(workspace, 'Workspace retrieved successfully');
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
    async ({ params, body, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const workspace = await workspaceService.updateWorkspace(
          user.userId,
          params.id,
          body
        );

        if (!workspace) {
          set.status = 404;
          return errorResponse('Workspace not found');
        }

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
    async ({ params, set, ...context }) => {
      try {
        const user = (context as any).user as JWTPayload;
        const success = await workspaceService.deleteWorkspace(
          user.userId,
          params.id
        );

        if (!success) {
          set.status = 404;
          return errorResponse('Workspace not found');
        }

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