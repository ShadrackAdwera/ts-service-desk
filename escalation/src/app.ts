import { HttpError } from '@adwesh/common';
import express, { Request, Response, NextFunction } from 'express';

import { escalationMatrixRouter } from './routes/escalation-routes';

const app = express();
app.use(express.json());
app.use('/api/escalation', escalationMatrixRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  throw new HttpError('The method / route does not exist', 404);
});

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(500)
    .json({ message: error.message || 'An error occured, try again' });
});

export { app };
