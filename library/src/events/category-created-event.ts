import { Subjects } from '../shared/Subjects';

export interface CategoryCreatedEvent {
  subject: Subjects.CategoryCreated;
  data: {
    id: string;
    title: string;
    priority: string;
    assigmentMatrix: string;
    defaultDueDate: number;
    groups: string[];
  };
}
