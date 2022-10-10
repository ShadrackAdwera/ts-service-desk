import {
  Subjects,
  EscalationCreatedEvent,
  Publisher,
} from '@adwesh/service-desk';

export class EscalationCreatedPublisher extends Publisher<EscalationCreatedEvent> {
  subject: Subjects.EscalationMatrixCreated = Subjects.EscalationMatrixCreated;
}
