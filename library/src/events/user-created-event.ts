import { Subjects } from '../shared/Subjects';

export interface UserCreatedEvent {
  subject: Subjects.UserCreated;
  data: {
    id: string;
    email: string;
    roles: string[];
  };
}
