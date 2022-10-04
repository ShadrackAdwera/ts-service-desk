import { TicketAssignedEvent, Subjects, Listener } from '@adwesh/service-desk';
import { HttpError } from '@adwesh/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/Ticket';

const TICKETS_QUEUE_GROUP = 'tickets-service';

export class TicketAssignedListener extends Listener<TicketAssignedEvent> {
  subject: Subjects.TicketAssigned = Subjects.TicketAssigned;
  queueGroupName: string = TICKETS_QUEUE_GROUP;
  async onMessage(
    data: { id: string; category: string; assignedTo: string; status: string },
    msg: Message
  ): Promise<void> {
    //find ticket in db, if not exists, ack
    let foundTicket;
    try {
      foundTicket = await Ticket.findById(data.id).exec();
    } catch (error) {
      console.log(error);
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
    if (!foundTicket) {
      msg.ack();
      console.log('This ticket does not exist');
      return;
    }

    foundTicket.assignedTo = data.assignedTo;
    foundTicket.status = data.status;

    try {
      await foundTicket.save();
      msg.ack();
    } catch (error) {
      msg.ack();
      throw new HttpError(
        error instanceof Error
          ? error.message
          : 'An error occured in Ticket Assigned Listener',
        500
      );
    }
  }
}
