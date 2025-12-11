// ============================================
// COSMIC UNIVERSE - Express Server
// ============================================
// This server does 3 things:
// 1. Serves the React app (static files)
// 2. Provides API endpoints to save/load stars
// 3. Stores star data in a JSON file

import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4001;

// Where we store the star data
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'stars.json');

// === MIDDLEWARE ===
app.use(cors()); // Allow requests from different ports (like Vite dev server)
app.use(express.json()); // Parse JSON from requests
app.use(express.urlencoded({ extended: true })); // Parse form data
app.use(express.static(path.join(__dirname, '../dist'))); // Serve React app

// === SETUP ===
// Create data directory and file if they don't exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

// === HELPER FUNCTIONS ===
// Read all stars from the JSON file
const readData = () => {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(raw || '[]');
    } catch (err) {
        return [];
    }
};

// Write stars to the JSON file
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ============================================
// API ROUTES
// ============================================

// GET /api/stars - Get all stars
app.get('/api/stars', (req, res) => {
    res.json(readData());
});

// POST /api/stars - Add a new star
app.post('/api/stars', (req, res) => {
    const star = req.body || {};

    // Generate unique ID if not provided
    if (!star.id) {
        star.id = `star:${Date.now()}_${Math.random()}`;
    }

    const data = readData();
    data.push(star);

    try {
        writeData(data);
        console.log(`✨ New star added! Total: ${data.length}`);
        res.status(201).json(star);
    } catch (err) {
        console.error('Error saving star:', err);
        res.status(500).json({ error: 'Failed to save star' });
    }
});

// PUT /api/stars/:id - Update an existing star
app.put('/api/stars/:id', (req, res) => {
    const id = req.params.id;
    const updates = req.body || {};

    let data = readData();
    const index = data.findIndex(s => s.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Star not found' });
    }

    // Update the star (keep ID and position, update zodiac signs)
    data[index] = {
        ...data[index],
        ...updates,
        id: data[index].id,
        position: data[index].position,
        timestamp: Date.now()
    };

    try {
        writeData(data);
        console.log(`📝 Star updated: ${id}`);
        res.json(data[index]);
    } catch (err) {
        console.error('Error updating star:', err);
        res.status(500).json({ error: 'Failed to update star' });
    }
});

// DELETE /api/stars/:id - Delete a star
app.delete('/api/stars/:id', (req, res) => {
    const id = req.params.id;
    let data = readData();
    const before = data.length;

    data = data.filter(s => (s.id || `star:${s.timestamp}`) !== id);
    writeData(data);

    if (data.length === before) {
        return res.status(404).json({ error: 'Star not found' });
    }

    console.log(`🗑️ Star deleted: ${id}`);
    return res.json({ ok: true });
});

// ============================================
// ADMIN & UTILITY ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({ ok: true, stars: readData().length });
});

// Admin page - view all stars
app.get('/admin', (req, res) => {
    const stars = readData();
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Stars Admin</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,Arial,Helvetica,sans-serif;background:#061025;color:#e6eef8;padding:20px}table{width:100%;border-collapse:collapse;margin-top:12px}th,td{padding:10px;border:1px solid rgba(255,255,255,0.06);text-align:left}th{background:#071226}tr:nth-child(even){background:rgba(255,255,255,0.02)}button{background:#0b5cff;color:#fff;border:none;padding:6px 10px;border-radius:6px;cursor:pointer}form{display:inline}</style></head><body><h1>Saved Stars (${stars.length})</h1><p><a href="/api/stars" target="_blank" style="color:#8fbafc">View JSON</a></p><table><thead><tr><th>ID</th><th>Sun</th><th>Moon</th><th>Rising</th><th>Date</th><th>Action</th></tr></thead><tbody>`;
    stars.forEach(s => {
        const id = s.id || `star:${s.timestamp}`;
        html += `<tr><td>${id}</td><td>${s.sunSign || ''}</td><td>${s.moonSign || ''}</td><td>${s.risingSign || ''}</td><td>${new Date(s.timestamp || 0).toLocaleString()}</td><td><form method="post" action="/delete"><input type="hidden" name="id" value="${id}"><button>Delete</button></form></td></tr>`;
    });
    html += `</tbody></table></body></html>`;
    res.send(html);
});

// Delete star from admin page
app.post('/delete', (req, res) => {
    const id = req.body.id;
    let data = readData();
    data = data.filter(s => (s.id || `star:${s.timestamp}`) !== id);
    writeData(data);
    res.redirect('/admin');
});

// ============================================
// SPA FALLBACK
// ============================================
// All other routes serve the React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log(`🌟 Cosmic Universe server running on http://localhost:${PORT}`);
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`);
});
