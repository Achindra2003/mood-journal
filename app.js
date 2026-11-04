import express from 'express';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getDb } from './config/database.js';
import moodsRouter from './routes/moods.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
}

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Health: the app is up AND its database answers. 503 otherwise.
app.get('/health', async (req, res) => {
  const body = { application: 'Mood Journal', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() };
  try {
    getDb().prepare('SELECT 1').get();
    res.status(200).json({ status: 'UP', database: 'CONNECTED', ...body });
  } catch (error) {
    console.error('Health check failed:', error.message);
    res.status(503).json({ status: 'DOWN', database: 'DISCONNECTED', ...body });
  }
});

app.use('/api/moods', moodsRouter);

export default app;
