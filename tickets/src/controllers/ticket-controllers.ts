import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { HttpError, natsWraper } from '@adwesh/common';
import { ASSIGNMENT_OPTIONS, TicketStatus } from '@adwesh/service-desk';

import { Ticket, Reply, Category, EscalationMatrix } from '../models/Ticket';
import { TicketCreatedPublisher } from '../events/publishers/TicketCreatedPublisher';
import { TicketUpdatedPublisher } from '../events/publishers/TicketUpdatedPublisher';

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
  let foundCategory;

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

  try {
    foundCategory = await Category.findById(category).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  if (!foundCategory)
    return next(new HttpError('The provided category does not exist!', 404));

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

  if (foundCategory.assignmentMatrix !== ASSIGNMENT_OPTIONS.NO) {
    try {
      await new TicketCreatedPublisher(natsWraper.client).publish({
        id: newTicket._id,
        title: newTicket.title,
        description: newTicket.description,
        category: newTicket.category,
        createdBy: newTicket.createdBy,
        escalationMatrix: newTicket.escalationMatrix,
        status: newTicket.status,
        assignedTo: newTicket.assignedTo,
        replies: newTicket.replies,
      });
    } catch (error) {
      return next(
        new HttpError(
          error instanceof Error ? error.message : 'An error occured',
          500
        )
      );
    }
  }

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
  let foundCategory;

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

  try {
    foundCategory = await Category.findById(category).exec();
  } catch (error) {
    return next(
      new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      )
    );
  }

  if (!foundCategory)
    return next(new HttpError('The provided category does not exist!', 404));

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
  if (foundCategory.assignmentMatrix !== ASSIGNMENT_OPTIONS.NO) {
    try {
      await new TicketUpdatedPublisher(natsWraper.client).publish({
        id: foundTicket._id,
        title: foundTicket.title,
        description: foundTicket.description,
        category: foundTicket.category,
        createdBy: foundTicket.createdBy,
        escalationMatrix: foundTicket.escalationMatrix,
        status: foundTicket.status,
        assignedTo: foundTicket.assignedTo,
        replies: foundTicket.replies,
      });
    } catch (error) {
      return next(
        new HttpError(
          error instanceof Error ? error.message : 'An error occured',
          500
        )
      );
    }
  }

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
    if (foundTicket.assignedTo === userId) {
      foundTicket.status = TicketStatus.WAITING_REPLY;
    } else {
      foundTicket.status = TicketStatus.IN_PROGRESS;
    }
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

//TODO: Create Ticket deleted controller

export {
  createTicket,
  fetchTickets,
  fetchCategories,
  updateTicket,
  selectDefaultEscalationMatrix,
  replyToTicket,
};
