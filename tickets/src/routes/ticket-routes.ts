import { body } from 'express-validator';
import { Router } from 'express';
import { checkAuth } from '@adwesh/common';
import { Types } from 'mongoose';

import {
  createTicket,
  fetchTickets,
  fetchCategories,
  replyToTicket,
  updateTicket,
  selectDefaultEscalationMatrix,
} from '../controllers/ticket-controllers';

const router = Router();

router.use(checkAuth);

router.get('', fetchTickets);
router.get('/categories', fetchCategories);
router.post(
  '/new',
  [
    body('title').trim().isLength({ min: 3 }),
    body('description').trim().isLength({ min: 3 }),
    body('category')
      .not()
      .isEmpty()
      .custom((categoryId: string) => Types.ObjectId.isValid(categoryId)),
  ],
  createTicket
);

// add more validation checks to this
router.patch(
  '/:id',
  [
    body('title').trim().isLength({ min: 3 }),
    body('description').trim().isLength({ min: 3 }),
    body('category')
      .not()
      .isEmpty()
      .custom((categoryId: string) => Types.ObjectId.isValid(categoryId)),
  ],
  updateTicket
);

router.post(
  '/reply',
  [
    body('message').trim().isLength({ min: 3 }),
    body('ticket')
      .not()
      .isEmpty()
      .custom((ticketId: string) => Types.ObjectId.isValid(ticketId)),
  ],
  replyToTicket
);

router.patch(
  '/escalation-matrix',
  [
    body('escalationMatrix')
      .not()
      .isEmpty()
      .custom((matrixId: string) => Types.ObjectId.isValid(matrixId)),
  ],
  selectDefaultEscalationMatrix
);

export { router as ticketRouters };
