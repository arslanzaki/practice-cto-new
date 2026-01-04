import { sql } from '../../config/database';

export async function up(): Promise<void> {
  console.log('Running migration: 002_setup_rls_policies');
  
  // Enable RLS on all tables
  await sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE notes ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE tags ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE note_tags ENABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE shared_notes ENABLE ROW LEVEL SECURITY`;

  // Users table policies
  await sql`
    CREATE POLICY "Users can view own profile" ON users
      FOR SELECT USING (auth.uid() = id)
  `;

  await sql`
    CREATE POLICY "Users can update own profile" ON users
      FOR UPDATE USING (auth.uid() = id)
  `;

  await sql`
    CREATE POLICY "Users can insert own profile" ON users
      FOR INSERT WITH CHECK (auth.uid() = id)
  `;

  // Workspaces table policies
  await sql`
    CREATE POLICY "Users can view own workspaces" ON workspaces
      FOR SELECT USING (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can create own workspaces" ON workspaces
      FOR INSERT WITH CHECK (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can update own workspaces" ON workspaces
      FOR UPDATE USING (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can delete own workspaces" ON workspaces
      FOR DELETE USING (auth.uid() = user_id)
  `;

  // Notes table policies
  await sql`
    CREATE POLICY "Users can view own notes" ON notes
      FOR SELECT USING (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can view shared notes" ON notes
      FOR SELECT USING (
        id IN (
          SELECT note_id FROM shared_notes 
          WHERE shared_with_user_id = auth.uid()
        )
      )
  `;

  await sql`
    CREATE POLICY "Users can create own notes" ON notes
      FOR INSERT WITH CHECK (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can update own notes" ON notes
      FOR UPDATE USING (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can update shared notes they can edit" ON notes
      FOR UPDATE USING (
        id IN (
          SELECT note_id FROM shared_notes 
          WHERE shared_with_user_id = auth.uid() AND permission = 'edit'
        )
      )
  `;

  await sql`
    CREATE POLICY "Users can delete own notes" ON notes
      FOR DELETE USING (auth.uid() = user_id)
  `;

  // Tags table policies
  await sql`
    CREATE POLICY "Users can view own tags" ON tags
      FOR SELECT USING (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can create own tags" ON tags
      FOR INSERT WITH CHECK (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can update own tags" ON tags
      FOR UPDATE USING (auth.uid() = user_id)
  `;

  await sql`
    CREATE POLICY "Users can delete own tags" ON tags
      FOR DELETE USING (auth.uid() = user_id)
  `;

  // Note tags junction table policies
  await sql`
    CREATE POLICY "Users can view own note tags" ON note_tags
      FOR SELECT USING (
        note_id IN (
          SELECT id FROM notes WHERE user_id = auth.uid()
        ) OR
        tag_id IN (
          SELECT id FROM tags WHERE user_id = auth.uid()
        )
      )
  `;

  await sql`
    CREATE POLICY "Users can create note tags for own notes" ON note_tags
      FOR INSERT WITH CHECK (
        note_id IN (
          SELECT id FROM notes WHERE user_id = auth.uid()
        ) AND
        tag_id IN (
          SELECT id FROM tags WHERE user_id = auth.uid()
        )
      )
  `;

  await sql`
    CREATE POLICY "Users can delete own note tags" ON note_tags
      FOR DELETE USING (
        note_id IN (
          SELECT id FROM notes WHERE user_id = auth.uid()
        ) OR
        tag_id IN (
          SELECT id FROM tags WHERE user_id = auth.uid()
        )
      )
  `;

  // Shared notes table policies
  await sql`
    CREATE POLICY "Users can view notes shared with them" ON shared_notes
      FOR SELECT USING (shared_with_user_id = auth.uid())
  `;

  await sql`
    CREATE POLICY "Users can view notes they shared" ON shared_notes
      FOR SELECT USING (shared_by_user_id = auth.uid())
  `;

  await sql`
    CREATE POLICY "Users can share own notes" ON shared_notes
      FOR INSERT WITH CHECK (
        shared_by_user_id = auth.uid() AND
        note_id IN (
          SELECT id FROM notes WHERE user_id = auth.uid()
        )
      )
  `;

  await sql`
    CREATE POLICY "Users can update their own shares" ON shared_notes
      FOR UPDATE USING (shared_by_user_id = auth.uid())
  `;

  await sql`
    CREATE POLICY "Users can delete their own shares" ON shared_notes
      FOR DELETE USING (shared_by_user_id = auth.uid())
  `;

  console.log('✅ Migration 002_setup_rls_policies completed');
}

export async function down(): Promise<void> {
  console.log('Rolling back migration: 002_setup_rls_policies');
  
  // Drop all policies
  await sql`DROP POLICY IF EXISTS "Users can view own profile" ON users`;
  await sql`DROP POLICY IF EXISTS "Users can update own profile" ON users`;
  await sql`DROP POLICY IF EXISTS "Users can insert own profile" ON users`;

  await sql`DROP POLICY IF EXISTS "Users can view own workspaces" ON workspaces`;
  await sql`DROP POLICY IF EXISTS "Users can create own workspaces" ON workspaces`;
  await sql`DROP POLICY IF EXISTS "Users can update own workspaces" ON workspaces`;
  await sql`DROP POLICY IF EXISTS "Users can delete own workspaces" ON workspaces`;

  await sql`DROP POLICY IF EXISTS "Users can view own notes" ON notes`;
  await sql`DROP POLICY IF EXISTS "Users can view shared notes" ON notes`;
  await sql`DROP POLICY IF EXISTS "Users can create own notes" ON notes`;
  await sql`DROP POLICY IF EXISTS "Users can update own notes" ON notes`;
  await sql`DROP POLICY IF EXISTS "Users can update shared notes they can edit" ON notes`;
  await sql`DROP POLICY IF EXISTS "Users can delete own notes" ON notes`;

  await sql`DROP POLICY IF EXISTS "Users can view own tags" ON tags`;
  await sql`DROP POLICY IF EXISTS "Users can create own tags" ON tags`;
  await sql`DROP POLICY IF EXISTS "Users can update own tags" ON tags`;
  await sql`DROP POLICY IF EXISTS "Users can delete own tags" ON tags`;

  await sql`DROP POLICY IF EXISTS "Users can view own note tags" ON note_tags`;
  await sql`DROP POLICY IF EXISTS "Users can create note tags for own notes" ON note_tags`;
  await sql`DROP POLICY IF EXISTS "Users can delete own note tags" ON note_tags`;

  await sql`DROP POLICY IF EXISTS "Users can view notes shared with them" ON shared_notes`;
  await sql`DROP POLICY IF EXISTS "Users can view notes they shared" ON shared_notes`;
  await sql`DROP POLICY IF EXISTS "Users can share own notes" ON shared_notes`;
  await sql`DROP POLICY IF EXISTS "Users can update their own shares" ON shared_notes`;
  await sql`DROP POLICY IF EXISTS "Users can delete their own shares" ON shared_notes`;

  // Disable RLS on all tables
  await sql`ALTER TABLE users DISABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE workspaces DISABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE notes DISABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE tags DISABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE note_tags DISABLE ROW LEVEL SECURITY`;
  await sql`ALTER TABLE shared_notes DISABLE ROW LEVEL SECURITY`;

  console.log('✅ Rollback 002_setup_rls_policies completed');
}