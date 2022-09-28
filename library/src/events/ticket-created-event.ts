import { Subjects } from '../shared/Subjects';

export interface TicketCreatedEvent {
  subject: Subjects.TicketCreated;
  data: {
    id: string;
    title: string;
    description: string;
    category: string;
    createdBy: string;
    assignedTo?: string;
    status: string;
    replies: string[];
    escalationMatrix: string;
  };
}
