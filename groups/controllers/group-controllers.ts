import { HttpError } from '@adwesh/common';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

import { Group, User } from '../models/GroupsUser';

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Use middleware to get admin role to perform this action
  const { title }: { title: string } = req.body;
  let foundGroup;
  try {
    foundGroup = await Group.findOne({ title }).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  if (foundGroup)
    return next(
      new HttpError('A group with this name exists, use another name', 422)
    );
  const userId = req.user?.userId;
  if (!userId) return next(new HttpError('You are not authenticated', 401));
  const newGroup = new Group({
    title,
    createdBy: userId,
  });

  try {
    await newGroup.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  // publish to category
  res.status(201).json({ message: `Group ${newGroup.title} has been created` });
};

const addUsersToGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const groupId = req.params;
  const { users }: { users: string[] } = req.body;
  let foundGroup;
  try {
    foundGroup = await Group.findOne({ id: groupId }).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  if (!foundGroup)
    return next(new HttpError('This group does not exist!', 422));
  for (const userId of users) {
    foundGroup.users.push(userId);
  }
  //publish update to category
  res.status(200).json({ message: 'The users have been added to this group' });
};
