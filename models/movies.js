import mongoose from 'mongoose';
import isUrl from 'validator/lib/isURL.js';

const { Schema } = mongoose;

const schema = new Schema(
  {
    country: {
      type: String,
      required: true,
      minLength: 2,
    },
    director: {
      type: String,
      required: true,
      minLength: 2,
    },
    duration: {
      type: Number,
      required: true,
      min: 0.1,
    },
    year: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 4,
    },
    description: {
      type: String,
      required: true,
      minLength: 2,
    },
    image: {
      type: String,
      required: true,
      validate: {
        validator: (link) => isUrl(link),
        message: 'Некорректный формат ссылки для изображения',
      },
    },
    trailerLink: {
      type: String,
      required: true,
      validate: {
        validator: (link) => isUrl(link),
        message: 'Некорректный формат ссылки для трейлера',
      },
    },
    thumbnail: {
      type: String,
      required: true,
      validate: {
        validator: (link) => isUrl(link),
        message: 'Некорректный формат ссылки для постера',
      },
    },
    owner: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
      min: 1,
    },
    nameRU: {
      type: String,
      required: true,
      minLength: 2,
    },
    nameEN: {
      type: String,
      required: true,
      minLength: 2,
    },
  },
  { versionKey: false },
);

export const Movie = mongoose.model('Movie', schema);
