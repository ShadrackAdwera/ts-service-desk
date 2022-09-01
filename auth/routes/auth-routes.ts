import { checkAuth } from '@adwesh/common';
import { body } from 'express-validator';
import express from 'express';
import mongoose from 'mongoose';

import {
  signUp,
  login,
  requestPasswordReset,
  resetPassword,
  modifyUserRole,
  addUsers,
} from '../controllers/auth-controllers';

const router = express.Router();

router.post(
  '/sign-up',
  [
    body('username').trim().not().isEmpty(),
    body('email').normalizeEmail().isEmail(),
    body('password').trim().isLength({ min: 6 }),
  ],
  signUp
);

router.post(
  '/login',
  [
    body('email').normalizeEmail().isEmail(),
    body('password').trim().isLength({ min: 6 }),
  ],
  login
);

router.patch(
  '/request-reset-token',
  [body('email').normalizeEmail().isEmail()],
  requestPasswordReset
);

router.patch(
  '/reset-password/:resetToken',
  [body('password').trim().isLength({ min: 6 })],
  resetPassword
);

router.use(checkAuth); // TODO: Middleware to check if request is made by admin
router.post(
  '/new-user',
  [
    body('username').trim().not().isEmpty(),
    body('email').normalizeEmail().isEmail(),
    body('role').trim().not().isEmpty(),
  ],
  addUsers
);
router.patch(
  '/modify-user/:userId',
  [body('userRole').trim().not().isEmpty()],
  modifyUserRole
);

export { router as authRouter };
