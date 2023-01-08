import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/users.js';

import {
  HTTPError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServerError,
  errorMessages,
} from '../errors/index.js';

const errorServer = new ServerError(errorMessages.errorServer);
const notFoundError = new NotFoundError(errorMessages.userNotFound);
const errorNotUnique = new ConflictError(errorMessages.userNotUnique);
const conflictError = new ConflictError(errorMessages.userConflictError);
const errorBadRequest = new BadRequestError(errorMessages.userBadRequest);

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

  const findOne = (hash) => User.findOne({ email })
    .then((user) => ({ user, hash }));

  bcrypt
    .hash(password, 10)
    .then(findOne)
    .then(({ hash }) => createUserHash(hash))
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

  const findByIdAndUpdate = () => User.findByIdAndUpdate(
    req.user._id,
    { name, email },
    { runValidators: true, new: true },
  );

  User.find({ email })
    .then(([user]) => {
      if (user && user._id.toString() !== req.user._id) {
        throw conflictError;
      }
      return findByIdAndUpdate();
    })
    .then((updatedUser) => res.send(updatedUser))
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
        expiresIn: '7d',
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
