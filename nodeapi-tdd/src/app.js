const express = require('express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');
const UserRouter = require('./routers/UserRouter');
const HoaxRouter = require('./routers/HoaxRouter');
const FileRouter = require('./routers/FileRouter');
const AuthenticationRouter = require('./routers/AuthenticationRouter');
const ErrorHandler = require('./exceptions/ErrorHandler');
const authentication = require('./middleware/tokenAuthentication');
const FileService = require('./services/FileService');
const config = require('config');
const path = require('path');

const { uploadDir, profileDir, attachmentDir } = config;
const profileFolder = path.join('.', uploadDir, profileDir);
const attachmentFolder = path.join('.', uploadDir, attachmentDir);

const ONE_YEAR_IN_MILLIS = 365 * 24 * 60 * 60 * 1000;

// Create download folders
FileService.createFolders();

// Create expresss app
const app = express();

// Setup internationalization
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    lng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      lookupHeader: 'accept-language',
    },
  });

// Setup middleware
app.use(middleware.handle(i18next));
app.use(express.json({ limit: '3mb' }));
app.use(authentication);
app.use(UserRouter);
app.use(AuthenticationRouter);
app.use(HoaxRouter);
app.use(FileRouter);
app.use(ErrorHandler);

// Serve static resources
app.use(
  '/images',
  express.static(profileFolder, { maxAge: ONE_YEAR_IN_MILLIS })
);

app.use(
  '/attachments',
  express.static(attachmentFolder, { maxAge: ONE_YEAR_IN_MILLIS })
);

module.exports = app;
