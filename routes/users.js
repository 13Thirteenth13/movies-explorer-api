import { Router } from 'express';
import { validationUpdateUser } from '../middlewares/validation.js';
import { updateProfile, getMe } from '../controllers/users.js';

export const router = Router();

router.get('/me', getMe);

router.patch('/me', validationUpdateUser, updateProfile);
