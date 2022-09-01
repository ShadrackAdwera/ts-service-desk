import { HttpError } from '@adwesh/common';
import { Roles } from '@adwesh/service-desk';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { User } from '../models/User';

interface IExpress {
  req: Request;
  res: Response;
  next: NextFunction;
}

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
  });

  try {
    await newUser.save();
  } catch (error) {
    console.log(error);
    return next(new HttpError('An error occured, try again', 500));
  }
  //emit UserCreate Event
  try {
    token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      process.env.JWT_KEY!,
      { expiresIn: '1h' }
    );
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }
  res
    .status(201)
    .json({
      message: 'Sign Up successful',
      user: { id: newUser.id, email, token },
    });
};
