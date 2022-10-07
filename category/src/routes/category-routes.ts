import { body } from 'express-validator';
import { Router } from 'express';
import { checkAuth } from '@adwesh/common';

import {
  createCategory,
  fetchCategories,
} from '../controllers/category-controllers';

const router = Router();

router.use(checkAuth);
router.get('', fetchCategories);
router.post(
  '/new',
  [
    body('title').trim().isLength({ min: 3 }),
    body('priority').trim().not().isEmpty(),
    body('defaultDueDate').isNumeric(),
  ],
  createCategory
);

export { router as categoryRoutes };
