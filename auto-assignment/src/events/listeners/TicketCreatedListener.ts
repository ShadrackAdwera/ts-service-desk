import { Listener, Subjects, TicketCreatedEvent } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';
import { HttpError } from '@adwesh/common';
import { Ticket } from '../../models/Replicas';

const AUTOASS_QGNAME = 'auto-assignment-service';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName: string = AUTOASS_QGNAME;
  async onMessage(
    data: {
      id: string;
      title: string;
      description: string;
      category: string;
      createdBy: string;
      assignedTo?: string | undefined;
      status: string;
      replies: string[];
      escalationMatrix: string;
    },
    msg: Message
  ): Promise<void> {
    //find ticket in db, if not exists, create them
    let foundTicket;
    try {
      foundTicket = await Ticket.findOne({ _id: data.id }).exec();
    } catch (error) {
      console.log(error);
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
    if (foundTicket) {
      msg.ack();
    }
    const newTicket = new Ticket({
      _id: data.id,
      status: data.status,
      category: data.category,
      assignedTo: data.assignedTo,
    });
    try {
      await newTicket.save();
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
