import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { config } from './config/env';
import { testConnection } from './config/database';
import { supabase } from './config/supabase';
import { authController } from './controllers/auth.controller';
import { noteController } from './controllers/note.controller';
import { workspaceController } from './controllers/workspace.controller';
import { sharingController } from './controllers/sharing.controller';
import { tagController } from './controllers/tag.controller';
import { errorResponse } from './utils/response';

const app = new Elysia()
  .use(
    cors({
      origin: config.cors.origin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  )
  .onError(({ code, error, set }) => {
    console.error(`Error [${code}]:`, error);

    if (code === 'VALIDATION') {
      set.status = 400;
      return errorResponse('Validation error: ' + (error as Error).message);
    }

    if (code === 'NOT_FOUND') {
      set.status = 404;
      return errorResponse('Route not found');
    }

    set.status = 500;
    return errorResponse((error as Error).message || 'Internal server error');
  })
  .get('/', () => ({
    message: 'Notes API - Knowledge Base',
    version: '2.0.0',
    status: 'running',
    auth: 'Supabase Auth',
    database: 'Supabase PostgreSQL',
  }))
  .get('/health', async () => {
    const dbConnected = await testConnection();
    
    let supabaseConnected = false;
    try {
      const { error } = await supabase.auth.getSession();
      supabaseConnected = !error;
    } catch (error) {
      console.error('Supabase connection failed:', error);
    }

    return {
      status: 'ok',
      database: dbConnected ? 'connected' : 'disconnected',
      supabase: supabaseConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
    };
  })
  .group(config.server.apiPrefix, (app) =>
    app
      .use(authController)
      .use(noteController)
      .use(workspaceController)
      .use(sharingController)
      .use(tagController)
  )
  .listen(config.server.port);

console.log(`
🚀 Notes API Server is running!
📍 URL: http://localhost:${app.server?.port}
📚 API: http://localhost:${app.server?.port}${config.server.apiPrefix}
🏥 Health: http://localhost:${app.server?.port}/health
🌍 Environment: ${config.server.nodeEnv}
🔐 Auth: Supabase Auth
🗄️ Database: Supabase PostgreSQL
`);

export default app;
export type App = typeof app;
