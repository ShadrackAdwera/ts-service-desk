import {
  ASSIGNMENT_OPTIONS,
  PRIORITIES,
  TicketStatus,
} from '@adwesh/service-desk';
import { model, Model, Document, Schema } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

const FORTY_EIGHT_HOURS = 60 * 60 * 1000 * 48;

interface CategoryDoc extends Document {
  title: string;
  priority: string;
  assignmentMatrix: string;
  defaultDueDate: number;
  groups: string[];
  version: number;
}

interface CategoryModel extends Model<CategoryDoc> {
  title: string;
  priority: string;
  assignmentMatrix: string;
  defaultDueDate: number;
  groups: string[];
}

interface ReplyDoc extends Document {
  message: string;
  createdBy: string;
  ticket: string;
  version: number;
}

interface ReplyModel extends Model<ReplyDoc> {
  message: string;
  ticket: string;
  createdBy: string;
}

interface EscalationMatrixDoc extends Document {
  title: string;
  selected: string;
  version: number;
}

interface EscalationMatrixModel extends Model<EscalationMatrixDoc> {
  title: string;
  selected: string;
}

interface TicketDoc extends Document {
  title: string;
  description: string;
  category: string;
  createdBy: string;
  assignedTo: string;
  status: string;
  replies: string[];
  escalationMatrix: string;
  version: number;
}

interface TicketModel extends Model<TicketDoc> {
  title: string;
  description: string;
  category: string;
  createdBy: string;
  assignedTo: string;
  status: string;
  replies: string[];
  escalationMatrix: string;
}

const categorySchema = new Schema(
  {
    title: { type: String, required: true },
    priority: {
      type: String,
      required: true,
      enum: Object.values(PRIORITIES),
      default: PRIORITIES.LOW,
    },
    assignmentMatrix: {
      type: String,
      required: true,
      enum: Object.values(ASSIGNMENT_OPTIONS),
      default: ASSIGNMENT_OPTIONS.NO,
    },
    defaultDueDate: {
      type: Number,
      required: true,
      default: FORTY_EIGHT_HOURS,
    },
    groups: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const replySchema = new Schema(
  {
    message: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    ticket: { type: Schema.Types.ObjectId, required: true, ref: 'ticket' },
  },
  { timestamps: true, toJSON: { getters: true } }
);

const escalationMatrixSchema = new Schema(
  {
    title: { type: String, required: true },
    selected: {
      type: String,
      required: true,
      enum: ['yes', 'no'],
      default: 'no',
    },
  },
  { timestamps: true, toJSON: { getters: true } }
);

const ticketSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, required: true, ref: 'category' },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    assignedTo: { type: Schema.Types.ObjectId },
    status: {
      type: String,
      required: true,
      enum: Object.values(TicketStatus),
      default: TicketStatus.OPEN,
    },
    replies: [{ type: Schema.Types.ObjectId, ref: 'reply' }],
    escalationMatrix: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true, toJSON: { getters: true } }
);

categorySchema.set('versionKey', 'version');
categorySchema.plugin(updateIfCurrentPlugin);
replySchema.set('versionKey', 'version');
replySchema.plugin(updateIfCurrentPlugin);
ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);
escalationMatrixSchema.set('versionKey', 'version');
escalationMatrixSchema.plugin(updateIfCurrentPlugin);

const Category = model<CategoryDoc, CategoryModel>('category', categorySchema);
const Reply = model<ReplyDoc, ReplyModel>('reply', replySchema);
const Ticket = model<TicketDoc, TicketModel>('ticket', ticketSchema);
const EscalationMatrix = model<EscalationMatrixDoc, EscalationMatrixModel>(
  'escalation',
  escalationMatrixSchema
);

export { Category, Reply, Ticket, EscalationMatrix };
