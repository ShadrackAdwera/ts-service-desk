import { Schema, model, Document, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { PRIORITIES, ASSIGNMENT_OPTIONS } from '@adwesh/service-desk';

interface CategoryDoc extends Document {
  title: string;
  description: string;
  priority: string;
  assignmentMatrix: string;
  defaultDueDate: number;
  groups: string[];
  version: number;
}

interface CategoryModel extends Model<CategoryDoc> {
  title: string;
  description: string;
  priority: string;
  assignmentMatrix: string;
  defaultDueDate: number;
  groups: string[];
}

interface GroupDoc extends Document {
  title: string;
  users: string[];
  groupId: string;
  version: number;
}

interface GroupModel extends Model<GroupDoc> {
  title: string;
  users: string[];
}

const categorySchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
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
        ref: 'group',
      },
    ],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    groupId: { type: Schema.Types.ObjectId },
    users: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true, toJSON: { getters: true } }
);

groupSchema.set('versionKey', 'version');
groupSchema.plugin(updateIfCurrentPlugin);
categorySchema.set('versionKey', 'version');
categorySchema.plugin(updateIfCurrentPlugin);

const Group = model<GroupDoc, GroupModel>('group', groupSchema);
const Category = model<CategoryDoc, CategoryModel>('category', categorySchema);

export { Category, Group };
