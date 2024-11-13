import express from 'express';
import toysRoutes from './toysRoutes.js';
import schoolRoutes from './schoolRoutes.js';
import stockRoutes from './stockRoutes.js';
import vendorOrderRoutes from './vendorOrderRoutes.js';
import authRoutes from './authRoutes.js';
import schoolOrderRoutes from './schoolOrderRoutes.js';
import otherProductRoutes from './otherProductRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/toys', toysRoutes);
router.use('/school', schoolRoutes);
router.use('/stock', stockRoutes);
router.use('/vendor-order', vendorOrderRoutes);
router.use('/school-order', schoolOrderRoutes);
router.use('/other-products', otherProductRoutes);

export default router;