import { Escalation, EscalationDoc, IActions } from '../models/Escalation';
import {
  EscalationTitles,
  EscalationTypes,
  PRIORITIES,
} from '@adwesh/service-desk';
import { Types } from 'mongoose';
import { HttpError, natsWraper } from '@adwesh/common';
import { EscalationCreatedPublisher } from '../events/publishers/EscalationCreated';

export const convertToMillis = (hours: number) => hours * 60 * 60 * 1000;

const replyArray: IActions[] = [
  { priority: PRIORITIES.CRITICAL, actionTime: convertToMillis(1) },
  { priority: PRIORITIES.HIGH, actionTime: convertToMillis(3) },
  { priority: PRIORITIES.MEDIUM, actionTime: convertToMillis(4) },
  { priority: PRIORITIES.LOW, actionTime: convertToMillis(6) },
];

const resolveArray: IActions[] = [
  { priority: PRIORITIES.CRITICAL, actionTime: convertToMillis(3) },
  { priority: PRIORITIES.HIGH, actionTime: convertToMillis(5) },
  { priority: PRIORITIES.MEDIUM, actionTime: convertToMillis(24) },
  { priority: PRIORITIES.LOW, actionTime: convertToMillis(48) },
];

const assignedArray: IActions[] = [
  { priority: PRIORITIES.CRITICAL, actionTime: convertToMillis(0.75) },
  { priority: PRIORITIES.HIGH, actionTime: convertToMillis(2) },
  { priority: PRIORITIES.MEDIUM, actionTime: convertToMillis(3) },
  { priority: PRIORITIES.LOW, actionTime: convertToMillis(5) },
];

type TEscalation = EscalationDoc & { _id: Types.ObjectId };
// TODO: Refactor this logic
export const configureDefaultEscalations = async () => {
  let foundReplyMatrix: TEscalation | null;
  let foundResolvedMatrix: TEscalation | null;
  let foundAssignedMatrix: TEscalation | null;

  try {
    foundReplyMatrix = await Escalation.findOne({
      title: EscalationTitles.REPLY_ESCALATION,
    }).exec();
  } catch (error) {
    throw new HttpError(
      error instanceof Error ? error.message : 'An error occured',
      500
    );
  }

  if (!foundReplyMatrix) {
    const replyMatrix = new Escalation({
      title: EscalationTitles.REPLY_ESCALATION,
      escalationType: EscalationTypes.REPLY_TO,
      action: replyArray,
    });

    try {
      await replyMatrix.save();
      console.log(`${EscalationTitles.REPLY_ESCALATION} : created`);
      await new EscalationCreatedPublisher(natsWraper.client).publish({
        id: replyMatrix._id,
        title: replyMatrix.title,
        escalationType: replyMatrix.escalationType,
        action: replyMatrix.action,
      });
    } catch (error) {
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
  }

  try {
    foundResolvedMatrix = await Escalation.findOne({
      title: EscalationTitles.RESOLVED_ESCALATION,
    }).exec();
  } catch (error) {
    throw new HttpError(
      error instanceof Error ? error.message : 'An error occured',
      500
    );
  }

  if (!foundResolvedMatrix) {
    const resolvedMatrix = new Escalation({
      title: EscalationTitles.RESOLVED_ESCALATION,
      escalationType: EscalationTypes.RESOLVED,
      action: resolveArray,
    });

    try {
      await resolvedMatrix.save();
      console.log(`${EscalationTitles.RESOLVED_ESCALATION} : created`);
      await new EscalationCreatedPublisher(natsWraper.client).publish({
        id: resolvedMatrix._id,
        title: resolvedMatrix.title,
        escalationType: resolvedMatrix.escalationType,
        action: resolvedMatrix.action,
      });
    } catch (error) {
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
  }

  try {
    foundAssignedMatrix = await Escalation.findOne({
      title: EscalationTitles.ASSIGNED_ESCALATION,
    }).exec();
  } catch (error) {
    throw new HttpError(
      error instanceof Error ? error.message : 'An error occured',
      500
    );
  }

  if (!foundAssignedMatrix) {
    const assignedMatrix = new Escalation({
      title: EscalationTitles.ASSIGNED_ESCALATION,
      escalationType: EscalationTypes.ASSIGNED,
      action: assignedArray,
    });

    try {
      await assignedMatrix.save();
      console.log(`${EscalationTitles.ASSIGNED_ESCALATION} : created`);
      await new EscalationCreatedPublisher(natsWraper.client).publish({
        id: assignedMatrix._id,
        title: assignedMatrix.title,
        escalationType: assignedMatrix.escalationType,
        action: assignedMatrix.action,
      });
    } catch (error) {
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
  }
};
