import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

const dbPath = path.join(dataDir, 'clinica.db');

const globalForDb = global as unknown as { db: Database.Database };

export const db =
  globalForDb.db ||
  new Database(dbPath);

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

// Schema versioning — bump SCHEMA_VERSION to force a clean reset in dev
const SCHEMA_VERSION = 2;

db.exec(`CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)`);
const ver = db.prepare('SELECT version FROM schema_version').get() as any;

if (!ver || ver.version < SCHEMA_VERSION) {
  db.exec(`
    DROP TABLE IF EXISTS appointments;
    DROP TABLE IF EXISTS users;
    DELETE FROM schema_version;

    CREATE TABLE users (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      name     TEXT    NOT NULL,
      cpf      TEXT    UNIQUE NOT NULL,
      password TEXT    NOT NULL,
      role     TEXT    NOT NULL DEFAULT 'patient'
    );

    CREATE TABLE appointments (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      date       TEXT    NOT NULL,
      time       TEXT    NOT NULL,
      status     TEXT    NOT NULL DEFAULT 'active',
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY(user_id) REFERENCES users(id)
    );

    CREATE UNIQUE INDEX idx_active_slot
      ON appointments(date, time)
      WHERE status = 'active';

    INSERT INTO schema_version (version) VALUES (${SCHEMA_VERSION});
  `);

  // Seed default admin
  db.prepare(
    "INSERT INTO users (name, cpf, password, role) VALUES (?, ?, ?, 'admin')"
  ).run('Dr. Admin', '00000000000', 'admin123');
}
