import { closeConnection } from '../config/database';
import * as migration001 from './migrations/001_initial_schema';
import * as migration002 from './migrations/002_setup_rls_policies';

const migrations = [
  { name: '001_initial_schema', up: migration001.up, down: migration001.down },
  { name: '002_setup_rls_policies', up: migration002.up, down: migration002.down },
];

async function runMigrations() {
  console.log('🚀 Starting database migrations...\n');
  
  for (const migration of migrations) {
    try {
      await migration.up();
    } catch (error) {
      console.error(`❌ Migration ${migration.name} failed:`, error);
      throw error;
    }
  }
  
  console.log('\n✅ All migrations completed successfully!');
}

async function rollbackMigrations() {
  console.log('🔄 Rolling back database migrations...\n');
  
  for (const migration of [...migrations].reverse()) {
    try {
      await migration.down();
    } catch (error) {
      console.error(`❌ Rollback ${migration.name} failed:`, error);
      throw error;
    }
  }
  
  console.log('\n✅ All rollbacks completed successfully!');
}

const command = process.argv[2];

if (command === 'up') {
  runMigrations()
    .then(() => closeConnection())
    .catch((error) => {
      console.error('Migration failed:', error);
      closeConnection().then(() => process.exit(1));
    });
} else if (command === 'down') {
  rollbackMigrations()
    .then(() => closeConnection())
    .catch((error) => {
      console.error('Rollback failed:', error);
      closeConnection().then(() => process.exit(1));
    });
} else {
  console.log('Usage: bun run migrate [up|down]');
  process.exit(1);
}
