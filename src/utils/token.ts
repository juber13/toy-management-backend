import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';

export const tokenGenerator = (payload: any) => {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRATION_TIME! });
}

export const verifyJwtToken = async (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET) as { [key: string]: any };
}

export const decodeJwtToken = (token: string) => {
    return jwt.decode(token) as { [key: string]: any };
}