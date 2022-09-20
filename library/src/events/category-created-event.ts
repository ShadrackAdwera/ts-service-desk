import { ASSIGNMENT_OPTIONS } from '../shared/AssignmentOptions';
import { Subjects } from '../shared/Subjects';

export interface CategoryCreatedEvent {
  subject: Subjects.CategoryCreated;
  data: {
    id: string;
    title: string;
    priority: string;
    assigmentMatrix: ASSIGNMENT_OPTIONS;
    defaultDueDate: string;
    groups: string[];
  };
}
