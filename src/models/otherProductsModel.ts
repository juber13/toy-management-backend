import mongoose, { Schema } from 'mongoose';
import { IOtherProduct, IStock } from '../utils/types.js';
import moment from 'moment-timezone';

const otherProductSchema: Schema<IOtherProduct> = new Schema({
    order: {
        type: Schema.Types.ObjectId,
        ref: 'VendorOrder',
    },
    item: {
        type: String,
        default: 'Not Provided'
    },
    quantity: {
        type: Number,
        default: 0
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
otherProductSchema.virtual('createdAtIST').get(function () {
    return moment(this.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

// Define a virtual for updatedAtIST
otherProductSchema.virtual('updatedAtIST').get(function () {
    return moment(this.updatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

const OtherProductModel = mongoose.model<IOtherProduct>('OtherProduct', otherProductSchema);

export default OtherProductModel;
