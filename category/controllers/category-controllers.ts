import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '@adwesh/common';

import { Category } from '../models/Category';

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
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
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
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  res.status(201).json({ message: 'Category created', category: newCategory });
};

const fetchCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let categories;
  const populateQuery = [{ path: 'group', select: ['title'] }];

  try {
    categories = await Category.find().populate(populateQuery).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  res.status(200).json({ count: categories.length, categories });
};

export { createCategory, fetchCategories };