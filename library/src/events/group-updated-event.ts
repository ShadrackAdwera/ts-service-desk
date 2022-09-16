import { Subjects } from '../shared/Subjects';

export interface GroupCreatedEvent {
  subject: Subjects.GroupUpdated;
  data: {
    title: string;
    id: string;
    users: string[];
  };
}
