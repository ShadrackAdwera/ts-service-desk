import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '@adwesh/common';

import { Category, Group } from '../models/Category';

const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isError = validationResult(req);
  if (!isError.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const {
    title,
    defaultDueDate,
    description,
    priority,
    groups,
    assigmentMatrix,
  }: {
    title: string;
    description: string;
    priority: number;
    assigmentMatrix: string;
    defaultDueDate: Date;
    groups: string[];
  } = req.body;

  let foundCategory;

  try {
    foundCategory = await Category.findOne({ title }).exec();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  if (foundCategory)
    return next(new HttpError('The category provided exists', 422));

  const newCategory = new Category({
    title,
    description,
    priority,
    groups,
    assigmentMatrix,
    defaultDueDate,
  });

  try {
    await newCategory.save();
  } catch (error) {
    return next(new HttpError('An error occured, try again', 500));
  }

  res.status(201).json({ message: 'Category created', category: newCategory });
};
