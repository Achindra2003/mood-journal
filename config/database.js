import { DatabaseSync } from 'node:sqlite';

let db = null;

export function getDb() {
  if (!db) {
    db = new DatabaseSync(process.env.DB_PATH || './moods.db');
  }
  return db;
}

export async function initDatabase() {
  getDb().exec(`
    CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export async function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}
