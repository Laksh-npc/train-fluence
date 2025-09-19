import cron from 'node-cron';
import { ingestOnce } from '../services/dataIngestion.js';

let task = null;

export function startIngestCron() {
  if (task) return task;
  // Every minute
  task = cron.schedule('* * * * *', async () => {
    try {
      const res = await ingestOnce({ source: 'railradar_api' });
      console.log(`[ingestCron] processed=${res.processed}`);
    } catch (e) {
      console.error('[ingestCron] error', e);
    }
  });
  task.start();
  console.log('[ingestCron] scheduled every 1 minute');
  return task;
}

export function stopIngestCron() {
  if (task) {
    task.stop();
    task = null;
  }
}


