import { Subjects } from '../shared/Subjects';
import { Roles } from '../shared/Roles';

export interface UserCreatedEvent {
  subject: Subjects.UserCreated;
  data: {
    id: string;
    email: string;
    roles: Roles[];
  };
}
