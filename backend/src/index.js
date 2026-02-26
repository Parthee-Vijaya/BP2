import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db/database.js';
import childrenRouter from './routes/children.js';
import caregiversRouter from './routes/caregivers.js';
import timeEntriesRouter from './routes/timeEntries.js';
import exportRouter from './routes/export.js';
import settingsRouter from './routes/settings.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});

// Initialize database
initializeDatabase();

// API Routes
app.use('/api/children', childrenRouter);
app.use('/api/caregivers', caregiversRouter);
app.use('/api/time-entries', timeEntriesRouter);
app.use('/api/export', exportRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'Barnepige Timeregistrering API'
    });
});

// Serve frontend static files in production
const frontendDist = path.resolve(__dirname, '..', '..', 'frontend', 'dist');
console.log('Frontend dist path:', frontendDist);
console.log('Frontend dist exists:', fs.existsSync(frontendDist));
if (fs.existsSync(frontendDist)) {
    console.log('Frontend dist contents:', fs.readdirSync(frontendDist));
}

app.use(express.static(frontendDist));

// Catch-all: serve React app for any non-API route
app.get('*', (req, res) => {
    const indexPath = path.join(frontendDist, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.json({
            message: 'Barnepige Timeregistrering API',
            version: '1.0.0',
            note: 'Frontend not built. Run: cd frontend && npm run build',
            debug: { frontendDist, indexExists: false }
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
========================================
  Barnepige Timeregistrering API
========================================
  Server kører på: http://localhost:${PORT}
  API Endpoints:
    - GET  /api/children
    - GET  /api/caregivers
    - GET  /api/time-entries
    - GET  /api/export/time-entries
    - GET  /api/health
========================================
    `);
});
