import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

if (!process.env.DATABASE_URL) {
  throw new Error('Set DATABASE_URL to a Postgres database to run the API tests');
}
const { default: app } = await import('../app.js');
const { initDatabase, closeDatabase } = await import('../config/database.js');

let server;
let base;

before(async () => {
  await initDatabase();
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await closeDatabase();
});

const json = { 'Content-Type': 'application/json' };

test('GET /health reports UP with a live database', async () => {
  const res = await fetch(`${base}/health`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.status, 'UP');
  assert.equal(body.database, 'CONNECTED');
});

test('create, list and delete a mood', async () => {
  const created = await fetch(`${base}/api/moods`, {
    method: 'POST', headers: json, body: JSON.stringify({ mood: 5, note: 'great day' })
  });
  assert.equal(created.status, 201);
  const row = await created.json();
  const list = await (await fetch(`${base}/api/moods`)).json();
  assert.ok(list.some((r) => r.id === row.id));
  assert.equal((await fetch(`${base}/api/moods/${row.id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/api/moods/${row.id}`, { method: 'DELETE' })).status, 404);
});

test('POST rejects an invalid mood', async () => {
  const res = await fetch(`${base}/api/moods`, {
    method: 'POST', headers: json, body: JSON.stringify({ mood: 99 })
  });
  assert.equal(res.status, 400);
});
