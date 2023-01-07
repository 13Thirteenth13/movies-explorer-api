import mongoose from 'mongoose';
import isUrl from 'validator/lib/isURL.js';
import { errorMessages } from '../errors/index.js';

const { Schema } = mongoose;

const schemaLink = {
  type: String,
  required: true,
  validate: {
    validator: (link) => isUrl(link),
    message: errorMessages.link,
  },
};

const schema = new Schema(
  {
    country: {
      type: String,
      required: true,
    },
    director: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: schemaLink,
    trailerLink: schemaLink,
    thumbnail: schemaLink,
    owner: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    movieId: {
      type: Number,
      required: true,
    },
    nameRU: {
      type: String,
      required: true,
    },
    nameEN: {
      type: String,
      required: true,
    },
  },
  { versionKey: false },
);

export const Movie = mongoose.model('Movie', schema);
