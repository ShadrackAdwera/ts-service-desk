import { Subjects } from '../shared/Subjects';

export interface TicketAssignedEvent {
  subject: Subjects.TicketAssigned;
  data: {
    id: string;
    category: string;
    assignedTo: string;
    status: string;
  };
}
