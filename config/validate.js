export function validateMood(body) {
  const mood = Number(body?.mood);
  const note = typeof body?.note === 'string' ? body.note.trim() : '';
  if (!Number.isInteger(mood) || mood < 1 || mood > 5) {
    return { error: 'mood must be a whole number from 1 to 5' };
  }
  if (note.length > 500) {
    return { error: 'note must be at most 500 characters' };
  }
  return { value: { mood, note } };
}
