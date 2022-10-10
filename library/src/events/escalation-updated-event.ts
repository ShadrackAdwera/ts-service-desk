import { Subjects } from '../shared/Subjects';
import { IActions } from './escalation-created-event';

export interface EscalationUpdatedEvent {
  subject: Subjects.EscalationMatrixUpdated;
  data: {
    id: string;
    action: IActions[];
  };
}
