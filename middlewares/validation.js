import { celebrate, Joi } from 'celebrate';
import isUrl from 'validator/lib/isURL.js';
import { errorMessages } from '../errors/index.js';

const validationLink = Joi.string()
  .uri()
  .required()
  .custom((value, helpers) => {
    if (isUrl(value)) return value;
    return helpers.message(errorMessages.link);
  });

export const validationPostMovie = celebrate({
  body: Joi.object().keys({
    movieId: Joi.number().required(),
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: validationLink,
    trailerLink: validationLink,
    thumbnail: validationLink,
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
});

export const validationDeleteMovie = celebrate({
  params: Joi.object().keys({
    _id: Joi.string().length(24).hex().required(),
  }),
});

export const validationUpdateUser = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().email().required(),
  }),
});

export const signUp = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});

export const signIn = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
});
