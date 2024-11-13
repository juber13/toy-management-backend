import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addNewStock, assignStockQuantity, checkAvailableStock, deleteToyFromStock, getStock, removeFromStock } from '../controllers/stockController.js';

const router = express.Router();

router.post('/',
    authMiddleware,
    addNewStock
);

router.post('/remove',
    authMiddleware,
    removeFromStock
);

router.post('/check-available',
    authMiddleware,
    checkAvailableStock
);

router.post('/assign-quantity',
    authMiddleware,
    assignStockQuantity
);

router.get('/',
    authMiddleware,
    getStock
);

router.delete('/:id',
    authMiddleware,
    deleteToyFromStock
)

export default router;