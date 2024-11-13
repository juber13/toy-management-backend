import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { deleteOrderById, getOrderBySchoolId, placeOrderToSchool, updateOrder } from '../controllers/schoolOrderController.js';

const router = express.Router();

router.post('/',
    authMiddleware,
    placeOrderToSchool
);

router.get('/school/:schoolId',
    authMiddleware,
    getOrderBySchoolId
);

router.put('/',
    authMiddleware,
    updateOrder
);

router.delete('/:orderId',
    authMiddleware,
    deleteOrderById
)

export default router;