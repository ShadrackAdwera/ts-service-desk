import { HttpError } from '@adwesh/common';
import { AgentStatusUpdated, Subjects, Listener } from '@adwesh/service-desk';
import { Message } from 'node-nats-streaming';
import { User } from '../../models/Escalation';

import { AUTOASS_QGNAME } from './TicketCreatedListener';

export class AgentStatusUpdatedListener extends Listener<AgentStatusUpdated> {
  subject: Subjects.AgentStatusUpdated = Subjects.AgentStatusUpdated;
  queueGroupName: string = AUTOASS_QGNAME;
  async onMessage(
    data: { agentId: string; status: string },
    msg: Message
  ): Promise<void> {
    //get agent
    let foundAgent;
    try {
      foundAgent = await User.findById(data.agentId).exec();
    } catch (error) {
      console.log(error);
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
    if (!foundAgent) {
      console.log('Agent not found');
      msg.ack();
      return;
    }
    foundAgent.status = data.status;
    try {
      await foundAgent.save();
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
