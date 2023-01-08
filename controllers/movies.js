import { Movie } from '../models/movies.js';
import {
  HTTPError,
  BadRequestError,
  NotFoundError,
  ServerError,
  ForbiddenError,
  errorMessages,
} from '../errors/index.js';

const errorServer = new ServerError(errorMessages.errorServer);
const notFoundError = new NotFoundError(errorMessages.movieNotFound);
const forbiddenError = new ForbiddenError(errorMessages.movieForbiddenError);
const errorBadRequest = new BadRequestError(errorMessages.movieBadRequest);

export const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
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
  req.body.owner = req.user._id;
  Movie.create(req.body)
    .then((Newmovie) => res.send(Newmovie))
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
