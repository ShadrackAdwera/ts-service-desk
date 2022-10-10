import {
  Subjects,
  EscalationCreatedEvent,
  Listener,
} from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';
import { EscalationMatrix } from '../../models/Ticket';

import { TICKETS_QUEUE_GROUP } from './TicketAssignedListener';

export class EscalationCreatedListener extends Listener<EscalationCreatedEvent> {
  subject: Subjects.EscalationMatrixCreated = Subjects.EscalationMatrixCreated;
  queueGroupName: string = TICKETS_QUEUE_GROUP;
  async onMessage(
    data: {
      id: string;
      title: string;
      escalationType: string;
      actionTime: number;
    },
    msg: Message
  ): Promise<void> {
    let foundMatrix;
    try {
      foundMatrix = await EscalationMatrix.findById(data.id).exec();
    } catch (error) {
      console.log(error);
    }

    if (foundMatrix) {
      msg.ack();
    }

    const matrix = new EscalationMatrix({
      _id: data.id,
      title: data.title,
      selected: 'no',
    });

    try {
      await matrix.save();
      msg.ack();
    } catch (error) {
      console.log(error);
    }
  }
}
