#!/usr/bin/env python3
"""
Database Setup Script — Creates SQLite database with seed data
Agent A03: SQLite Data Owner
"""

import sqlite3
import json
import os

DB_PATH = 'src/data/locations.db'
SCHEMA_PATH = 'src/data/schema.sql'
SEED_PATH = 'src/data/seed-data.json'

print('🗄️  Setting up SQLite database...\n')

try:
    # Remove existing database if it exists
    if os.path.exists(DB_PATH):
        print(f'Removing existing database: {DB_PATH}')
        os.remove(DB_PATH)

    # Create database connection
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    print(f'✅ Database created: {DB_PATH}')

    # Enable WAL mode for better concurrency
    cursor.execute('PRAGMA journal_mode = WAL')

    # Read and execute schema
    with open(SCHEMA_PATH, 'r') as f:
        schema = f.read()

    schema_statements = [s.strip() for s in schema.split(';') if s.strip()]
    print(f'\nExecuting schema ({len(schema_statements)} statements)...')

    for statement in schema_statements:
        cursor.execute(statement)

    print('✅ Schema created successfully')

    # Read seed data
    with open(SEED_PATH, 'r') as f:
        seed_data = json.load(f)

    locations = seed_data['locations']
    print(f'\nInserting seed data ({len(locations)} locations)...')

    # Insert all locations
    insert_sql = '''
        INSERT INTO locations (
            id, name, lat, lng, address, charger_type, connectors, power_kw, source, verified_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    '''

    for loc in locations:
        cursor.execute(insert_sql, (
            loc['id'],
            loc['name'],
            loc['lat'],
            loc['lng'],
            loc['address'],
            loc['charger_type'],
            loc['connectors'],
            loc['power_kw'],
            loc['source'],
            loc['verified_date']
        ))

    print(f'✅ Inserted {len(locations)} locations')

    # Verify integrity
    print('\n🔍 Verifying database integrity...')
    integrity = cursor.execute('PRAGMA integrity_check').fetchone()[0]
    if integrity == 'ok':
        print('✅ Database integrity: OK')
    else:
        raise Exception(f'Database integrity check failed: {integrity}')

    # Get row count
    row_count = cursor.execute('SELECT COUNT(*) FROM locations').fetchone()[0]
    print(f'✅ Locations table: {row_count} rows')

    # Commit first
    conn.commit()

    # Checkpoint WAL
    print('\n💾 Checkpointing WAL...')
    cursor.execute('PRAGMA wal_checkpoint(TRUNCATE)')
    print('✅ WAL checkpointed successfully')

    # Close connection
    conn.close()

    # Get file size
    file_size_kb = os.path.getsize(DB_PATH) / 1024
    print(f'\n✅ Database setup complete: {DB_PATH}')
    print(f'   Schema: {SCHEMA_PATH}')
    print(f'   Seed data: {SEED_PATH}')
    print(f'   File size: {file_size_kb:.2f} KB')

except Exception as e:
    print(f'❌ Database setup failed:')
    print(f'   {str(e)}')
    exit(1)
