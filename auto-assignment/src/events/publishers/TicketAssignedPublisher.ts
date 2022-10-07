import { Publisher, Subjects, TicketAssignedEvent } from '@adwesh/service-desk';

export class TicketAssignedPublisher extends Publisher<TicketAssignedEvent> {
    subject: Subjects.TicketAssigned = Subjects.TicketAssigned;
}