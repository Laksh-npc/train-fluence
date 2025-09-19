import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import trainsRouter from './routes/trains.js';
import statsRouter from './routes/corridorStats.js';
import uploadRouter from './routes/upload.js';
import liveTrainsRouter from './routes/liveTrains.js';
import { startIngestCron } from './cron/ingestCron.js';

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' });
});

app.use('/api/trains', trainsRouter);
app.use('/api/corridor-stats', statsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/live-trains', liveTrainsRouter);

// start cron if enabled
if (process.env.INGEST_CRON !== 'off') {
  startIngestCron();
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


