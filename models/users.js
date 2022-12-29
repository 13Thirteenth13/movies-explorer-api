import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import isEmail from 'validator/lib/isEmail.js';
import { UnauthorizedError } from '../errors/index.js';

const { Schema } = mongoose;

const schema = new Schema(
  {
    name: {
      type: String,
      minLength: 2,
      maxLength: 30,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      dropDups: true,
      validate: {
        validator: (link) => isEmail(link),
        message: 'Некорректный формат почты',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
  },
  { versionKey: false },
);

schema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }, { runValidators: true })
    .select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          throw new UnauthorizedError('Неправильные почта или пароль');
        }
        return user;
      });
    });
};

export const User = mongoose.model('User', schema);
