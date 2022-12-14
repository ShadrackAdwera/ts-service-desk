import { Escalation, EscalationDoc } from '../models/Escalation';
import { EscalationTitles, EscalationTypes } from '@adwesh/service-desk';
import { Types } from 'mongoose';
import { HttpError, natsWraper } from '@adwesh/common';
import { EscalationCreatedPublisher } from '../events/publishers/EscalationCreated';

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
      actionTime: 2,
    });

    try {
      await replyMatrix.save();
      console.log(`${EscalationTitles.REPLY_ESCALATION} : created`);
      await new EscalationCreatedPublisher(natsWraper.client).publish({
        id: replyMatrix._id,
        title: replyMatrix.title,
        escalationType: replyMatrix.escalationType,
        actionTime: replyMatrix.actionTime,
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
      actionTime: 2,
    });

    try {
      await resolvedMatrix.save();
      console.log(`${EscalationTitles.RESOLVED_ESCALATION} : created`);
      await new EscalationCreatedPublisher(natsWraper.client).publish({
        id: resolvedMatrix._id,
        title: resolvedMatrix.title,
        escalationType: resolvedMatrix.escalationType,
        actionTime: resolvedMatrix.actionTime,
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
      actionTime: 2,
    });

    try {
      await assignedMatrix.save();
      console.log(`${EscalationTitles.ASSIGNED_ESCALATION} : created`);
      await new EscalationCreatedPublisher(natsWraper.client).publish({
        id: assignedMatrix._id,
        title: assignedMatrix.title,
        escalationType: assignedMatrix.escalationType,
        actionTime: assignedMatrix.actionTime,
      });
    } catch (error) {
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
  }
};
