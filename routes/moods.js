import { Router } from 'express';
import { getPool } from '../config/database.js';
import { validateMood } from '../config/validate.js';

const router = Router();

// Express 4 does not catch rejected promises; forward them to the error middleware.
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

router.get('/', wrap(async (req, res) => {
  const { rows } = await getPool().query('SELECT * FROM moods ORDER BY id DESC');
  res.json(rows);
}));

router.post('/', wrap(async (req, res) => {
  const { value, error } = validateMood(req.body);
  if (error) return res.status(400).json({ error });
  const { rows } = await getPool().query(
    'INSERT INTO moods (mood, note) VALUES ($1, $2) RETURNING *',
    [value.mood, value.note]
  );
  res.status(201).json(rows[0]);
}));

router.delete('/:id', wrap(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'invalid id' });
  const { rowCount } = await getPool().query('DELETE FROM moods WHERE id = $1', [id]);
  if (rowCount === 0) return res.status(404).json({ error: 'not found' });
  res.status(204).end();
}));

export default router;
