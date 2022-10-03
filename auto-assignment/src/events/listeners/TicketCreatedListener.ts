import { Listener, Subjects, TicketCreatedEvent } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';
import { HttpError } from '@adwesh/common';
import { Category, Ticket } from '../../models/Replicas';
import { PriorityQueue } from '../../utils/PriorityQueue';
import { initRedis } from '../../utils/init-redis';

export const AUTOASS_QGNAME = 'auto-assignment-service';

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
    let category;
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

    try {
      category = await Category.findById(data.category).exec();
    } catch (error) {
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }

    if (!category) {
      throw new HttpError('This category does not exist!', 500);
    }

    // get priority queue stored in Redis - if not, create one;
    try {
      const result = await initRedis.client.get('tickets');
      if (!result) {
        const priorityQueue = new PriorityQueue();
        priorityQueue.insert({
          id: data.id,
          priority: category.priority,
        });
        // save to redis
        initRedis.client.set('tickets', JSON.stringify(priorityQueue));
      } else {
        const currentQueue: PriorityQueue = JSON.parse(result);
        // insert new ticket into priority queue
        currentQueue.insert({
          id: data.id,
          priority: category.priority,
        });
        // then save to redis
        initRedis.client.set('tickets', JSON.stringify(currentQueue));
      }
    } catch (error) {
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
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
