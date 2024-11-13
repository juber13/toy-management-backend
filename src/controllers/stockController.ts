import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import StockModel from '../models/stockModel.js';
import createHttpError from 'http-errors';
import { checkMogooseId } from '../utils/validation.js';
import ToyModel from '../models/toyModel.js';
import VendorOrderModel from '../models/vendorOrderModel.js';

export const assignStockQuantity = expressAsyncHandler(async (req: Request, res: Response) => {
    const { toyId, quantity } = req.body;

    const isToyExists = ToyModel.exists({ _id: toyId });
    if (!isToyExists) {
        throw createHttpError(400, 'Toy is not exists with given id.');
    }
    // Check if the stock entry for the given toy already exists
    let stock = await StockModel.findOne({ toy: toyId });

    if (stock) {
        // If the stock entry exists, update the quantity
        stock.quantity = quantity;
        await stock.save();
        res.status(200).json({ message: 'Stock updated', stock });
    } else {
        // If no stock entry exists, create a new one
        stock = new StockModel({
            toy: toyId,
            quantity: quantity
        });
        await stock.save();
        res.status(201).json({ message: 'Stock created', stock });
    }
});

export const addNewStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const { toys, orderId } = req.body; // Expecting an array of { toy: ObjectId, quantity: number }
    checkMogooseId(orderId, 'Order');
    for (const item of toys) {
        const { toy, quantity } = item;
        checkMogooseId(toy, 'toy');
        const parsedQuantity = Number(quantity);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
            throw createHttpError(400, 'Quantity must be a valid non-negative integer.');
        }
        const isToyExists = ToyModel.exists({ _id: toy });
        if (!isToyExists) {
            throw createHttpError(400, 'Toy is not exists with given id.');
        }
    }
    const isOrderExists = await VendorOrderModel.exists({ _id: orderId });
    if (!isOrderExists) {
        throw createHttpError(400, 'Order is not exists with given id.');
    }
    try {

        const updateList = toys.map((item) => {
            const { toy, quantity } = item;
            return StockModel.findOneAndUpdate(
                { toy: toy }, // Search condition
                { $inc: { quantity } }, // Increment quantity
                {
                    new: true, // Return the updated document
                    upsert: true // Create the document if it doesn't exist
                }
            );
        });

        await Promise.all(updateList);
        const updatedOrder = await VendorOrderModel.findByIdAndUpdate(
            orderId,
            { isAddedOrRemovedFromTheStock: true },
            { new: true, runValidators: true } // Return the updated document
        );
        res.status(200).json({ message: 'Stock successfully updated.', order: updatedOrder });
    } catch (error) {
        console.error(error.message);
        throw createHttpError(400, 'Failed to add toys in stock', error.message);
    }
});

export const removeFromStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const { toys } = req.body; // Expecting an array of { toy: ObjectId, quantity: number }

    for (const item of toys) {
        const { toy, quantity } = item;
        checkMogooseId(toy, 'toy');
        const parsedQuantity = Number(quantity);
        if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
            throw createHttpError(400, 'Quantity must be a valid non-negative integer.');
        }
        const isToyExists = ToyModel.exists({ _id: toy });
        if (!isToyExists) {
            throw createHttpError(400, 'Toy is not exists with given id.');
        }
    }
    const session = await StockModel.startSession();
    session.startTransaction();

    try {

        for (const item of toys) {
            const { toy, quantity } = item;

            // Find the stock entry for the given toy
            const existingStock = await StockModel.findOne({ toy }).session(session);

            if (!existingStock) {
                throw new Error(`Stock entry for toy ${toy} does not exist.`);
            }

            if (existingStock.quantity < quantity) {
                throw new Error(`Not enough stock for toy ${toy}. Available quantity: ${existingStock.quantity}`);
            }

            // Update the quantity
            existingStock.quantity -= quantity;
            await existingStock.save({ session });
        }

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Stock quantities successfully reduced.' });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error(error.message);
        throw createHttpError(400, 'Failed to remove stock quantities', error.message);
    }
});

export const checkAvailableStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const { cart } = req.body; // Expecting an array of { toy: ObjectId, quantity: number }

    const insufficientStock = [];

    // Iterate over each toy and its required quantity
    for (const { toyId, quantity } of cart) {
        // Validate that the toyId is a valid ObjectId
        checkMogooseId(toyId, 'Toy');

        // Find the stock for the given toy
        const stock = await StockModel.findOne({ toy: toyId });
    
        // Check if the toy exists in stock and if there is enough quantity
        if (!stock || stock.quantity < quantity) {
            insufficientStock.push({
                toyId,
                message: !stock ? 'Toy not found in stock' : 'Insufficient stock',
                availableQuantity: stock ? stock.quantity : 0,
                requestedQuantity: quantity,
            });
        }
    }

    // If there are any items with insufficient stock, return them
    if (insufficientStock.length > 0) {
        res.status(400).json({
            error: 'Insufficient stock for one or more items',
            insufficientStock,
        });
    }

    // If all items have sufficient stock
    res.status(200).json({ message: 'Sufficient stock for all items' });
});

export const getStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const stock = await StockModel.find().populate('toy');
    res.status(200).json({ toys: stock });
});

export const deleteToyFromStock = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log(id)
    checkMogooseId(id, 'toy');
    const deletedStockItem = await StockModel.findOneAndDelete({ toy: id });

    if (!deletedStockItem) {
        throw createHttpError(404, 'Toy not found in stock');
    }

    res.status(200).json({ message: 'Toy deleted successfully from stock.' });
});