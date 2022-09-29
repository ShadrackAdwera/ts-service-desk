import { Listener, Subjects, UserCreatedEvent } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';
import { HttpError } from '@adwesh/common';
import { User } from '../../models/Replicas';

const AUTOASS_QGNAME = 'auto-assignment-service';

export class UserCreatedListener extends Listener<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
  queueGroupName: string = AUTOASS_QGNAME;
  async onMessage(
    data: { id: string; email: string; roles: string[] },
    msg: Message
  ): Promise<void> {
    //find user in db, if not exists, create them
    let foundUser;
    try {
      foundUser = await User.findOne({ _id: data.id }).exec();
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
      _id: data.id,
      email: data.email,
      activeTickets: 0,
      status: 'active',
      timeAssigned: Date.now(),
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
