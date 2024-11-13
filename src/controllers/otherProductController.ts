import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import createHttpError from 'http-errors';
import OtherProductModel from '../models/otherProductsModel.js';
import { checkMogooseId } from '../utils/validation.js';
import VendorOrderModel from '../models/vendorOrderModel.js';

export const getOtherProductsByOrderId = expressAsyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    console.log(orderId);
    const otherProducts = await OtherProductModel.find({ order: orderId });
    res.status(200).json({ otherProducts });
});

export const addOtherProductByOrderId = expressAsyncHandler(async (req: Request, res: Response) => {
    const { item, quantity } = req.body;
    const { orderId } = req.params;
    checkMogooseId(orderId, 'Order');
    const isOrderExists = VendorOrderModel.findById(orderId);
    if (!isOrderExists) {
        throw createHttpError(404, 'Order not found');
    }
    const data = await new OtherProductModel({ item, quantity, order: orderId }).save();
    res.status(201).json({ message: 'Item added successfully!', otherProduct: data });
});

export const deleteOtherProductsById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id);
    checkMogooseId(id, 'Item');
    const resp = await OtherProductModel.findByIdAndDelete(id);
    console.log(resp);
    res.status(200).json({ message: 'Item deleted successfully!' });
});