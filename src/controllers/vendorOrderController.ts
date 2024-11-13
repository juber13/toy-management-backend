import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import VendorOrderModel from '../models/vendorOrderModel.js';
import createHttpError from 'http-errors';
import { IVendorOrder, VendorCartItem, VendorOrderStatus, VendorOrderType } from '../utils/types.js';
import { checkMogooseId } from '../utils/validation.js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { Types } from 'mongoose';
import SchoolModel from '../models/schoolModel.js';
import moment from 'moment-timezone';
import ToyModel from '../models/toyModel.js';
import StockModel from '../models/stockModel.js';

const serviceAccountAuth = new JWT({
    email: process.env.SHEET_EMAIL_ID,
    key: process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

export const writeDataToTheSheet = async (cart: VendorCartItem[], from: string, to: string, schoolName: string) => {

    const doc = new GoogleSpreadsheet(process.env.ORDER_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    let sheet = from == 'vendor' && to == 'school' ?
        doc.sheetsByIndex[1] : from == 'ngo' && to == 'school' ? doc.sheetsByIndex[2] : doc.sheetsByIndex[0];

    const currentTimeIST = moment().tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');

    for (let i = 0; i < cart.length; i++) {
        const order = cart[i];
        const data = await ToyModel.findById(order.toyId);
        to == 'school' ?
            await sheet.addRow({ TimeStamp: currentTimeIST, Brand: order.brand, 'Sub Brand': order.subBrand, 'Toy Name': data.name, 'Toy Code': data.codeName, Quantity: order.quantity, 'School Name': schoolName })
            : await sheet.addRow({ TimeStamp: currentTimeIST, Brand: order.brand, 'Sub Brand': order.subBrand, 'Toy Name': data.name, 'Toy Code': data.codeName, Quantity: order.quantity });
    }
}

export const removeQuantityAfterPlacingOrder = async (orderList: IVendorOrder[]) => {
    for (let i = 0; i < orderList.length; i++) {
        const order = orderList[i];
        for (let j = 0; j < order.listOfToysSentLink.length; j++) {
            const object = order.listOfToysSentLink[j];
            const existingStock = await StockModel.findOne({ toy: object.toy })
            existingStock.quantity -= object.quantity;
            await existingStock.save();
        }
    }
}

export const placeOrder = expressAsyncHandler(async (req: Request, res: Response) => {
    const { cart, from, to, schoolId }: { cart: VendorCartItem[], from: string, to: string, schoolId: Types.ObjectId | undefined } = req.body;

    if (from == to) {
        throw createHttpError(400, 'From and To cannot be same');
    }

    cart.forEach(async (toy) => {
        checkMogooseId(toy.toyId, 'toy');
        const parsedQuantity = Number(toy.quantity);
        const parsedPrice = Number(toy.price);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
            throw createHttpError(400, 'Quantity must be a valid positive integer.');
        } else if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
            throw createHttpError(400, 'Price must be a valid non-negative integer.');
        }
        const data = await ToyModel.findById(toy.toyId);
        if (!data) {
            throw createHttpError(404, 'Toy not found');
        }
    });
    let schoolName: string | null = null;
    const orderList: IVendorOrder[] = [];
    if (to == 'school') {
        checkMogooseId(schoolId, 'School');
        const isSchoolExists = await SchoolModel.findById(schoolId);
        if (!isSchoolExists) {
            throw createHttpError(400, 'School is not exists with give id');
        } else {
            schoolName = isSchoolExists.nameOfSchoolInstitution;
        }
    } else {
        if (schoolId) {
            throw createHttpError(400, 'School id is not required');
        }
    }

    if (!(['vendor', 'ngo', 'school'].includes(from) && ['vendor', 'ngo', 'school'].includes(to))) {
        throw createHttpError(400, 'Invalid from or to type');
    }

    if (from != 'vendor') {
        orderList.push({
            listOfToysSentLink: [],
            status: [{
                status: VendorOrderStatus.PENDING
            }],
            school: schoolId,
            from,
            to
        });
        cart.forEach((toy) => {
            orderList[0].listOfToysSentLink.push({
                toy: toy.toyId,
                quantity: toy.quantity,
                price: toy.price
            })
        });
    } else {
        cart.forEach((toy) => {
            const existingOrder = orderList.find(order => order.brand === toy.brand && order.subBrand === toy.subBrand);
            if (existingOrder) {
                existingOrder.listOfToysSentLink.push({
                    toy: toy.toyId,
                    quantity: toy.quantity,
                    price: toy.price
                });
            } else {
                orderList.push({
                    brand: toy.brand,
                    subBrand: toy.subBrand,
                    listOfToysSentLink: [{
                        toy: toy.toyId,
                        quantity: toy.quantity,
                        price: toy.price
                    }],
                    status: [{
                        status: VendorOrderStatus.PENDING
                    }],
                    from,
                    to,
                    school: schoolId
                });
            }
        });
    }

    // const session = await VendorOrderModel.startSession();
    // session.startTransaction();
    try {
        const saveOperations = orderList.map(order =>
            // new VendorOrderModel(order).save({ session })
            new VendorOrderModel(order).save()
        );
        await Promise.all(saveOperations);
        if (from == 'ngo' && to == 'school') {
            await removeQuantityAfterPlacingOrder(orderList);
        }
        // await session.commitTransaction();
        // session.endSession();
        await writeDataToTheSheet(cart, from, to, schoolName);
        res.status(201).json({ message: 'Order placed successfully' });
    } catch (error) {
        console.error('Error while saving order.', error);
        throw createHttpError(500, 'Internal Server Error. Please try again later.');
    } finally {
        // session.endSession();
    }
});

export const updateOrderById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { order } = req.body; // This contains the fields to be updated
    checkMogooseId(id, 'Order');
    try {
        delete order._id;
        delete order.id;
        delete order.createdAt;
        delete order.updatedAt;
        delete order.__v;
        const updatedOrder = await VendorOrderModel.findByIdAndUpdate(
            id,
            { $set: order },
            { new: true, runValidators: true } // Return the updated document and run validators
        ).populate('listOfToysSentLink.toy');

        if (!updatedOrder) {
            throw createHttpError(404, 'Order not found');
        }

        res.status(200).json({ message: 'Order updated successfully', order: updatedOrder });
    } catch (error) {
        console.error(error);
        throw createHttpError(500, 'Internal Server Error. Please try again later.');
    }
});

export const getOrders = expressAsyncHandler(async (req: Request, res: Response) => {
    const orders = await VendorOrderModel.find().populate('listOfToysSentLink.toy');
    res.status(200).json(orders);
});

export const getOrderById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    checkMogooseId(id, 'Order');
    const order = await VendorOrderModel.findById(id).populate('listOfToysSentLink.toy');
    if (!order) {
        throw createHttpError(404, 'Order not found');
    }
    res.status(200).json(order);
});

export const getOrdersBySchoolId = expressAsyncHandler(async (req: Request, res: Response) => {
    const { schoolId } = req.params;
    checkMogooseId(schoolId, "School");
    try {
        const isSchoolExists = SchoolModel.exists({ _id: schoolId });
        if (!isSchoolExists) {
            throw createHttpError(400, 'School is not exists with give id');
        }
        const vendorOrders = await VendorOrderModel.find({ school: schoolId }).populate('listOfToysSentLink.toy');
        res.status(200).json(vendorOrders);
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while fetching vendor orders.' });
    }
})

export const deleteOrderById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    checkMogooseId(id, 'order');
    const deletedOrder = await VendorOrderModel.findByIdAndDelete(id);

    if (!deletedOrder) {
        throw createHttpError(404, 'Order is not found.');
    }

    res.status(200).json({ message: 'Order deleted successfully.' });
});