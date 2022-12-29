import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/users.js';

import {
  HTTPError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServerError,
} from '../errors/index.js';

const errorServer = new ServerError('Произошла ошибка на сервере');
const notFoundError = new NotFoundError('Пользователь не найден');
const errorNotUnique = new ConflictError('Пользователь с такой почтой уже существует');
const errorBadRequest = new BadRequestError('Некорректные данные для пользователя');

export const getMe = (req, res, next) => {
  const { _id } = req.user;
  User.find({ _id })
    .then((user) => {
      if (user) {
        res.send(...user);
      } else {
        throw notFoundError;
      }
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

export const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else {
        next(errorServer);
      }
    });
};

export const createUser = (req, res, next) => {
  const {
    name,
    email,
    password,
  } = req.body;

  const createUserHash = (hash) => User.create({
    name,
    email,
    password: hash,
  });

  bcrypt
    .hash(password, 10)
    .then((hash) => createUserHash(hash))
    .then((user) => {
      const { _id } = user;
      res.send({
        _id,
        name,
        email,
      });
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else if (err.code === 11000) {
        next(errorNotUnique);
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(errorBadRequest);
      } else {
        next(errorServer);
      }
    });
};

export const updateProfile = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { runValidators: true })
    .then((user) => res.send({
      _id: user._id,
      name,
      email,
    }))
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

export const login = (req, res, next) => {
  const { email, password } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const { JWT_SECRET } = req.app.get('config');
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: '1d',
      });
      res.send({ token });
    })
    .catch((err) => {
      if (err instanceof HTTPError) {
        next(err);
      } else {
        next(errorServer);
      }
    });
};
