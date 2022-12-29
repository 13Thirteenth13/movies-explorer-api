import { Router } from 'express';
import { signUp, signIn } from '../middlewares/validation.js';
import { createUser, login } from '../controllers/users.js';

export const router = Router();

router.post('/signup', signUp, createUser);

router.post('/signin', signIn, login);
