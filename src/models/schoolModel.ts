import mongoose, { Schema } from 'mongoose';
import { ISchool } from '../utils/types.js'; // Adjust the path as needed
import moment from 'moment-timezone';

const schoolSchema: Schema<ISchool> = new Schema({
    code: {
        type: String,
        unique: true,
    },
    timestamp: {
        type: String,
        default: 'Not Provided'
    },
    nameOfSchoolInstitution: {
        type: String,
        default: 'Not Provided'
    },
    boardAffiliatedAndMediumOfInstruction: {
        type: String,
        default: 'Not Provided'
    },
    typeOfInstitutionSchool: {
        type: String,
        default: 'Not Provided'
    },
    villageNameIfAny: {
        type: String,
        default: 'Not Provided'
    },
    district: {
        type: String,
        default: 'Not Provided'
    },
    state: {
        type: String,
        default: 'Not Provided'
    },
    fullAddressWithPinCode: {
        type: String,
        default: 'Not Provided'
    },
    nameOfPrincipalAndManagement: {
        type: String,
        default: 'Not Provided'
    },
    contactNumberOfPrincipalManagement: {
        type: String,
        default: 'Not Provided'
    },
    nameOfCoordinatorForLibrary: {
        type: String,
        default: 'Not Provided'
    },
    contactDetailsOfCoordinatorTeacher: {
        type: String,
        default: 'Not Provided'
    },
    isThereCupboardForSafekeeping: {
        type: String,
        default: 'Not Provided'
    },
    isThereRoomForLibrary: {
        type: String,
        default: 'Not Provided'
    },
    picturesOfLibraryRoomAndCupboard: {
        type: String,
        default: 'Not Provided'
    },
    cupboardPictures: {
        type: String,
        default: 'Not Provided'
    },
    numberOfStudentsBalwadiClass1: {
        type: String,
        default: 'Not Provided'
    },
    numberOfStudentsClass2To4: {
        type: String,
        default: 'Not Provided'
    },
    numberOfStudentsClass5AndAbove: {
        type: String,
        default: 'Not Provided'
    },
    referredBy: {
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
schoolSchema.virtual('createdAtIST').get(function () {
    return moment(this.createdAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

// Define a virtual for updatedAtIST
schoolSchema.virtual('updatedAtIST').get(function () {
    return moment(this.updatedAt).tz('Asia/Kolkata').format('YYYY-MM-DD HH:mm:ss');
});

const SchoolModel = mongoose.model<ISchool>('School', schoolSchema);

export default SchoolModel;