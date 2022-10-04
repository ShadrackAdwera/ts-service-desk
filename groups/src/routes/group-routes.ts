import { body } from 'express-validator';
import { Router } from 'express';
import { checkAuth } from '@adwesh/common';

import {
  createGroup,
  addUsersToGroup,
  removeUsersFromGroup,
  fetchGroups,
  fetchGroupUsers,
  updateAgentActiveStatus,
} from '../controllers/group-controllers';

const router = Router();
// TODO: Replace the middleware with admin middleware
router.use(checkAuth);
router.get('', fetchGroups);
router.get('/users', fetchGroupUsers);
router.post('/new', [body('title').trim().isLength({ min: 3 })], createGroup);
router.patch('/:groupId/add-users', addUsersToGroup);
router.patch('/:groupId/remove-users', removeUsersFromGroup);
router.patch(
  '/:agentId/update-status',
  [body('status').trim().not().isEmpty().isIn(['active', 'inactive'])],
  updateAgentActiveStatus
);

export { router as groupRoutes };
