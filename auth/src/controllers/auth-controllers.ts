import { HttpError, natsWraper } from '@adwesh/common';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import brypto from 'crypto';

import { User } from '../models/User';
import { UserCreatedPublisher } from '../events/UserCreatedPublisher';
import { UserUpdatedPublisher } from '../events/UserUpdatedPublisher';
import { Roles } from '@adwesh/service-desk';

const DEFAULT_PASSWORD = '123456';

// TODO: Import users from CSV controller
const addUsers = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Only admins to have access to this endpoint - decode token to get ROLE
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }
  let foundUser;
  let hashedPassword: string;
  const {
    username,
    email,
    roles,
  }: { username: string; email: string; roles: string[] } = req.body;

  //check if email exists in the DB
  try {
    foundUser = await User.findOne({ email }).exec();
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
    roles,
    resetToken: null,
    tokenExpirationDate: undefined,
  });

  // send mail to confirm account and change password therefore

  try {
    await newUser.save();
    const agentRole =
      roles.includes(Roles.AGENT) || roles.includes(Roles.ADMIN);
    if (agentRole) {
      await new UserCreatedPublisher(natsWraper.client).publish({
        id: newUser.id,
        email: newUser.email,
        roles: newUser.roles,
      });
    }
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  res.status(201).json({ message: 'User created' });
};

const signUp = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Should be through a magic link sent via mail
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }
  let foundUser;
  let hashedPassword: string;
  let token: string;
  const { username, email, password } = req.body;

  //check if email exists in the DB
  try {
    foundUser = await User.findOne({ email }).exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  if (foundUser) {
    return next(new HttpError('Email exists, login instead', 400));
  }

  //hash password
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  // create new user
  const newUser = new User({
    username,
    email,
    password: hashedPassword,
    roles: [Roles.ADMIN],
    resetToken: null,
    tokenExpirationDate: undefined,
  });

  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('An error occured, try again', 500));
  }

  try {
    token = await jwt.sign({ id: newUser.id, email }, process.env.JWT_KEY!, {
      expiresIn: '1h',
    });
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  try {
    await new UserCreatedPublisher(natsWraper.client).publish({
      id: newUser.id,
      email: newUser.email,
      roles: newUser.roles,
    });
  } catch (error) {}

  res.status(201).json({
    message: 'Sign Up successful',
    user: { id: newUser.id, username, email, token, roles: newUser.roles },
  });
};

const login = async (req: Request, res: Response, next: NextFunction) => {
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
    foundUser = await User.findOne({ email }).exec();
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
    user: {
      id: foundUser.id,
      username: foundUser.username,
      email,
      token,
      roles: foundUser.roles,
    },
  });
};

const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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

const modifyUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Admin Role to have access to this controller
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }
  let foundUser;
  const { userRole } = req.body;
  const userId = req.params.userId;

  //check if email exists in the DB
  try {
    foundUser = await User.findById(userId).exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  if (!foundUser) {
    return next(new HttpError('This user does not exist!', 404));
  }

  const isAgent = foundUser.roles.find(
    (role) =>
      role === Roles.AGENT || role === Roles.ADMIN || role === Roles.USER
  );
  if (isAgent) {
    if (isAgent === userRole) {
      return next(new HttpError('This user has the role provided', 400));
    }
  }
  foundUser.roles.push(userRole);
  try {
    await foundUser.save();
    if (userRole === Roles.AGENT || userRole === Roles.ADMIN) {
      await new UserUpdatedPublisher(natsWraper.client).publish({
        id: foundUser.id,
        email: foundUser.email,
        roles: foundUser.roles,
      });
    }
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  res.status(201).json({
    message: `${userRole} role has been added to ${foundUser.username}'s roles`,
  });
};

export {
  signUp,
  login,
  requestPasswordReset,
  resetPassword,
  addUsers,
  modifyUserRole,
};
