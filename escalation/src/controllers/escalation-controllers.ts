import { validationResult } from 'express-validator';
import { HttpError } from '@adwesh/common';
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Escalation, EscalationDoc } from '../models/Escalation';
import { convertToMillis } from '../utils/init-values';

type TEscalation = EscalationDoc & { _id: Types.ObjectId };

const getEscalationMatrices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let foundMatrices: TEscalation[] = [];
  try {
    foundMatrices = await Escalation.find().exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  res
    .status(200)
    .json({ count: foundMatrices.length, escalationMatrices: foundMatrices });
};

const updateEscalationMatrix = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }

  const id = req.params.matrixId;
  let foundMatrix: TEscalation | null;

  const { priority, actionTime } = req.body;

  try {
    foundMatrix = await Escalation.findById(id).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  if (!foundMatrix) {
    return next(new HttpError('The provided matrix does not exist', 404));
  }

  const actn = foundMatrix.action.find((act) => act.priority === priority);

  if (!actn) {
    return next(new HttpError('The priority provided does not exist', 422));
  }

  const toUpdateIdx = foundMatrix.action.findIndex(
    (act) => act.priority === priority
  );

  foundMatrix.action[toUpdateIdx] = {
    priority,
    actionTime: convertToMillis(actionTime),
  };

  try {
    await foundMatrix.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  res
    .status(200)
    .json({ message: `Escalation: ${foundMatrix.title} has been updated.` });
};

export { getEscalationMatrices, updateEscalationMatrix };
