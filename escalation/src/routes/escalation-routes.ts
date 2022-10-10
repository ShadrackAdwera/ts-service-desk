import { body } from 'express-validator';
import { Router } from 'express';
import { checkAuth } from '@adwesh/common';

import {
  getEscalationMatrices,
  updateEscalationMatrix,
} from '../controllers/escalation-controllers';

const router = Router();

router.use(checkAuth);
router.get('', getEscalationMatrices);
router.patch(
  '/:matrixId',
  [body('actionTime').isNumeric()],
  updateEscalationMatrix
);

export { router as escalationMatrixRouter };
