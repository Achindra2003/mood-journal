import pg from 'pg';

const { Pool } = pg;

let pool = null;

function buildConfig() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set. Point it at a Postgres database (see .env.example).');
  }
  // Render's managed Postgres requires TLS; local/CI Postgres does not.
  const isLocal = /@(localhost|127\.0\.0\.1|db)(:|\/)/.test(connectionString);
  return { connectionString, ssl: isLocal ? false : { rejectUnauthorized: false }, max: 5 };
}

export function getPool() {
  if (!pool) {
    pool = new pg.Pool(buildConfig());
  }
  return pool;
}

export async function initDatabase() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS moods (
      id SERIAL PRIMARY KEY,
      mood INTEGER NOT NULL CHECK (mood BETWEEN 1 AND 5),
      note TEXT NOT NULL DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);
}

export async function closeDatabase() {
  if (pool) {
    const p = pool;
    pool = null;
    await p.end();
  }
}
