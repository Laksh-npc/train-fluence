import { Router } from 'express';
import { db } from '../config/firebase.js';
import { RECENT_MINUTES } from '../config/constants.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { station, priority, limit = 100 } = req.query;
    const since = new Date(Date.now() - (RECENT_MINUTES * 60 * 1000));

    let query = db.collection('trains');
    // Firestore serverTimestamp cannot be compared from client easily; store updatedAt as ISO too if needed.
    // For now, return latest without time filter to keep compatibility.

    if (station) query = query.where('current_station', '==', String(station));
    if (priority) query = query.where('priority', '==', String(priority));

    const snapshot = await query.limit(Number(limit)).get();
    const trains = snapshot.docs.map((d) => ({
      train_no: d.id,
      train_name: d.get('train_name') || null,
      current_station: d.get('current_station') || null,
      next_station: d.get('next_station') || null,
      position: d.get('position') || null,
      delay_minutes: d.get('delay_minutes') ?? 0,
      priority: d.get('priority') || null,
      priority_score: d.get('priority_score') ?? null,
      platform_assigned: d.get('platform_assigned') ?? null,
      estimated_arrival_next: d.get('estimated_arrival_next') || null,
      dwell_time_seconds: d.get('dwell_time_seconds') ?? null,
    }));

    res.json({ trains });
  } catch (e) {
    console.error('GET /api/live-trains error', e);
    res.status(500).json({ error: 'Failed to fetch live trains' });
  }
});

export default router;

