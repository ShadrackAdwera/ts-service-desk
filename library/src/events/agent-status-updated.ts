import { Subjects } from '../shared/Subjects';

export interface AgentStatusUpdated {
  subject: Subjects.AgentStatusUpdated;
  data: {
    agentId: string;
    status: string;
  };
}
