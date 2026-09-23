import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

const dbPath = path.join(dataDir, 'clinica.db');

// Create a singleton instance for Next.js to avoid multiple connections during hot-reload
const globalForDb = global as unknown as {
  db: Database.Database;
};

export const db =
  globalForDb.db ||
  new Database(dbPath, {
    verbose: console.log,
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date TEXT NOT NULL, -- Format YYYY-MM-DD
    time TEXT NOT NULL, -- Format HH:MM
    FOREIGN KEY(user_id) REFERENCES users(id),
    UNIQUE(date, time) -- Prevent double booking
  );
`);
