# Mood Journal

A small Node.js/Express app for logging your mood (1-5) with an optional note.
Built to practise a full CI/CD workflow on Render: Docker, GitHub Actions, health checks,
signals and exit codes, ephemeral storage vs a managed database, and a staging environment.

## Run locally

```bash
npm install
cp .env.example .env
npm start            # http://localhost:3001
npm test
```

## API

| Method | Path | Description |
|---|---|---|
| GET | `/health` | `200 UP` when the app and database respond, `503 DOWN` otherwise |
| GET | `/api/moods` | List entries, newest first |
| POST | `/api/moods` | Create `{ "mood": 1-5, "note": "..." }` |
| DELETE | `/api/moods/:id` | Delete an entry |

## Process lifecycle

- `SIGTERM` / `SIGINT` stop the HTTP server, close the database, then exit.
- Exit code `1` if the database cannot be initialised at startup, or if shutdown fails or times out (10 s).
- The Dockerfile runs `node server.js` in exec form so Node is PID 1 and receives signals directly.

## Docker

```bash
docker build -t mood-journal .
docker run -p 3001:3001 -e PORT=3001 mood-journal
```
