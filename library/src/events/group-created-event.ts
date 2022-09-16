import { Subjects } from '../shared/Subjects';

export interface GroupCreatedEvent {
  subject: Subjects.GroupCreated;
  data: {
    title: string;
    id: string;
    users: string[];
  };
}
