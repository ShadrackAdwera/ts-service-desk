// connection
import mongoose from 'mongoose';

import { app } from './app';
import { natsWraper } from '@adwesh/common';
import { configureDefaultEscalations } from './utils/init-values';
import { AgentStatusUpdatedListener } from './events/listeners/AgentUpdatedListener';
import { TicketAssignedListener } from './events/listeners/TicketAssignedListener';
import { TicketCreatedListener } from './events/listeners/TicketCreatedListener';
import { UserCreatedListener } from './events/listeners/UserCreatedListener';

if (!process.env.MONGO_URI) {
  throw new Error('MONGO URI is not defined!');
}

if (!process.env.NATS_CLUSTER_ID) {
  throw new Error('NATS_CLUSTER_ID must be defined');
}

if (!process.env.NATS_CLIENT_ID) {
  throw new Error('NATS_CLIENT_ID must be defined');
}

if (!process.env.NATS_URI) {
  throw new Error('NATS_URI must be defined');
}

const start = async () => {
  try {
    await natsWraper.connect(
      process.env.NATS_CLUSTER_ID!,
      process.env.NATS_CLIENT_ID!,
      process.env.NATS_URI!
    );

    natsWraper.client.on('close', () => {
      console.log('NATS shutting down . . .');
      process.exit();
    });

    new AgentStatusUpdatedListener(natsWraper.client).listen();
    new TicketAssignedListener(natsWraper.client).listen();
    new TicketCreatedListener(natsWraper.client).listen();
    new UserCreatedListener(natsWraper.client).listen();

    process.on('SIGINT', () => natsWraper.client.close());
    process.on('SIGTERM', () => natsWraper.client.close());

    await mongoose.connect(process.env.MONGO_URI!);
    app.listen(5004);
    console.log('Connected to Escalation Service, listening on PORT: 5004');
  } catch (error) {
    console.log(error);
  }
};

start();
configureDefaultEscalations();
