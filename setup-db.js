#!/usr/bin/env node
/**
 * Database Setup Script — Creates SQLite database with seed data
 * Agent A03: SQLite Data Owner
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const dbPath = 'src/data/locations.db';
const schemaPath = 'src/data/schema.sql';
const seedPath = 'src/data/seed-data.json';

console.log('🗄️  Setting up SQLite database...\n');

try {
  // Remove existing database if it exists
  if (fs.existsSync(dbPath)) {
    console.log(`Removing existing database: ${dbPath}`);
    fs.unlinkSync(dbPath);
  }

  // Create database connection
  const db = new Database(dbPath);
  console.log(`✅ Database created: ${dbPath}`);

  // Enable WAL mode for better concurrency
  db.pragma('journal_mode = WAL');

  // Read and execute schema
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  const schemaStatements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`\nExecuting schema (${schemaStatements.length} statements)...`);
  for (const statement of schemaStatements) {
    db.exec(statement);
  }
  console.log('✅ Schema created successfully');

  // Read seed data
  const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  console.log(`\nInserting seed data (${seedData.locations.length} locations)...`);

  // Prepare insert statement
  const insertStmt = db.prepare(`
    INSERT INTO locations (
      id, name, lat, lng, address, charger_type, connectors, power_kw, source, verified_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Insert all locations
  const insertMany = db.transaction((locations) => {
    for (const loc of locations) {
      insertStmt.run(
        loc.id,
        loc.name,
        loc.lat,
        loc.lng,
        loc.address,
        loc.charger_type,
        loc.connectors,
        loc.power_kw,
        loc.source,
        loc.verified_date
      );
    }
  });

  insertMany(seedData.locations);
  console.log(`✅ Inserted ${seedData.locations.length} locations`);

  // Verify integrity
  console.log('\n🔍 Verifying database integrity...');
  const integrityResult = db.prepare('PRAGMA integrity_check').all();
  if (integrityResult[0]['integrity_check'] === 'ok') {
    console.log('✅ Database integrity: OK');
  } else {
    throw new Error('Database integrity check failed');
  }

  // Get row count
  const rowCount = db.prepare('SELECT COUNT(*) as count FROM locations').get();
  console.log(`✅ Locations table: ${rowCount.count} rows`);

  // Checkpoint WAL
  console.log('\n💾 Checkpointing WAL...');
  db.pragma('wal_checkpoint(TRUNCATE)');
  console.log('✅ WAL checkpointed successfully');

  // Close database
  db.close();
  console.log(`\n✅ Database setup complete: ${dbPath}`);
  console.log(`   Schema: src/data/schema.sql`);
  console.log(`   Seed data: src/data/seed-data.json`);
  console.log(`   File size: ${(fs.statSync(dbPath).size / 1024).toFixed(2)} KB`);

} catch (error) {
  console.error('❌ Database setup failed:');
  console.error(error.message);
  process.exit(1);
}
