import { Subjects } from '../shared/Subjects';

export interface CategoryUpdatedEvent {
  subject: Subjects.CategoryUpdated;
  data: {
    id: string;
    title: string;
    priority: string;
    assigmentMatrix: string;
    defaultDueDate: number;
    groups: string[];
  };
}
