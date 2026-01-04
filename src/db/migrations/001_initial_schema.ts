import { sql } from '../../config/database';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function up(): Promise<void> {
  console.log('Running migration: 001_initial_schema');
  
  const schemaPath = join(__dirname, '../schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  await sql.unsafe(schema);
  
  console.log('✅ Migration 001_initial_schema completed');
}

export async function down(): Promise<void> {
  console.log('Rolling back migration: 001_initial_schema');
  
  await sql`DROP TABLE IF EXISTS shared_notes CASCADE`;
  await sql`DROP TABLE IF EXISTS note_tags CASCADE`;
  await sql`DROP TABLE IF EXISTS tags CASCADE`;
  await sql`DROP TABLE IF EXISTS notes CASCADE`;
  await sql`DROP TABLE IF EXISTS workspaces CASCADE`;
  await sql`DROP TABLE IF EXISTS users CASCADE`;
  await sql`DROP FUNCTION IF EXISTS update_updated_at_column CASCADE`;
  
  console.log('✅ Rollback 001_initial_schema completed');
}
