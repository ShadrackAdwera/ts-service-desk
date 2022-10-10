import { Subjects } from '../shared/Subjects';

export interface IActions {
  priority: string;
  actionTime: number;
}

export interface EscalationCreatedEvent {
  subject: Subjects.EscalationMatrixCreated;
  data: {
    id: string;
    title: string;
    escalationType: string;
    action: IActions[];
  };
}
