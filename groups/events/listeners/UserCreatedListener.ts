import { Listener, Subjects, UserCreatedEvent } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';

const GROUPS_QGNAME = 'groups-service';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName: string = GROUPS_QGNAME;
  onMessage(
    data: { id: string; email: string; roles: string[] },
    msg: Message
  ): void {
    throw new Error('Method not implemented.');
  }
}
