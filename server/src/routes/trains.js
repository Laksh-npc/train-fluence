import { Router } from 'express';
import { getTrains } from '../controllers/trainsController.js';

const router = Router();

router.get('/', getTrains);

export default router;


