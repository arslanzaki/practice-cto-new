import postgres from 'postgres';
import { config } from './env';

// For backward compatibility, we'll use the same postgres.js client
// but connect to Supabase's PostgreSQL instance
const sql = postgres({
  host: config.database.host,
  port: config.database.port,
  database: config.database.name,
  username: config.database.user,
  password: config.database.password,
  max: config.database.poolMax,
  idle_timeout: 20,
  connect_timeout: 10,
});

export { sql };

export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function closeConnection(): Promise<void> {
  await sql.end({ timeout: 5 });
}
