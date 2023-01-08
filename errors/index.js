export { AppError } from './AppError.js';
export { HTTPError } from './HTTPError.js';
export { ServerError } from './ServerError.js';
export { ConflictError } from './ConflictError.js';
export { NotFoundError } from './NotFoundError.js';
export { ForbiddenError } from './ForbiddenError.js';
export { BadRequestError } from './BadRequestError.js';
export { UnauthorizedError } from './UnauthorizedError.js';

export const errorMessages = {
  link: 'Некорректный формат ссылки',
  movieNotFound: 'Фильм не найден',
  movieForbiddenError: 'Это действие можно выполнить только со своими фильмами',
  movieBadRequest: 'Некорректные данные для фильма',
  userNotFound: 'Пользователь не найден',
  userNotUnique: 'Пользователь с такой почтой уже существует',
  userConflictError: 'Почта уже зарегистрирована',
  userBadRequest: 'Некорректные данные для пользователя',
  incorrectData: 'Неправильные почта или пароль',
  incorrectEmail: 'Некорректный формат почты',
  incorrectPath: 'Неправильный путь',
  auth: 'Необходима авторизация',
  unknown: 'Неизвестная ошибка',
  configNotFound: 'Config не найден',
  rateLimit: 'Слишком много запросов',
  errorServer: 'Произошла ошибка на сервере',
};
