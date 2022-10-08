import {
  ASSIGNMENT_OPTIONS,
  PRIORITIES,
  TicketStatus,
} from '@adwesh/service-desk';
import { Schema, Document, Model, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export interface UserDoc extends Document {
  email: string;
  status: string; // if agent is active or inactive - if inactive abort mission
  version: number;
}

interface UserModel extends Model<UserDoc> {
  email: string;
  status: string; // if agent is active or inactive - if inactive abort mission
}

interface TicketDoc extends Document {
  status: string; // TicketStatus enum
  category: string;
  assignedTo: string;
  version: number;
}

interface TicketModel extends Model<TicketDoc> {
  status: string; // TicketStatus enum
  category: string;
  assignedTo: string;
}

interface CategoryDoc extends Document {
  title: string;
  priority: string;
  defaultDueDate: number;
  version: number;
}

interface CategoryModel extends Model<CategoryDoc> {
  title: string;
  priority: string;
  defaultDueDate: number;
}

const userSchema = new Schema({
  email: { type: String, required: true },
  activeTickets: { type: Number, required: true, default: 0 },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  throttle: { type: Number, required: true, default: 5 },
  timeAssigned: { type: Date, required: true, default: Date.now() },
});

const ticketSchema = new Schema({
  status: { type: String, required: true, enum: Object.values(TicketStatus) },
  category: { type: Schema.Types.ObjectId, required: true, ref: 'category' },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'user' },
});

const categorySchema = new Schema(
  {
    title: { type: String, required: true },
    priority: {
      type: String,
      required: true,
      enum: Object.values(PRIORITIES),
    },
    assignmentMatrix: {
      type: String,
      required: true,
      enum: Object.values(ASSIGNMENT_OPTIONS),
    },
    defaultDueDate: {
      type: Number,
      required: true,
    },
    groups: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true, toJSON: { getters: true } }
);

userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);
categorySchema.set('versionKey', 'version');
categorySchema.plugin(updateIfCurrentPlugin);
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

const User = model<UserDoc, UserModel>('user', userSchema);
const Category = model<CategoryDoc, CategoryModel>('category', categorySchema);
const Ticket = model<TicketDoc, TicketModel>('ticket', ticketSchema);

export { Category, Ticket, User };
