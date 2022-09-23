import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpError } from '@adwesh/common';
import {
  TicketCreatedEvent,
  TicketUpdatedEvent,
  TicketStatus,
} from '@adwesh/service-desk';

import { Ticket, Reply, Category } from '../models/Ticket';

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
