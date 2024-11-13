import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import SchoolOrderModel from '../models/schoolOrderModel.js';
import { checkMogooseId } from '../utils/validation.js';
import createHttpError from 'http-errors';

export const placeOrderToSchool = expressAsyncHandler(async (req: Request, res: Response) => {
    const { order } = req.body;
    const savedOrder = await new SchoolOrderModel(order).save();
    res.status(201).json({ order: savedOrder, message: 'Toy added successfully!', });
});

export const getOrderBySchoolId = expressAsyncHandler(async (req: Request, res: Response) => {
    const { schoolId } = req.params;
    checkMogooseId(schoolId, 'School');
    const orders = await SchoolOrderModel.find({ school: schoolId })
        .populate('listOfToysSentLink.toy')
        .exec();

    res.json({ orders: orders ? orders : [] });
});

export const deleteOrderById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { orderId } = req.params;
    console.log(orderId)
    checkMogooseId(orderId, 'Order');
    const order = await SchoolOrderModel.findByIdAndDelete(orderId);

    if (!order) {
        throw createHttpError(404, 'Order not found');
    }

    res.json({ message: 'Order deleted successfully' });
});

export const updateOrder = expressAsyncHandler(async (req: Request, res: Response) => {
    const { order } = req.body;
    const orderId = order.id;
    checkMogooseId(orderId, 'order');
    delete order.id;
    delete order._id;
    const updatedOrder = await SchoolOrderModel.findByIdAndUpdate(orderId, order, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on the updated fields
    }).populate('listOfToysSentLink.toy');
    if (!updateOrder) {
        throw createHttpError(404, 'Order not found.');
    }

    // Send the updated toy as a response
    res.status(200).json({ message: 'Order updated successfully!', order: updatedOrder });
});