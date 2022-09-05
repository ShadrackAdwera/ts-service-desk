import { Listener, Subjects, UserCreatedEvent } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';
import { HttpError } from '@adwesh/common';
import { User } from '../../models/GroupsUser';

const GROUPS_QGNAME = 'groups-service';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName: string = GROUPS_QGNAME;
  async onMessage(
    data: { id: string; email: string; roles: string[] },
    msg: Message
  ): Promise<void> {
    //find user in db, if not exists, create them
    let foundUser;
    try {
      foundUser = await User.findOne({ userId: data.id }).exec();
    } catch (error) {
      console.log(error);
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
    if (foundUser) {
      msg.ack();
    }
    const newUser = new User({
      userId: data.id,
      email: data.email,
    });
    try {
      await newUser.save();
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
