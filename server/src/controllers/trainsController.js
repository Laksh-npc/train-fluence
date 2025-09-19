import { db } from '../config/firebase.js';

const synthesizeTrainFields = (doc) => {
  const data = doc.data();
  return {
    id: doc.id,
    trainNumber: data.trainNumber,
    currentStation: data.currentStation,
    nextStation: data.nextStation,
    status: data.status,
    delayMinutes: data.delayMinutes ?? 0,
    position: data.position || { lat: 0, long: 0 },
    updatedAt: data.updatedAt || new Date().toISOString(),
    // Synthetic / defaulted fields
    priority: data.priority || 'Medium',
    platform: data.platform || Math.max(1, Math.floor(Math.random() * 12)),
    dwellTime: data.dwellTime ?? Math.floor(Math.random() * 10) + 2, // minutes
    segmentTravelTime: data.segmentTravelTime ?? Math.floor(Math.random() * 120) + 20, // minutes
  };
};

export const getTrains = async (req, res) => {
  try {
    const snapshot = await db.collection('trains').get();
    const trains = snapshot.docs.map(synthesizeTrainFields);
    res.json({ trains });
  } catch (err) {
    console.error('Error fetching trains', err);
    res.status(500).json({ error: 'Failed to fetch trains' });
  }
};


