import { PRIORITIES, TicketStatus } from '@adwesh/service-desk';
import { Schema, Document, Model, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface IActions {
  priority: string;
  actionTime: number;
}

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

export interface EscalationDoc extends Document {
  title: string;
  escalationType: string;
  action: IActions[];
  mailTo: string[];
  mailCC: string[];
  version: number;
}

interface EscalationModel extends Model<EscalationDoc> {
  title: string;
  escalationType: string;
  action: IActions[];
  mailTo: string[];
  mailCC: string[];
}

const userSchema = new Schema({
  email: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
    default: 'active',
  },
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
    defaultDueDate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);

const escalationSchema = new Schema(
  {
    title: { type: String, required: true },
    escalationType: { type: String, required: true },
    action: [
      {
        priority: { type: String, required: true },
        actionTime: { type: Number, required: true },
      },
    ],
    mailTo: [{ type: String }],
    mailCC: [{ type: String }],
  },
  { timestamps: true, toJSON: { getters: true } }
);

userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);
categorySchema.set('versionKey', 'version');
categorySchema.plugin(updateIfCurrentPlugin);
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
escalationSchema.set('versionKey', 'version');
escalationSchema.plugin(updateIfCurrentPlugin);

const User = model<UserDoc, UserModel>('user', userSchema);
const Category = model<CategoryDoc, CategoryModel>('category', categorySchema);
const Ticket = model<TicketDoc, TicketModel>('ticket', ticketSchema);
const Escalation = model<EscalationDoc, EscalationModel>(
  'escalation',
  escalationSchema
);

export { Category, Ticket, User, Escalation };
