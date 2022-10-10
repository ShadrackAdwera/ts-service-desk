import { Subjects } from '../shared/Subjects';

export interface EscalationUpdatedEvent {
  subject: Subjects.EscalationMatrixUpdated;
  data: {
    id: string;
    actionTime: number;
  };
}
