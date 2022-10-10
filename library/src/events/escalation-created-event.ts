import { Subjects } from '../shared/Subjects';

export interface EscalationCreatedEvent {
  subject: Subjects.EscalationMatrixCreated;
  data: {
    id: string;
    title: string;
    escalationType: string;
    actionTime: number;
  };
}
