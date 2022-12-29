import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import winstonExpress from 'express-winston';
import { errors, isCelebrateError } from 'celebrate';
import { constants } from 'http2';
import { fileURLToPath } from 'url';

import { router as userRouter } from './routes/users.js';
import { router as movieRouter } from './routes/movies.js';
import { router as authRouter } from './routes/auth.js';

import { HTTPError, NotFoundError } from './errors/index.js';
import { auth } from './middlewares/auth.js';

export const __dirname = path.dirname(fileURLToPath(import.meta.url));

const allowedOrigins = [
  'https://praktikum.tk',
  'http://praktikum.tk',
  'localhost:3001',
  'http://localhost:3001',
  /(https|http)?:\/\/(?:www\.|(?!www))movies-exp.thirteenth.nomoredomains.club\/[a-z]+\/|[a-z]+\/|[a-z]+(\/|)/,
];

export const run = async (envName) => {
  process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
  });

  const isProduction = envName.includes('prod');
  const config = dotenv.config({
    path: path.resolve(__dirname, (isProduction ? '.env' : '.env.common')),
  }).parsed;
  if (!config) {
    throw new Error('Config не найден');
  }
  config.NODE_ENV = envName;
  config.IS_PROD = isProduction;

  const requestLogger = winstonExpress.logger({
    transports: [
      new winston.transports.File({
        filename: path.resolve(__dirname, 'request.log'),
      }),
    ],
    format: winston.format.json(),
  });
  const errorLogger = winstonExpress.errorLogger({
    transports: [
      new winston.transports.File({
        filename: path.resolve(__dirname, 'error.log'),
      }),
    ],
    format: winston.format.json(),
  });

  const app = express();
  app.set('config', config);
  app.use(bodyParser.json());
  app.use(requestLogger);
  app.use(helmet());
  app.use(cors(
    {
      origin: config.IS_PROD ? allowedOrigins : '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  ));

  app.use(rateLimit({
    message: { message: 'Слишком много запросов' },
    max: 100,
  }));

  app.get('/crash-test', () => {
    setTimeout(() => {
      throw new Error('Сервер сейчас упадёт');
    }, 0);
  });
  app.use('/', authRouter);
  app.use(auth);
  app.use('/users', userRouter);
  app.use('/movies', movieRouter);
  app.use(errors());
  app.all('/*', (req, res, next) => {
    next(new NotFoundError('Запрашиваемая страница не найдена'));
  });
  app.use(errorLogger);
  app.use((err, req, res, next) => {
    const isHttpError = err instanceof HTTPError;
    const isValidatorError = isCelebrateError(err);

    if (isHttpError) {
      res.status(err.statusCode).send({
        message: err.message,
      });
    }
    if (!(isHttpError || isValidatorError)) {
      res.status(constants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({
        message: err.message || 'Произошла ошибка на сервере',
      });
    }
    next();
  });

  mongoose.set('runValidators', true);
  await mongoose.connect(config.DATABASE_URL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    autoIndex: true,
  });
  const server = app.listen(config.PORT, config.HOST, () => {
    console.log(`Server run on http://localhost:${config.PORT}`);
  });

  const stop = async () => {
    await mongoose.connection.close();
    server.close();
    process.exit(0);
  };

  process.on('SIGTERM', stop);
  process.on('SIGINT', stop);
};
