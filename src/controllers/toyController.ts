import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import createHttpError from 'http-errors';
import ToyModel from '../models/toyModel.js';
import { Level } from '../utils/types.js';
import { checkMogooseId } from '../utils/validation.js';

export const addToy = expressAsyncHandler(async (req: Request, res: Response) => {
    const { toy } = req.body;

    // Create a new toy instance and save it
    const newToy = await (new ToyModel(toy)).save();

    // Send a success response
    res.status(201).json({ message: 'Toy added successfully!', toy: newToy });
});

export const updateToy = expressAsyncHandler(async (req: Request, res: Response) => {
    const { toy } = req.body;
    const toyId = toy.id;
    checkMogooseId(toyId, 'toy');
    delete toy.id;
    delete toy._id;
    delete toy.createdAt;
    delete toy.updatedAt;
    const updatedToy = await ToyModel.findByIdAndUpdate(toyId, toy, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on the updated fields
    });

    if (!updatedToy) {
        // If no toy is found with the provided ID, return a 404 error
        throw createHttpError(404, 'Toy not found.');
    }

    // Send the updated toy as a response
    res.status(200).json({ message: 'Toy updated successfully!', toy: updatedToy });
});

export const getToys = expressAsyncHandler(async (req: Request, res: Response) => {
    const toys = await ToyModel.find();
    res.status(200).json({ toys });
});

export const getToyById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Extract the toy ID from the request parameters

    checkMogooseId(id, 'Toy');

    // Find the toy by its ID
    const toy = await ToyModel.findById(id);

    if (!toy) {
        // If no toy is found with the provided ID, return a 404 error
        throw createHttpError(404, 'Toy not found.');
    }

    // Send the found toy as a response
    res.status(200).json({ toy });
});

export const deleteToyById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Extract the toy ID from the request parameters

    checkMogooseId(id, 'Toy');
    // Find the toy by ID and delete it
    const deletedToy = await ToyModel.findByIdAndDelete(id);

    if (!deletedToy) {
        // If no toy is found with the provided ID, return a 404 error
        throw createHttpError(404, 'Toy not found.');
    }

    // Send a success response
    res.status(200).json({ message: 'Toy deleted successfully!', toy: deletedToy });
});