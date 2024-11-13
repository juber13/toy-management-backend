import mongoose, { Document, Schema } from 'mongoose';
import { IVendorOrder, VendorOrderStatus, VendorOrderType } from '../utils/types.js';
import moment from 'moment-timezone';

const vendorOrderSchema: Schema<IVendorOrder & Document> = new Schema({
    listOfToysSentLink: [
        {
            toy: {
                type: Schema.Types.ObjectId,
                ref: 'Toy',
            },
            quantity: {
                type: Number,
            },
            price: {
                type: Number
            }
        }
    ],
    brand: {
        type: String,
        default: 'Not Provided'
    },
    subBrand: {
        type: String,
        default: 'Not Provided'
    },
    to: {
        type: String,
        default: 'Not Provided'
    },
    from: {
        type: String,
        default: 'Not Provided'
    },
    description: {
        type: String,
        default: 'Not Provided'
    },
    status: [
        {
            timestamps: {
                type: String,
                default: "Not Provided"
            },
            personName: {
                type: String,
                default: "Not Provided"
            },
            contactNumber: {
                type: String,
                default: "Not Provided"
            },
            status: {
                type: String,
                enum: VendorOrderStatus
            }
        }
    ],
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
        required: false
    },
    photosVideosLink: {
        type: String,
        default: 'Not Provided'
    },
    isAddedOrRemovedFromTheStock :{
        type: Boolean,
        default: false
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
vendorOrderSchema.virtual('createdAtIST').get(function () {
    return moment(this.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

// Define a virtual for updatedAtIST
vendorOrderSchema.virtual('updatedAtIST').get(function () {
    return moment(this.updatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

const VendorOrderModel = mongoose.model<IVendorOrder & Document>('VendorOrder', vendorOrderSchema);

export default VendorOrderModel;
