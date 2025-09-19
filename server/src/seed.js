import 'dotenv/config';
import { db } from './config/firebase.js';

const seed = async () => {
  // Seed trains
  const trains = [
    {
      trainNumber: '12951',
      currentStation: 'New Delhi',
      nextStation: 'Gwalior Junction',
      status: 'on-time',
      delayMinutes: 0,
      position: { lat: 28.6139, long: 77.2090 },
      updatedAt: new Date().toISOString(),
      priority: 'High',
      platform: 5,
      dwellTime: 4,
      segmentTravelTime: 65,
    },
    {
      trainNumber: '12009',
      currentStation: 'Allahabad Junction',
      nextStation: 'Kanpur Central',
      status: 'minor-delay',
      delayMinutes: 12,
      position: { lat: 25.3176, long: 82.9739 },
      updatedAt: new Date().toISOString(),
      priority: 'Medium',
      platform: 2,
      dwellTime: 6,
      segmentTravelTime: 80,
    },
    {
      trainNumber: '22691',
      currentStation: 'Jaipur Junction',
      nextStation: 'Ajmer Junction',
      status: 'major-delay',
      delayMinutes: 45,
      position: { lat: 26.9124, long: 75.7873 },
      updatedAt: new Date().toISOString(),
      priority: 'High',
      platform: 1,
      dwellTime: 10,
      segmentTravelTime: 95,
    },
  ];

  const batch = db.batch();
  const trainsCol = db.collection('trains');
  trains.forEach((t) => batch.set(trainsCol.doc(), t));

  // Seed corridor stats (last 7 days)
  const today = new Date();
  const statsCol = db.collection('corridorStats');
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const doc = {
      date: d.toISOString().slice(0, 10),
      totalTrains: Math.floor(Math.random() * 500) + 800,
      avgDelay: parseFloat((Math.random() * 20).toFixed(1)),
      busiestSection: ['Delhi - Mathura', 'Mathura - Kota', 'Surat - Mumbai'][Math.floor(Math.random() * 3)],
      onTimePercentage: parseFloat((70 + Math.random() * 25).toFixed(1)),
    };
    batch.set(statsCol.doc(), doc);
  }

  await batch.commit();
  console.log('Seed completed');
};

seed().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});


