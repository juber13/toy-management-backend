import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { deleteOrderById, getOrderById, getOrders, getOrdersBySchoolId, placeOrder, updateOrderById } from '../controllers/vendorOrderController.js';

const router = express.Router();

router.post('/place',
    authMiddleware,
    placeOrder
);

router.put('/:id',
    authMiddleware,
    updateOrderById
);

router.get('/',
    authMiddleware,
    getOrders
);

router.get('/school/:schoolId',
    authMiddleware,
    getOrdersBySchoolId
)

router.get('/:id',
    authMiddleware,
    getOrderById
);

router.delete('/:id',
    authMiddleware,
    deleteOrderById
);

export default router;