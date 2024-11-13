import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { tokenGenerator } from '../utils/token.js';
import createHttpError from 'http-errors';

export const signIn = expressAsyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (email == process.env.CLIENT_EMAIL && password == process.env.CLIENT_PASSWORD) {
        const token = tokenGenerator({ email });
        res.status(200).json({ token, message: 'Logged in successfully.' });
    } else {
        throw createHttpError(401, 'Invalid Credentials.');
    }
});