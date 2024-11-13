import mongoose, { Schema } from 'mongoose';
import { Level, IToyModel } from '../utils/types.js';
import moment from 'moment-timezone';

const toySchema: Schema<IToyModel> = new Schema({
    brand: {
        type: String,
        default: 'Not Provided'
    },
    subBrand: {
        type: String,
        default: 'Not Provided'
    },
    name: {
        type: String,
        default: 'Not Provided'
    },
    price: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        default: 'Not Provided'
    },
    codeName: {
        type: String,
        default: 'Not Provided'
    },
    cataloguePgNo: {
        type: Number,
        default: 0
    },
    level: {
        type: String,
        enum: Level,
    },
    learn: {
        type: [String],
        default: []
    },
    link: {
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
toySchema.virtual('createdAtIST').get(function () {
    return moment(this.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

// Define a virtual for updatedAtIST
toySchema.virtual('updatedAtIST').get(function () {
    return moment(this.updatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

// Create the model using the schema
const ToyModel = mongoose.model<IToyModel>('Toy', toySchema);

export default ToyModel;
