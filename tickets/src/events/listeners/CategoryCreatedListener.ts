import { CategoryCreatedEvent, Subjects, Listener } from '@adwesh/service-desk';
import { HttpError } from '@adwesh/common';
import { Message } from 'node-nats-streaming';
import { Category } from '../../models/Ticket';

const CATEGORY_QUEUE_GROUP = 'category-service';

export class CategoryCreatedListener extends Listener<CategoryCreatedEvent> {
  subject: Subjects.CategoryCreated = Subjects.CategoryCreated;
  queueGroupName: string = CATEGORY_QUEUE_GROUP;
  async onMessage(
    data: {
      id: string;
      title: string;
      priority: string;
      assignmentMatrix: string;
      defaultDueDate: number;
      groups: string[];
    },
    msg: Message
  ): Promise<void> {
    //find category in db, if not exists, create them
    let foundCategory;
    try {
      foundCategory = await Category.findById(data.id).exec();
    } catch (error) {
      console.log(error);
      throw new HttpError(
        error instanceof Error ? error.message : 'An error occured',
        500
      );
    }
    if (foundCategory) {
      msg.ack();
      console.log('This category already exists');
      return;
    }
    const newCategory = new Category({
      _id: data.id,
      title: data.title,
      priority: data.priority,
      assignmentMatrix: data.assignmentMatrix,
      defaultDueDate: data.defaultDueDate,
      groups: data.groups,
    });

    try {
      await newCategory.save();
      msg.ack();
    } catch (error) {
      msg.ack();
      throw new HttpError(
        error instanceof Error
          ? error.message
          : 'An error occured in Category Listener',
        500
      );
    }
  }
}
