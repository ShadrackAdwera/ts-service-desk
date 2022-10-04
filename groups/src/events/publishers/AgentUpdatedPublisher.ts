import { Publisher, AgentStatusUpdated, Subjects } from '@adwesh/service-desk';

export class AgentStatusUpdatedPublisher extends Publisher<AgentStatusUpdated> {
  subject: Subjects.AgentStatusUpdated = Subjects.AgentStatusUpdated;
}
