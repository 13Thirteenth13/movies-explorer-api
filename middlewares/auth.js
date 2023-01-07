import jwt from 'jsonwebtoken';
import { UnauthorizedError, errorMessages } from '../errors/index.js';

export const auth = (req, res, next) => {
  const { authorization = '' } = req.headers;
  if (!authorization) {
    next(new UnauthorizedError(errorMessages.auth));
  } else {
    const token = authorization.replace(/^Bearer*\s*/i, '');
    const { JWT_SECRET } = req.app.get('config');
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      req.user = payload;
      next();
    } catch (err) {
      next(new UnauthorizedError(errorMessages.auth));
    }
  }
};
