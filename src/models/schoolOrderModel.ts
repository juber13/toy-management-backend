import mongoose, { Schema } from 'mongoose';
import { ISchoolOrder } from '../utils/types.js';
import moment from 'moment-timezone';

const schoolOrderSchema: Schema<ISchoolOrder> = new Schema({
    school: {
        type: Schema.Types.ObjectId,
        ref: 'School',
    },
    listOfToysSentLink: [
        {
            toy: {
                type: Schema.Types.ObjectId,
                ref: 'Toy',
            },
            quantity: {
                type: Number,
            }
        }
    ],
    dateOfDispatch: {
        type: String,
        default: 'Not Provided'
    },
    modeOfDispatch: {
        type: String,
        default: 'Not Provided'
    },
    trackingDetails: {
        type: String,
        default: 'Not Provided'
    },
    dateOfDelivery: {
        type: String,
        default: 'Not Provided'
    },
    photosVideosLink: {
        type: String,
        default: 'Not Provided'
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
schoolOrderSchema.virtual('createdAtIST').get(function () {
    return moment(this.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

// Define a virtual for updatedAtIST
schoolOrderSchema.virtual('updatedAtIST').get(function () {
    return moment(this.updatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

const SchoolOrderModel = mongoose.model<ISchoolOrder>('SchoolOrder', schoolOrderSchema);

export default SchoolOrderModel;
