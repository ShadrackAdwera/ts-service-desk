import { Publisher, UserCreatedEvent, Subjects } from '@adwesh/service-desk';

export class UserCreatedPublisher extends Publisher<UserCreatedEvent> {
  subject: Subjects.UserCreated = Subjects.UserCreated;
}
