import { Subjects } from '../shared/Subjects';

export interface GroupUpdatedEvent {
  subject: Subjects.GroupUpdated;
  data: {
    title: string;
    id: string;
    users: string[];
  };
}
