import mongoose from 'mongoose';
import { natsWraper } from '@adwesh/common';
import { UserCreatedListener } from './events/listeners/UserCreatedListener';
import { TicketCreatedListener } from './events/listeners/TicketCreatedListener';
import { CategoryCreatedListener } from './events/listeners/CategoryCreatedListener';
import { GroupCreatedListener } from './events/listeners/GroupCreatedListener';
import { initRedis } from './utils/init-redis';
import { AgentStatusUpdatedListener } from './events/listeners/AgentUpdatedListener';
import { handleScheduler } from './utils/auto-assign-tickets';

if (!process.env.JWT_KEY) {
  throw new Error('JWT is not defined!');
}

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

// if (!process.env.REDIS_URL) {
//   throw new Error('REDIS_URL must be defined');
// }

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

    new UserCreatedListener(natsWraper.client).listen();
    new GroupCreatedListener(natsWraper.client).listen();
    new CategoryCreatedListener(natsWraper.client).listen();
    new TicketCreatedListener(natsWraper.client).listen();
    new AgentStatusUpdatedListener(natsWraper.client).listen();

    process.on('SIGINT', () => natsWraper.client.close());
    process.on('SIGTERM', () => natsWraper.client.close());
    process.on('SIGINT', async () => await initRedis.client.quit());
    process.on('SIGTERM', async () => await initRedis.client.quit());

    await mongoose.connect(process.env.MONGO_URI!);
    await initRedis.connect();
    console.log('Connected to Auto Assignment Service');
  } catch (error) {
    console.log(error);
  }
};

start();
handleScheduler();
