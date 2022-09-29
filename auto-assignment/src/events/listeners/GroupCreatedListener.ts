import { Listener, Subjects, GroupCreatedEvent } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';
import { HttpError } from '@adwesh/common';

import { Group } from '../../models/Replicas';
import { AUTOASS_QGNAME } from './TicketCreatedListener';

export class GroupCreatedListener extends Listener<GroupCreatedEvent> {
  subject: Subjects.GroupCreated = Subjects.GroupCreated;
  queueGroupName: string = AUTOASS_QGNAME;
  async onMessage(
    data: { title: string; id: string; users: string[] },
    msg: Message
  ): Promise<void> {
    const newGroup = new Group({
      title: data.title,
      users: data.users,
      _id: data.id,
    });
    try {
      await newGroup.save();
      msg.ack();
    } catch (error) {
      console.log(error);
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
  }
}
