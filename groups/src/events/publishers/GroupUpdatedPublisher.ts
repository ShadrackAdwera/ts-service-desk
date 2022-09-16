import { Publisher, GroupUpdatedEvent, Subjects } from '@adwesh/service-desk';

export class GroupUpdatedPublisher extends Publisher<GroupUpdatedEvent> {
  subject: Subjects.GroupUpdated = Subjects.GroupUpdated;
}
