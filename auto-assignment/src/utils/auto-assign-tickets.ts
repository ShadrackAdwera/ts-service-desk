import { natsWraper } from '@adwesh/common';
import { ASSIGNMENT_OPTIONS, TicketStatus } from '@adwesh/service-desk';
import { Types } from 'mongoose';
import cron from 'node-cron';
import { TicketAssignedPublisher } from '../events/publishers/TicketAssignedPublisher';
import { Category, Group, Ticket, User, UserDoc } from '../models/Replicas';
import { getMinAgent } from './get-min';

import { initRedis } from './init-redis';
import { PriorityQueue } from './PriorityQueue';

//const populateQuery = [{ path: 'category', select: ['assignmentMatrix','groups'] }];

// run jobs every 15 minutes to assign tickets to agents
// configure jobs to run within business hours dynamically
// configure frequency of jobs dynamically
export const handleScheduler = () => {
  cron.schedule('*/15 * * * *', async () => {
    if (new Date().getHours() > 8 && new Date().getHours() < 17) {
      const stringifiedTickets = await initRedis.client.get('tickets');
      if (!stringifiedTickets) return;
      const currentQueue: PriorityQueue = JSON.parse(stringifiedTickets);
      let foundTicket;
      let foundCategory;
      let agents;
      const poppedTicket = currentQueue.extractMax();
      if (!poppedTicket) {
        console.log('Queue is empty . . . ');
        return;
      }
      try {
        foundTicket = await Ticket.findById(poppedTicket.id).exec();
      } catch (error) {
        console.log(error);
      }
      if (!foundTicket) {
        console.log('Ticket does not exist');
        return;
      }
      try {
        foundCategory = await Category.findById(foundTicket.category).exec();
      } catch (error) {
        console.log(error);
      }
      if (!foundCategory) {
        console.log('Category does not exist');
        return;
      }
      //found the ticket + assignment matrix
      // assign based on assignment matrix
      if (foundCategory.assignmentMatrix === ASSIGNMENT_OPTIONS.YES_ANY_USER) {
        try {
          agents = await User.find().exec();
        } catch (error) {
          console.log(error);
          return;
        }
        if (agents.length === 0) {
          console.log('Agents not found');
          return;
        }
        let foundAgent = getMinAgent(agents);
        // if throttle is maxed out, go to next agent - TODO: implement recursion()
        if (foundAgent.activeTickets === foundAgent.throttle) {
          const newPool = agents.filter((agent) => agent.id !== foundAgent.id);
          foundAgent = getMinAgent(newPool);
        }
        // add to ticket
        foundTicket.assignedTo = foundAgent._id;
        foundTicket.status = TicketStatus.IN_PROGRESS;
        // update time assigned, active tickets
        foundAgent.timeAssigned = Date.now();
        foundAgent.activeTickets = foundAgent.activeTickets + 1;
        // TODO: create a transaction to concurrent updates to the dbs
        // update redis cache
        initRedis.client.set('tickets', JSON.stringify(currentQueue));
        // save ticket to DB
        await foundTicket.save();
        // save agent to DB
        await foundAgent.save();
        // publish event
        await new TicketAssignedPublisher(natsWraper.client).publish({
          id: foundTicket._id,
          status: foundTicket.status,
          assignedTo: foundTicket.assignedTo,
          category: foundTicket.category,
        });
      } else if (
        foundCategory.assignmentMatrix === ASSIGNMENT_OPTIONS.YES_SPECIFIC_USERS
      ) {
        const foundUsers = [];
        const agentPool: (UserDoc & { _id: Types.ObjectId })[] = [];
        let foundGroup;
        let foundUser;
        for (const grp of foundCategory.groups) {
          try {
            foundGroup = await Group.findById(grp).exec();
          } catch (error) {
            console.log(error);
            break;
          }
          if (foundGroup) {
            // push all users in these groups into an array
            foundUsers.push(...foundGroup.users);
          }
        }
        //found users is an id of users from those groups - remove duplicate IDs
        const allAgents = [...new Set(foundUsers)];
        for (const agt of allAgents) {
          try {
            foundUser = await User.findById(agt).exec();
          } catch (error) {
            console.log(error);
            break;
          }
          if (foundUser) {
            agentPool.push(foundUser);
          }
        }
        if (agentPool.length === 0) {
          console.log('Agents not found');
          return;
        }

        let foundAgent = getMinAgent(agentPool);
        // if throttle is maxed out, go to next agent - TODO: implement recursion()
        if (foundAgent.activeTickets === foundAgent.throttle) {
          const newPool = agentPool.filter(
            (agent) => agent.id !== foundAgent.id
          );
          foundAgent = getMinAgent(newPool);
        }
        // add to ticket
        foundTicket.assignedTo = foundAgent._id;
        foundTicket.status = TicketStatus.IN_PROGRESS;
        // update time assigned, active tickets
        foundAgent.timeAssigned = Date.now();
        foundAgent.activeTickets = foundAgent.activeTickets + 1;
        // TODO: create a transaction to concurrent updates to the dbs
        // update redis cache
        initRedis.client.set('tickets', JSON.stringify(currentQueue));
        // save ticket to DB
        await foundTicket.save();
        // save agent to DB
        await foundAgent.save();
        // publish event
        await new TicketAssignedPublisher(natsWraper.client).publish({
          id: foundTicket._id,
          status: foundTicket.status,
          assignedTo: foundTicket.assignedTo,
          category: foundTicket.category,
        });
      }
    }
  });
};
