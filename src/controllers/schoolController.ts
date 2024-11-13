import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import createHttpError from 'http-errors';
import { SchoolDataFromExcelSheet } from '../utils/types.js';
import SchoolModel from '../models/schoolModel.js';
import { checkMogooseId } from '../utils/validation.js';
dotenv.config();

const RESPONSES_SHEET_ID: string = process.env.RESPONSES_SHEET_ID;

const serviceAccountAuth = new JWT({
    email: process.env.SHEET_EMAIL_ID,
    key: process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});

const readColumns = (row: any): SchoolDataFromExcelSheet => {
    const getValue = (key: string): string | undefined => {
        const value = row.get(key)?.trim();
        return value?.length === 0 ? undefined : value;
    };

    const data: SchoolDataFromExcelSheet = {
        code: getValue('Code'),
        timestamp: getValue('Timestamp'),
        nameOfSchoolInstitution: getValue('Name of the school/Institution'),
        boardAffiliatedAndMediumOfInstruction: getValue('Board affiliated to and Medium of instruction'),
        typeOfInstitutionSchool: getValue('Type of institution/school'),
        villageNameIfAny: getValue('Village name  if any'),
        district: getValue('District'),
        state: getValue('State'),
        fullAddressWithPinCode: getValue('Full address with pin code'),
        nameOfPrincipalAndManagement: getValue('Name of the Principal and Management'),
        contactNumberOfPrincipalManagement: getValue('Contact number of the Principal/Management'),
        nameOfCoordinatorForLibrary: getValue('Name of the teacher/coordinator for training and managing the library'),
        contactDetailsOfCoordinatorTeacher: getValue('Contact details of the coordinator/teacher'),
        isThereCupboardForSafekeeping: getValue('Is there a cupboard/place for safekeeping of the toys'),
        isThereRoomForLibrary: getValue('Is there a room /place to set up the library'),
        picturesOfLibraryRoomAndCupboard: getValue('Pictures of the library room and cupboard'),
        numberofStudentsBalwadiClass1: getValue('Number of Students - Balwadi - class 1'),
        numberofStudentsClass2Class4: getValue('Number of Students - class 2 - class 4'),
        numberofStudentsclass5AndAbove: getValue('Number of Students - class 5 and above'),
        referredBy: getValue('Referred by')
    };
    return data;
};

export const addSchoolData = expressAsyncHandler(async (req: Request, res: Response) => {
    const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row) {
            const completed = row.get('Completed');
            if (!completed) {
                const data: SchoolDataFromExcelSheet = readColumns(row);
                await (new SchoolModel(data)).save();
                row.set('Completed', 'True');
                await row.save(); // think about this I want gurrented success over here
            }
        }
    }
    res.status(200).json({ message: 'Schools are added successfully!' });
});

export const updateSchoolData = expressAsyncHandler(async (req: Request, res: Response) => {
    const { school } = req.body;
    const schoolId = school.id;
    checkMogooseId(schoolId, 'School');
    delete school.id;
    delete school._id;
    delete school.__v;
    delete school.createdAt;
    delete school.updatedAt;
    const updatedSchool = await SchoolModel.findByIdAndUpdate(schoolId, school, {
        new: true, // Return the updated document
        runValidators: true, // Run schema validators on the updated fields
    });

    if (!updatedSchool) {
        // If no toy is found with the provided ID, return a 404 error
        throw createHttpError(404, 'School not found.');
    }

    // Send the updated toy as a response
    res.status(200).json({ message: 'School updated successfully!', school: updatedSchool });
});

export const getSchools = expressAsyncHandler(async (req: Request, res: Response) => {
    const { code, nameOfSchoolInstitution, sortByAsc } = req.query;

    // Create a filter object
    const filter: { [key: string]: any } = {};

    if (code) {
        filter.code = { $regex: code, $options: 'i' }; // Case-insensitive regex search for code
    }

    if (nameOfSchoolInstitution) {
        filter.nameOfSchoolInstitution = { $regex: nameOfSchoolInstitution, $options: 'i' }; // Case-insensitive regex search for nameOfSchoolInstitution
    }

    // Find schools that match the specified brand and level
    let schools;

    if (sortByAsc) {
        schools = await SchoolModel.find(filter).sort({ timestamp: 1 });
    } else {
        schools = await SchoolModel.find(filter);
    }

    // Send the filtered schools as a response
    res.status(200).json({ schools });
});

export const getSchoolById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Extract the school ID from the request parameters

    checkMogooseId(id, 'School');
    // Find the school by its ID
    const school = await SchoolModel.findById(id);

    if (!school) {
        // If no school is found with the provided ID, return a 404 error
        throw createHttpError(404, 'School not found.');
    }

    // Send the found school as a response
    res.status(200).json({ school });
});

export const deleteSchoolById = expressAsyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Extract the school ID from the request parameters

    checkMogooseId(id, 'School');
    // Find the school by ID and delete it
    const deletedSchool = await SchoolModel.findByIdAndDelete(id);

    if (!deletedSchool) {
        // If no school is found with the provided ID, return a 404 error
        throw createHttpError(404, 'School not found.');
    }

    // Send a success response
    res.status(200).json({ message: 'School deleted successfully!', school: deletedSchool });
});