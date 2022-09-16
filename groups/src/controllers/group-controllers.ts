import { HttpError, natsWraper } from '@adwesh/common';
import { validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

import { Group, User } from '../models/GroupsUser';
import { GroupCreatedPublisher } from '../events/publishers/GroupCreatedPublisher';

const createGroup = async (req: Request, res: Response, next: NextFunction) => {
  // TODO: Use middleware to get admin role to perform this action
  const isError = validationResult(req);
  if (!isError.isEmpty()) {
    return next(new HttpError('Provide the title of the group', 422));
  }
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
  let foundUser;
  if (!userId) return next(new HttpError('You are not authenticated', 401));
  try {
    foundUser = await User.findOne({ userId }).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'Internal server error',
        500
      )
    );
  }
  if (!foundUser) return next(new HttpError('You are not authenticated', 401));
  const newGroup = new Group({
    title,
    createdBy: foundUser._id,
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
  try {
    await new GroupCreatedPublisher(natsWraper.client).publish({
      title: newGroup.title,
      id: newGroup._id,
      users: newGroup.users,
    });
  } catch (error) {}
  // publish to category
  res.status(201).json({ message: `Group ${newGroup.title} has been created` });
};

const addUsersToGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Use middleware to get admin role to perform this action
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
  let foundUsers: string[] = [];
  //refactor this
  for (const userId of users) {
    for (const usr of foundGroup.users) {
      if (usr.toString() === userId) {
        foundUsers.push(userId);
      }
    }
  }
  if (foundUsers.length > 0) {
    return next(
      new HttpError('User can only be added once to this group', 403)
    );
  }
  //TODO: Check if these users exist.
  // for (const userId of users) {
  //   for (const usr of foundGroup.users) {
  //   }
  // }

  for (const userId of users) {
    foundGroup.users.push(userId);
  }
  try {
    await foundGroup.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  //publish update to category
  // send mail to users configured
  res.status(200).json({ message: 'The users have been added to this group' });
};

const removeUsersFromGroup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // TODO: Use middleware to get admin role to perform this action
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
    const usersInGroup = foundGroup.users;
    const updatedUsers = usersInGroup.filter(
      (userInGroup) => userInGroup !== userId
    );
    foundGroup.users = updatedUsers;
  }
  try {
    await foundGroup.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  //publish update to category
  // send mail to users removed
  res
    .status(200)
    .json({ message: 'The users have been removed from the group' });
};

// const removeGroup = () => {
//     // send a delete event to schedule delete of the group - if the group is actively involed in pending tickets
//     // otherwise delete the group asap
// }

const fetchGroups = async (req: Request, res: Response, next: NextFunction) => {
  let foundGroups;
  const populateQuery = [
    { path: 'users', select: ['email', 'userId'] },
    { path: 'createdBy', select: ['email', 'userId'] },
  ];
  try {
    foundGroups = await Group.find().populate(populateQuery).exec();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  res.status(200).json({ count: foundGroups.length, groups: foundGroups });
};

const fetchGroupUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let foundUsers;
  try {
    foundUsers = await User.find().exec();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  res.status(200).json({ count: foundUsers.length, users: foundUsers });
};

export {
  createGroup,
  addUsersToGroup,
  removeUsersFromGroup,
  fetchGroups,
  fetchGroupUsers,
};
