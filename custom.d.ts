// custom.d.ts
import { Request } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        phoneNumber?: string;
        token?: string;
        id: string;
    }
}
