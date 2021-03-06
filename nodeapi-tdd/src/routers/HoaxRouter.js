const express = require('express');
const router = express.Router();
const AuthenticationException = require('../exceptions/AuthenticationException');
const HoaxService = require('../services/HoaxService');
const { check, validationResult } = require('express-validator');
const ValidationException = require('../exceptions/ValidationException');
const pagination = require('../middleware/pagination');
const ForbiddenException = require('../exceptions/ForbiddenException');

router.post(
  '/api/v1.0/hoaxes',
  check('content')
    .isLength({ min: 10, max: 5000 })
    .withMessage('hoax_content_size'),
  async (req, res, next) => {
    if (!req.authenticatedUser) {
      return next(new AuthenticationException('unauthorized_hoax_submit'));
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }
    await HoaxService.save(req.body, req.authenticatedUser);
    return res.send({ message: req.t('hoax_submit_success') });
  }
);

router.get(
  ['/api/v1.0/hoaxes', '/api/v1.0/users/:userId/hoaxes'],
  pagination,
  async (req, res, next) => {
    const { page, size } = req.pagination;

    try {
      const hoaxes = await HoaxService.getHoaxes(page, size, req.params.userId);
      res.send(hoaxes);
    } catch (err) {
      next(err);
    }
  }
);

router.delete('/api/v1.0/hoaxes/:hoaxId', async (req, res, next) => {
  if (!req.authenticatedUser) {
    return next(new ForbiddenException('unauthorized_hoax_delete'));
  }

  try {
    await HoaxService.deleteHoax(req.params.hoaxId, req.authenticatedUser.id);
    res.send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
