import { Publisher, Subjects, UserUpdatedEvent } from '@adwesh/service-desk';

export class UserUpdatedPublisher extends Publisher<UserUpdatedEvent> {
  subject: Subjects.UserUpdated = Subjects.UserUpdated;
}
