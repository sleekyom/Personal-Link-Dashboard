#!/usr/bin/env python3

import sqlite3
import os

# Read SQL from temp-init.sql
with open('temp-init.sql', 'r') as f:
    sql = f.read()

# Get database path from .env
db_path = 'dev.db'
with open('.env', 'r') as f:
    for line in f:
        if line.startswith('DATABASE_URL='):
            db_path = line.split('=')[1].strip().strip('"').replace('file:', '')
            break

print(f'📦 Initializing database at: {db_path}')

# Create database directory if needed
db_dir = os.path.dirname(db_path)
if db_dir and not os.path.exists(db_dir):
    os.makedirs(db_dir, exist_ok=True)

# Connect and execute SQL
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    # Execute the SQL (executescript handles multiple statements)
    cursor.executescript(sql)
    conn.commit()
    print('✅ Database initialized successfully!')
    print(f'📍 Database created at: {os.path.abspath(db_path)}')
    print('\n✨ You can now restart your application.')
except sqlite3.Error as e:
    # Check if error is just about tables already existing
    if 'already exists' in str(e):
        print('⚠️  Database tables already exist. Skipping...')
        print('✅ Database is ready!')
    else:
        print(f'❌ Error: {e}')
        exit(1)
finally:
    conn.close()

# Clean up temp file
os.remove('temp-init.sql')
print('🧹 Cleaned up temporary files.')
