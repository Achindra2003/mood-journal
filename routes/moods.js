import { Router } from 'express';
import { getDb } from '../config/database.js';
import { validateMood } from '../config/validate.js';

const router = Router();

router.get('/', async (req, res) => {
  const rows = getDb().prepare('SELECT * FROM moods ORDER BY id DESC').all();
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { value, error } = validateMood(req.body);
  if (error) return res.status(400).json({ error });
  const info = getDb().prepare('INSERT INTO moods (mood, note) VALUES (?, ?)').run(value.mood, value.note);
  const row = getDb().prepare('SELECT * FROM moods WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

router.delete('/:id', async (req, res) => {
  const info = getDb().prepare('DELETE FROM moods WHERE id = ?').run(Number(req.params.id));
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
});

export default router;
