import { Subjects } from '../shared/Subjects';
import { Roles } from '../shared/Roles';

export interface UserUpdatedEvent {
  subject: Subjects.UserUpdated;
  data: {
    id: string;
    email: string;
    role: Roles;
  };
}
