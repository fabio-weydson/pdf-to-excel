import express from 'express';
import { convertFile } from '../controllers/converterController.js';

const router = express.Router();

router.post('/convert', convertFile);

export default router;
