import { Movie } from '../models/movies.js';
import {
  HTTPError,
  BadRequestError,
  NotFoundError,
  ServerError,
  ForbiddenError,
} from '../errors/index.js';

const errorServer = new ServerError('Произошла ошибка на сервере');
const notFoundError = new NotFoundError('Фильм не найден');
const forbiddenError = new ForbiddenError('Это действие можно выполнить только со своими фильмами');
const errorBadRequest = new BadRequestError('Некорректные данные');

export const getMovies = (req, res, next) => {
  Movie.find({})
    .then((movies) => res.send(movies))
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else {
        next(errorServer);
      }
    });
};

export const createMovie = (req, res, next) => {
  const {
    movieId,
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
  } = req.body;
  const owner = req.user._id;
  Movie.create({
    movieId,
    country,
    director,
    duration,
    year,
    description,
    owner,
    image,
    trailerLink,
    thumbnail,
    nameRU,
    nameEN,
  })
    .then((movie) => res.send(movie))
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(errorBadRequest);
      } else {
        next(errorServer);
      }
    });
};

export const deleteMovie = (req, res, next) => {
  Movie.findById(req.params._id)
    .then((movie) => {
      if (!movie) {
        throw notFoundError;
      } else if (movie.owner.toString() !== req.user._id) {
        throw forbiddenError;
      } else {
        return Movie.findByIdAndRemove(req.params._id);
      }
    })
    .then((movie) => {
      res.send(movie);
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.name === 'CastError') {
        next(errorBadRequest);
      } else {
        next(errorServer);
      }
    });
};
