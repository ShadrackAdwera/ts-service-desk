import { Subjects } from '../shared/Subjects';

export interface UserUpdatedEvent {
  subject: Subjects.UserUpdated;
  data: {
    id: string;
    email: string;
    roles: string[];
  };
}
