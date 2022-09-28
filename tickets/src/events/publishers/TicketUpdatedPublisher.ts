import { Publisher, TicketUpdatedEvent, Subjects } from '@adwesh/service-desk';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
