import { ingestOnce } from '../../src/services/dataIngestion.js';
import { db } from '../../src/config/firebase.js';

(async () => {
  const res = await ingestOnce({ source: 'railradar_mock' });
  console.log('processed', res.processed);
  const snap = await db.collection('trains').limit(1).get();
  if (!snap.empty) {
    const doc = snap.docs[0];
    console.log('sample', { id: doc.id, ...doc.data() });
  } else {
    console.log('no docs');
  }
  process.exit(0);
})();


