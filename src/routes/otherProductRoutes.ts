import { Router } from "express";
import { addOtherProductByOrderId, deleteOtherProductsById, getOtherProductsByOrderId } from "../controllers/otherProductController.js";

const router = Router();

router.get('/:orderId',getOtherProductsByOrderId);
router.post('/:orderId',addOtherProductByOrderId);
router.delete('/:id',deleteOtherProductsById);

export default router;