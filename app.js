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
import { errors } from 'celebrate';
import { fileURLToPath } from 'url';

import { router } from './routes/index.js';
import { errorMessages } from './errors/index.js';
import { error as errorMiddleware } from './middlewares/error.js';

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
    throw new Error(errorMessages.configNotFound);
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
  app.use(rateLimit({
    message: { message: errorMessages.rateLimit },
    max: 100,
  }));
  app.use(cors(
    {
      origin: config.IS_PROD ? allowedOrigins : '*',
      allowedHeaders: ['Content-Type', 'Authorization'],
    },
  ));
  app.set('config', config);
  app.use(bodyParser.json());
  app.use(requestLogger);
  app.use(helmet());
  app.use(router);
  app.use(errorLogger);
  app.use(errors());
  app.use(errorMiddleware);

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
