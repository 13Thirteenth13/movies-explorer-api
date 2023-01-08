import { Router } from 'express';
import { validationPostMovie, validationDeleteMovie } from '../middlewares/validation.js';
import {
  getMovies,
  createMovie,
  deleteMovie,
} from '../controllers/movies.js';

export const router = Router();

router.get('/', getMovies);

router.post('/', validationPostMovie, createMovie);

router.delete('/:_id', validationDeleteMovie, deleteMovie);
