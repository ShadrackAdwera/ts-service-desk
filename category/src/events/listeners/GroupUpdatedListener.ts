import { Listener, GroupUpdatedEvent, Subjects } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';

import { HttpError } from '@adwesh/common';
import { Group } from '../../models/Category';
import { CATQGROUPNAME } from './GroupCreatedListener';

export class GroupUpdatedListener extends Listener<GroupUpdatedEvent> {
  subject: Subjects.GroupUpdated = Subjects.GroupUpdated;
  queueGroupName: string = CATQGROUPNAME;
  async onMessage(
    data: { title: string; id: string; users: string[] },
    msg: Message
  ): Promise<void> {
    let foundGroup;

    try {
      foundGroup = await Group.findById(data.id).exec();
    } catch (error) {
      console.log(error);
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
    if (!foundGroup) {
      msg.ack();
      throw new HttpError('Group with the ID does not exist', 404);
    }
    foundGroup.title = data.title;
    foundGroup.users = data.users;
    try {
      await foundGroup.save();
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
