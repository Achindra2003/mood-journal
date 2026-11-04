const EMOJI = { 1: '\u{1F61E}', 2: '\u{1F641}', 3: '\u{1F610}', 4: '\u{1F642}', 5: '\u{1F604}' };
const form = document.getElementById('form');
const list = document.getElementById('list');
const empty = document.getElementById('empty');
const errorEl = document.getElementById('error');

async function load() {
  const res = await fetch('/api/moods');
  const rows = await res.json();
  list.replaceChildren();
  empty.hidden = rows.length > 0;
  for (const row of rows) {
    const li = document.createElement('li');
    const body = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = `${EMOJI[row.mood]} ${row.mood}/5`;
    const note = document.createElement('div');
    note.textContent = row.note;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = row.created_at;
    body.append(title, note, meta);
    const del = document.createElement('button');
    del.className = 'del';
    del.textContent = 'Delete';
    del.addEventListener('click', async () => {
      await fetch(`/api/moods/${row.id}`, { method: 'DELETE' });
      load();
    });
    li.append(body, del);
    list.append(li);
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorEl.textContent = '';
  const mood = form.elements.mood.value;
  const note = document.getElementById('note').value;
  const res = await fetch('/api/moods', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mood, note })
  });
  if (!res.ok) {
    errorEl.textContent = (await res.json()).error || 'Could not save';
    return;
  }
  document.getElementById('note').value = '';
  load();
});

load();
