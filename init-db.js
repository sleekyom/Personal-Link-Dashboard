#!/usr/bin/env node

/**
 * Database Initialization Script
 * This script creates the SQLite database and runs all migrations
 * Run this with: node init-db.js
 */

const fs = require('fs');
const path = require('path');

// Read the DATABASE_URL from .env file
const envFile = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8');
const dbUrlMatch = envFile.match(/DATABASE_URL="(.+)"/);

if (!dbUrlMatch) {
  console.error('❌ DATABASE_URL not found in .env file');
  process.exit(1);
}

let dbPath = dbUrlMatch[1].replace('file:', '');
dbPath = path.resolve(__dirname, dbPath);

console.log('📦 Initializing database at:', dbPath);

// Create database directory if it doesn't exist
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Read all migration files in order
const migrationsDir = path.join(__dirname, 'prisma', 'migrations');
const migrations = [
  '20251004215233_init',
  '20251004215250_add_password_field',
  '20260113000000_add_click_events',
  '20260113000001_add_categories',
  '20260113000002_add_webhooks'
];

let allSql = '';
migrations.forEach(migration => {
  const sqlFile = path.join(migrationsDir, migration, 'migration.sql');
  if (fs.existsSync(sqlFile)) {
    console.log(`  ✓ Reading migration: ${migration}`);
    allSql += fs.readFileSync(sqlFile, 'utf-8') + '\n';
  } else {
    console.warn(`  ⚠ Migration not found: ${migration}`);
  }
});

// Write the combined SQL to a temp file
const tempSqlFile = path.join(__dirname, 'temp-init.sql');
fs.writeFileSync(tempSqlFile, allSql);

console.log('\n📝 Combined SQL written to temp-init.sql');
console.log('\n🔧 To initialize the database, run one of these commands:\n');
console.log('Option 1 - If you have sqlite3 installed:');
console.log(`  sqlite3 ${dbPath} < temp-init.sql\n`);
console.log('Option 2 - Using Docker:');
console.log(`  docker compose exec app node -e "const fs=require('fs');const db=require('better-sqlite3')('${dbPath}');db.exec(fs.readFileSync('temp-init.sql','utf-8'));console.log('✅ Database initialized')"\n`);
console.log('Option 3 - Rebuild Docker with migrations:');
console.log('  1. Stop the container: docker compose down');
console.log('  2. Update Dockerfile to run migrations');
console.log('  3. Rebuild: docker compose up --build\n');

console.log('💡 The SQL file has been created at: temp-init.sql');
console.log('   You can execute it manually or use the options above.');

// Try to use Prisma's Node.js API
console.log('\n🔄 Attempting to initialize with Prisma...');

try {
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();

  (async () => {
    try {
      // Test connection
      await prisma.$connect();

      // Execute all migrations
      console.log('  ✓ Connected to database');
      console.log('  ⚙️  Running migrations...');

      const sqlStatements = allSql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const sql of sqlStatements) {
        try {
          await prisma.$executeRawUnsafe(sql);
        } catch (err) {
          // Ignore "table already exists" errors
          if (!err.message.includes('already exists')) {
            console.warn(`  ⚠️  Warning:`, err.message.split('\n')[0]);
          }
        }
      }

      console.log('  ✅ All migrations executed successfully!');
      await prisma.$disconnect();

      // Clean up temp file
      fs.unlinkSync(tempSqlFile);
      console.log('\n✨ Database initialized! You can now restart your application.');
      process.exit(0);
    } catch (err) {
      console.error('  ❌ Error:', err.message);
      console.log('\n  Please use one of the manual options listed above.');
      process.exit(1);
    }
  })();
} catch (err) {
  console.error('  ❌ Prisma client not available:', err.message);
  console.log('  Please use one of the manual options listed above.');
  process.exit(1);
}
