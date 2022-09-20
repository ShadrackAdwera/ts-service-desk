import {
  Publisher,
  CategoryCreatedEvent,
  Subjects,
} from '@adwesh/service-desk';

export class CategoryCreatedPublisher extends Publisher<CategoryCreatedEvent> {
  subject: Subjects.CategoryCreated = Subjects.CategoryCreated;
}
