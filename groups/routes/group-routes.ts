import { body } from 'express-validator';
import { Router } from 'express';
import { checkAuth } from '@adwesh/common';

import {
  createGroup,
  addUsersToGroup,
  removeUsersFromGroup,
  fetchGroups,
} from '../controllers/group-controllers';

const router = Router();
// TODO: Replace the middleware with admin middleware
router.get('/', checkAuth, fetchGroups);
router.post(
  '/new',
  checkAuth,
  [body('title').trim().isLength({ min: 3 })],
  createGroup
);
router.patch('/:groupId/add-users', checkAuth, addUsersToGroup);
router.patch('/:groupId/remove-users', checkAuth, removeUsersFromGroup);

export { router as groupRoutes };
