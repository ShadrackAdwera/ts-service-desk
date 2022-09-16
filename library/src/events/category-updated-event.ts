import { ASSIGNMENT_OPTIONS } from '../shared/AssignmentOptions';
import { Subjects } from '../shared/Subjects';

export interface CategoryUpdatedEvent {
  subject: Subjects.CategoryUpdated;
  data: {
    id: string;
    title: string;
    priority: number;
    assigmentMatrix: ASSIGNMENT_OPTIONS;
    defaultDueDate: string;
    groups: string[];
  };
}
