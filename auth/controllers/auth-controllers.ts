import { HttpError } from '@adwesh/common';
import { Roles } from '@adwesh/service-desk';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import brypto from 'crypto';

import { User } from '../models/User';

interface IExpress {
  req: Request;
  res: Response;
  next: NextFunction;
}

const DEFAULT_PASSWORD = '123456';

const addUsers = async ({ req, res, next }: IExpress) => {
  // TODO: Only admins to have access to this endpoint - decode token to get ROLE
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }
  let foundUser;
  let hashedPassword: string;
  const { username, email, role } = req.body;

  //check if email exists in the DB - to outsource
  try {
    foundUser = await User.findOne({ email }, '-password').exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  if (foundUser) {
    return next(new HttpError('Email exists!', 400));
  }

  //hash password
  try {
    hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 12);
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  // create new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role,
    resetToken: null,
    tokenExpirationDate: undefined,
  });

  try {
    await newUser.save();
    if (role === Roles.AGENT) {
      //TODO: publish UserCreatedEvent(userId, categoryId);
    }
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  res.status(201).json({ message: 'User created' });
};

const signUp = async ({ req, res, next }: IExpress) => {
  const isError = validationResult(req);
  if (!isError.isEmpty()) {
    return next(new HttpError('Provide valid inputs', 422));
  }
  const { username, email, password } = req.body;
  // outsource this to a helper function
  let foundUser;
  let hashedPassword: string;
  let token: string;
  try {
    foundUser = await User.findOne({ email }).exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  if (foundUser) {
    return next(new HttpError('User exists, login instead', 500));
  }

  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    role: Roles.ADMIN,
    resetToken: null,
    tokenExpirationDate: undefined,
  });

  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('An error occured, try again', 500));
  }
  //TODO: Emit UserCreate Event
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY!,
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  res.status(201).json({
    message: 'Sign Up successful',
    user: { id: newUser.id, email, token },
  });
};

const login = async ({ req, res, next }: IExpress) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }
  let foundUser;
  let isPassword: boolean;
  let token: string;
  const { email, password } = req.body;

  //check if email exists in the DB
  try {
    foundUser = await User.findOne({ email }).populate('section').exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  if (!foundUser) {
    return next(new HttpError('Email does not exist, sign up instead', 400));
  }

  //compare passwords
  try {
    isPassword = await bcrypt.compare(password, foundUser.password);
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  if (!isPassword) {
    return next(new HttpError('Invalid password', 422));
  }

  //generate token
  try {
    token = await jwt.sign(
      { id: foundUser.id, email: foundUser.email },
      process.env.JWT_KEY!,
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  res.status(201).json({
    message: 'Login Successful',
    user: { id: foundUser.id, email, token, role: foundUser.role },
  });
};

const requestPasswordReset = async ({ req, res, next }: IExpress) => {
  const { email } = req.body;
  let foundUser;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid email', 422));
  }

  // check if user exists in DB
  try {
    foundUser = await User.findOne({ email }).exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  if (!foundUser) {
    return next(new HttpError('This account does not exist', 400));
  }
  const resetTkn = brypto.randomBytes(64).toString('hex');
  const resetDate = new Date(Date.now() + 3600000);
  foundUser.resetToken = resetTkn;
  foundUser.tokenExpirationDate = resetDate;

  //TODO: Send email with reset link to user : https://my-frontend-url/reset-token/${resetTkn}
  res.status(200).json({ message: 'Check your email for a reset email link' });
};

const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { password, confirmPassword } = req.body;
  const { resetToken } = req.params;
  let foundUser;
  let hashedPassword: string;

  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid email', 422));
  }

  //check if passwords match
  if (password !== confirmPassword) {
    return next(new HttpError('The passwords do not match', 422));
  }

  // check if user exists in DB
  try {
    foundUser = await User.findOne({
      resetToken,
      tokenExpirationDate: { $gt: Date.now() },
    }).exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  if (!foundUser) {
    return next(new HttpError('The password reset request is invalid', 400));
  }

  // hash new password
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  foundUser.password = hashedPassword;
  foundUser.tokenExpirationDate = undefined;
  foundUser.resetToken = undefined;

  try {
    await foundUser.save();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  res.status(200).json({ message: 'Password reset successful' });
};
