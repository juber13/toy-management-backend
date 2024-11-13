import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { addSchoolData, deleteSchoolById, getSchoolById, getSchools, updateSchoolData } from '../controllers/schoolController.js';

const router = express.Router();

router.post('/',
    authMiddleware,
    addSchoolData
);

router.put('/',
    authMiddleware,
    updateSchoolData
);

router.get('/',
    authMiddleware,
    getSchools
);

router.get('/:id',
    authMiddleware,
    getSchoolById
);

router.delete('/:id',
    authMiddleware,
    deleteSchoolById
);

export default router;