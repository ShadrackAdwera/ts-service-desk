import { HttpError } from '@adwesh/common';
import express, { Request, Response, NextFunction } from 'express';
import { ticketRouters } from './routes/ticket-routes';

const app = express();

app.use(express.json());

//CORS

app.use('/api/tickets', ticketRouters);

app.use((_req: Request, _res: Response, _next: NextFunction) => {
  throw new HttpError('This method / route does not exist!', 404);
});

app.use((error: Error, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(error);
  }
  res
    .status(500)
    .json({ message: error.message || 'An error occured, try again!' });
});

export { app };
