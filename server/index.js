import express from 'express';
import fs from 'fs';
import path from 'path';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 4000;

const DATA_DIR = path.resolve('./server/data');
const DATA_FILE = path.join(DATA_DIR, 'stars.json');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ensure data dir and file exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

const readData = () => {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (err) {
        return [];
    }
};

const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// API: list stars
app.get('/api/stars', (req, res) => {
    res.json(readData());
});

// API: add star
app.post('/api/stars', (req, res) => {
    const star = req.body || {};
    console.log('[API] POST /api/stars - received', { origin: req.get('origin'), ip: req.ip, star: star && (star.id || star.timestamp) });
    if (!star.id) star.id = `star:${Date.now()}_${Math.random()}`;
    const data = readData();
    data.push(star);
    try {
        writeData(data);
        console.log('[API] POST /api/stars - wrote to file, total:', data.length);
        res.status(201).json(star);
    } catch (err) {
        console.error('[API] POST /api/stars - write error', err);
        res.status(500).json({ error: 'Failed to write data' });
    }
});

// API: update star by id
app.put('/api/stars/:id', (req, res) => {
    const id = req.params.id;
    const updates = req.body || {};
    console.log('[API] PUT /api/stars/:id - updating', id);
    let data = readData();
    const index = data.findIndex(s => s.id === id);
    if (index === -1) return res.status(404).json({ error: 'Star not found' });

    // Keep existing position and id, update zodiac signs
    data[index] = {
        ...data[index],
        ...updates,
        id: data[index].id, // Preserve ID
        position: data[index].position, // Keep original position
        timestamp: Date.now() // Update timestamp
    };

    try {
        writeData(data);
        console.log('[API] PUT /api/stars/:id - updated');
        res.json(data[index]);
    } catch (err) {
        console.error('[API] PUT /api/stars/:id - write error', err);
        res.status(500).json({ error: 'Failed to write data' });
    }
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// API: delete star by id
app.delete('/api/stars/:id', (req, res) => {
    const id = req.params.id;
    let data = readData();
    const before = data.length;
    data = data.filter(s => (s.id || s.key || `star:${s.timestamp}`) !== id && String(s.timestamp) !== id);
    writeData(data);
    if (data.length === before) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
});

// Simple admin UI to view & delete
app.get('/admin', (req, res) => {
    const stars = readData();
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Stars Admin</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,Arial,Helvetica,sans-serif;background:#061025;color:#e6eef8;padding:20px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{padding:10px;border:1px solid rgba(255,255,255,0.06);text-align:left}th{background:#071226}tr:nth-child(even){background:rgba(255,255,255,0.02)}button{background:#0b5cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer}form{display:inline}</style></head><body><h1>Saved Stars</h1><p><a href="/api/stars" target="_blank" style="color:#8fbafc">JSON API</a></p><table><thead><tr><th>ID</th><th>Sun</th><th>Moon</th><th>Rising</th><th>Date</th><th>Action</th></tr></thead><tbody>`;
    stars.forEach(s => {
        const id = s.id || s.key || `star:${s.timestamp}`;
        html += `<tr><td>${id}</td><td>${s.sunSign || ''}</td><td>${s.moonSign || ''}</td><td>${s.risingSign || ''}</td><td>${new Date(s.timestamp || 0).toLocaleString()}</td><td><form method="post" action="/delete"><input type="hidden" name="id" value="${id}"><button>Delete</button></form></td></tr>`;
    });
    html += `</tbody></table><p style="margin-top:18px;color:#9fb8e8;font-size:0.95rem">Tip: you can POST to <code>/api/stars</code> to add stars, or GET <code>/api/stars</code> to fetch JSON.</p></body></html>`;
    res.send(html);
});

// Form post handler for admin delete
app.post('/delete', (req, res) => {
    const id = req.body.id;
    let data = readData();
    data = data.filter(s => (s.id || s.key || `star:${s.timestamp}`) !== id);
    writeData(data);
    res.redirect('/admin');
});

app.listen(PORT, () => console.log(`Stars server running: http://localhost:${PORT}`));
