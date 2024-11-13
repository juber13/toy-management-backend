import moment from 'moment';
import mongoose, { Document, Types } from 'mongoose';

export interface IToyModel extends Document {
    brand: string;
    subBrand: string;
    name: string;
    price: number;
    category: string;
    codeName: string;
    cataloguePgNo: number;
    level: Level;
    learn: string[];
    link: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISchool extends Document {
    code: string;
    timestamp?: string;
    nameOfSchoolInstitution?: string;
    boardAffiliatedAndMediumOfInstruction?: string;
    typeOfInstitutionSchool?: string;
    villageNameIfAny?: string;
    district?: string;
    state?: string;
    fullAddressWithPinCode?: string;
    nameOfPrincipalAndManagement?: string;
    contactNumberOfPrincipalManagement?: string;
    nameOfCoordinatorForLibrary?: string;
    contactDetailsOfCoordinatorTeacher?: string;
    isThereCupboardForSafekeeping?: string;
    isThereRoomForLibrary?: string;
    picturesOfLibraryRoomAndCupboard?: string;
    cupboardPictures?: string;
    numberOfStudentsBalwadiClass1: string;
    numberOfStudentsClass2To4: string;
    numberOfStudentsClass5AndAbove: string;
    referredBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface SchoolDataFromExcelSheet {
    code: string | undefined;
    timestamp: string | undefined;
    nameOfSchoolInstitution: string | undefined;
    boardAffiliatedAndMediumOfInstruction: string | undefined;
    typeOfInstitutionSchool: string | undefined;
    villageNameIfAny: string | undefined;
    district: string | undefined;
    state: string | undefined;
    fullAddressWithPinCode: string | undefined;
    nameOfPrincipalAndManagement: string | undefined;
    contactNumberOfPrincipalManagement: string | undefined;
    nameOfCoordinatorForLibrary: string | undefined;
    contactDetailsOfCoordinatorTeacher: string | undefined;
    isThereCupboardForSafekeeping: string | undefined;
    isThereRoomForLibrary: string | undefined;
    picturesOfLibraryRoomAndCupboard: string | undefined;
    numberofStudentsBalwadiClass1: string | undefined;
    numberofStudentsClass2Class4: string | undefined;
    numberofStudentsclass5AndAbove: string | undefined;
    referredBy: string | undefined;
}

export interface SchoolOrder {
    toyList: {
        toy: Types.ObjectId;
        quantity: number;
    }[];
    address?: string;
};

export interface ISchoolOrder extends Document {
    timestamp?: string;
    school?: Types.ObjectId;
    listOfToysSentLink?: {
        toy: Types.ObjectId;
        quantity?: number;
    }[];
    dateOfDispatch?: string;
    modeOfDispatch?: string;
    trackingDetails?: string;
    dateOfDelivery?: string;
    photosVideosLink?: string;
    createdAt: Date;
    updatedAt: Date;
};

export interface IStock extends Document {
    toy: Types.ObjectId;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
};

export interface IVendorOrder {
    listOfToysSentLink?: {
        toy: Types.ObjectId;
        quantity?: number;
        price: number;
    }[];
    brand?: string;
    subBrand?: string;
    to?: string;
    from?: string;
    address?: string;
    description?: string;
    status?: {
        timestamps?: string;
        personName?: string;
        contactNumber?: string;
        status?: VendorOrderStatus;
    }[];
    school?: Types.ObjectId | undefined;
    photosVideosLink?: string;
    isAddedOrRemovedFromTheStock?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
};

export enum VendorOrderType {
    SCHOOL = 'SCHOOL',
    NGO = 'NGO'
};

export interface VendorCartItem {
    toyId: Types.ObjectId;
    quantity: number;
    brand: string;
    subBrand: string;
    price: number;
};

export interface SchoolOrder {
    toyId: Types.ObjectId;
    quantity: number;
}

export enum Level {
    PRIMARY = 'PRIMARY',
    SECONDARY = 'SECONDARY',
    SENIOR_SECONDARY = 'SENIOR_SECONDARY',
    MIX = 'MIX',
    ALL = 'ALL'
};

export enum VendorOrderStatus {
    PENDING = 'PENDING',
    PROCESSING = 'PROCESSING',
    DISPATCHED = 'DISPATCHED',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED'
};

export interface IOtherProduct {
    order: Types.ObjectId;
    item: string;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}