import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '@adwesh/common';
import {
  TicketCreatedEvent,
  TicketUpdatedEvent,
  TicketStatus,
} from '@adwesh/service-desk';

import { Ticket, Reply, Category, EscalationMatrix } from '../models/Ticket';

const fetchTickets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const populateQuery = [
    {
      path: 'category',
      select: [
        'title',
        'priority',
        'assignmentMatrix',
        'defaultDueDate',
        'groups',
      ],
    },
    { path: 'reply', select: ['message', 'createdBy'] },
  ];
  let foundTickets;

  try {
    foundTickets = await Ticket.find().populate(populateQuery).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  res.status(200).json({ count: foundTickets.length, tickets: foundTickets });
};

const createTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }

  const userId = req.user?.userId;
  let foundMatrix;

  if (!userId) {
    return next(new HttpError('Invalid request', 422));
  }

  const { title, description, category } = req.body;

  try {
    foundMatrix = await EscalationMatrix.findOne({ selected: 'yes' }).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  if (!foundMatrix)
    return next(
      new HttpError(
        'No escalation matrix configured, please contact your site administrator for assistance',
        404
      )
    );

  const newTicket = new Ticket({
    title,
    description,
    category,
    createdBy: userId,
    status: TicketStatus.OPEN,
    replies: [],
    escalationMatrix: foundMatrix,
  });

  try {
    await newTicket.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  res
    .status(201)
    .json({ message: 'Your ticket has been successfully raised.' });
};
