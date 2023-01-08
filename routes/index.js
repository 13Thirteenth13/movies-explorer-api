import { Router } from 'express';
import { NotFoundError } from '../errors/NotFoundError.js';
import { auth } from '../middlewares/auth.js';
import { router as userRouter } from './users.js';
import { router as movieRouter } from './movies.js';
import { router as authRouter } from './auth.js';
import { errorMessages } from '../errors/index.js';

export const router = new Router();

router.use('/', authRouter);

router.use(auth);
router.use('/users', userRouter);
router.use('/movies', movieRouter);

router.use((req, res, next) => {
  next(new NotFoundError(errorMessages.incorrectPath));
});
