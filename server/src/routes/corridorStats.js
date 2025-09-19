import { Router } from 'express';
import { getCorridorStats } from '../controllers/corridorStatsController.js';

const router = Router();

router.get('/', getCorridorStats);

export default router;


