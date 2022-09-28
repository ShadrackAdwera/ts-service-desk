import { Subjects } from '../shared/Subjects';

export interface TicketUpdatedEvent {
  subject: Subjects.TicketUpdated;
  data: {
    id: string;
    title: string;
    description: string;
    category: string;
    createdBy: string;
    assignedTo: string;
    status: string;
    replies: string[];
    escalationMatrix: string;
  };
}
