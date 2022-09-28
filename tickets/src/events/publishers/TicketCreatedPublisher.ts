import { Publisher, TicketCreatedEvent, Subjects } from '@adwesh/service-desk';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
