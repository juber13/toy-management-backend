import mongoose, { Schema } from 'mongoose';
import { IStock } from '../utils/types.js';
import moment from 'moment-timezone';

const stockSchema: Schema<IStock> = new Schema({
    toy: {
        type: Schema.Types.ObjectId,
        ref: 'Toy',
    },
    quantity: {
        type: Number,
    },
    createdAt: {
        type: Date,
        select: false
    },
    updatedAt: {
        type: Date,
        select: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Define a virtual for createdAtIST
stockSchema.virtual('createdAtIST').get(function () {
    return moment(this.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

// Define a virtual for updatedAtIST
stockSchema.virtual('updatedAtIST').get(function () {
    return moment(this.updatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

const StockModel = mongoose.model<IStock>('Stock', stockSchema);

export default StockModel;
