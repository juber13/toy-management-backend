import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addToy, deleteToyById, getToyById, getToys, updateToy } from '../controllers/toyController.js';

const router = express.Router();

router.post('/',authMiddleware,addToy);

router.get('/',authMiddleware,getToys);

router.get('/:id',authMiddleware,getToyById);

router.put('/',authMiddleware,updateToy);

router.delete('/:id',authMiddleware,deleteToyById);

export default router;