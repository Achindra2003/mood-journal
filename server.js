import 'dotenv/config';
import app from './app.js';
import { initDatabase, closeDatabase } from './config/database.js';

const PORT = process.env.PORT || 3001;

let server;
let isShuttingDown = false;

try {
  await initDatabase();
  server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Render sends SIGTERM on every deploy/restart; Ctrl+C sends SIGINT.
function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`${signal} received, shutting down gracefully`);

  // Safety net: force exit if open connections keep the server from closing.
  setTimeout(() => {
    console.error('Shutdown timed out, forcing exit');
    process.exit(1);
  }, 10000).unref();

  server.close(async (error) => {
    if (error) {
      console.error('Error closing HTTP server:', error);
      process.exitCode = 1;
    } else {
      console.log('HTTP server closed');
    }
    try {
      await closeDatabase();
      console.log('Database closed');
    } catch (dbError) {
      console.error('Error closing database:', dbError);
      process.exitCode = 1;
    }
    process.exit();
  });
  server.closeIdleConnections?.();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
