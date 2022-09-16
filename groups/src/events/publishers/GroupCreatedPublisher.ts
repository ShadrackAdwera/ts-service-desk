import { Subjects, GroupCreatedEvent, Publisher } from '@adwesh/service-desk';

export class GroupCreatedPublisher extends Publisher<GroupCreatedEvent> {
  subject: Subjects.GroupCreated = Subjects.GroupCreated;
}
