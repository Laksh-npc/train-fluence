import { Router } from 'express';
import { uploadData } from '../controllers/uploadController.js';

const router = Router();

router.post('/', uploadData);

export default router;


