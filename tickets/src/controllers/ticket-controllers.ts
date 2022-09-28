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

const fetchCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let foundCategories;

  try {
    foundCategories = await Category.find().exec();
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
    .json({ count: foundCategories.length, categories: foundCategories });
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

  // emit event

  res
    .status(201)
    .json({ message: 'Your ticket has been successfully raised.' });
};

const updateTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isError = validationResult(req);
  if (!isError.isEmpty()) {
    return next(new HttpError('Invalid inputs', 422));
  }

  const ticketId = req.params.id;
  const { title, description, category, assignedTo, status, escalationMatrix } =
    req.body;

  let foundTicket;

  if (!ticketId) return next(new HttpError('This ticket does not exist', 404));

  try {
    foundTicket = await Ticket.findById(ticketId).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  if (!foundTicket)
    return next(new HttpError('This ticket does not exist', 404));

  foundTicket.title = title;
  foundTicket.description = description;
  foundTicket.category = category;
  foundTicket.assignedTo = assignedTo;
  foundTicket.status = status;
  foundTicket.escalationMatrix = escalationMatrix;

  try {
    await foundTicket.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  //emit TicketUpdated Event
  res
    .status(200)
    .json({ message: `Ticket ref ${foundTicket.id} has been updated.` });
};

const replyToTicket = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isError = validationResult(req);
  if (!isError.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { message, ticket } = req.body;
  const userId = req.user?.userId;

  if (!userId) return next(new HttpError('Invalid user', 401));

  let foundTicket;

  try {
    foundTicket = await Ticket.findById(ticket).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  if (!foundTicket)
    return next(new HttpError('The ticket does not exist', 404));

  //implement concurrency in posting to tickets DB and reply DB
  const newReply = new Reply({
    message,
    ticket,
    createdBy: userId,
  });

  try {
    await newReply.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  try {
    foundTicket.replies.push(newReply._id);
    await foundTicket.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  // notify creator of ticket of this reply - or agent of this reply (need for duplicate user DB? We'll see)
  // createdBy === userId from token (notify agent)
  // assignedTo === userId from token (notify user)
  // emit to email notifications service? Also a possibility
  res.status(201).json({ message: 'The reply has been registered' });
};

const selectDefaultEscalationMatrix = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const isError = validationResult(req);
  if (!isError.isEmpty()) return next(new HttpError('Invalid inputs', 422));

  const { escalationMatrix } = req.body;

  let foundMatrix;

  try {
    foundMatrix = await EscalationMatrix.findById(escalationMatrix).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  if (!foundMatrix)
    return next(new HttpError('This matrix does not exist', 404));

  try {
    foundMatrix.selected = 'yes';
    await foundMatrix.save();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }
  res.status(200).json({ message: 'Default matrix configured' });
};

export {
  createTicket,
  fetchTickets,
  fetchCategories,
  updateTicket,
  selectDefaultEscalationMatrix,
  replyToTicket,
};
