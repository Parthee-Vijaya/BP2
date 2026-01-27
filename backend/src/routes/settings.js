import { Router } from 'express';
import db from '../db/database.js';

const router = Router();

// GET /api/settings/month-interval - Hent nuværende månedsinterval
router.get('/month-interval', (req, res) => {
    try {
        // Hent det aktive interval (seneste der er trådt i kraft)
        const today = new Date().toISOString().split('T')[0];
        const interval = db.prepare(`
            SELECT * FROM month_interval_history
            WHERE effective_from <= ?
            ORDER BY effective_from DESC
            LIMIT 1
        `).get(today);

        if (!interval) {
            // Standard: 1. til sidste dag i måneden
            return res.json({
                start_day: 1,
                end_day: 31,
                effective_from: null,
                is_default: true
            });
        }

        res.json({
            ...interval,
            is_default: false
        });
    } catch (error) {
        console.error('Fejl ved hentning af månedsinterval:', error);
        res.status(500).json({ error: 'Kunne ikke hente månedsinterval' });
    }
});

// GET /api/settings/month-interval/history - Hent historik
router.get('/month-interval/history', (req, res) => {
    try {
        const history = db.prepare(`
            SELECT * FROM month_interval_history
            ORDER BY effective_from DESC
        `).all();

        res.json(history);
    } catch (error) {
        console.error('Fejl:', error);
        res.status(500).json({ error: 'Kunne ikke hente historik' });
    }
});

// PUT /api/settings/month-interval - Opdater månedsinterval (gælder fra d.d. og frem)
router.put('/month-interval', (req, res) => {
    try {
        const { start_day, end_day } = req.body;

        if (!start_day || !end_day) {
            return res.status(400).json({ error: 'Start- og slutdag er påkrævet' });
        }

        if (start_day < 1 || start_day > 31 || end_day < 1 || end_day > 31) {
            return res.status(400).json({ error: 'Dag skal være mellem 1 og 31' });
        }

        const today = new Date().toISOString().split('T')[0];

        // Indsæt ny historik-post (gælder fra i dag)
        db.prepare(`
            INSERT INTO month_interval_history (start_day, end_day, effective_from)
            VALUES (?, ?, ?)
        `).run(start_day, end_day, today);

        // Opdater settings-tabellen også
        db.prepare(`
            INSERT OR REPLACE INTO settings (key, value, updated_at, effective_from)
            VALUES ('month_interval_start', ?, CURRENT_TIMESTAMP, ?)
        `).run(String(start_day), today);

        db.prepare(`
            INSERT OR REPLACE INTO settings (key, value, updated_at, effective_from)
            VALUES ('month_interval_end', ?, CURRENT_TIMESTAMP, ?)
        `).run(String(end_day), today);

        res.json({
            start_day,
            end_day,
            effective_from: today,
            message: `Månedsinterval ændret til d. ${start_day} - d. ${end_day}. Gælder fra ${today} og frem.`
        });
    } catch (error) {
        console.error('Fejl ved opdatering af månedsinterval:', error);
        res.status(500).json({ error: 'Kunne ikke opdatere månedsinterval' });
    }
});

export default router;
