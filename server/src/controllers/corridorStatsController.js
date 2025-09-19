import { db } from '../config/firebase.js';

export const getCorridorStats = async (req, res) => {
  try {
    const snapshot = await db
      .collection('corridorStats')
      .orderBy('date', 'desc')
      .limit(30)
      .get();

    const stats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json({ stats });
  } catch (err) {
    console.error('Error fetching corridor stats', err);
    res.status(500).json({ error: 'Failed to fetch corridor stats' });
  }
};


