import { Schema, model, Document, Model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

const ONE_HOUR = 60 * 60 * 1000;

interface CategoryDoc extends Document {
  title: string;
  description: string;
  priority: number;
  assigmentMatrix: string;
  defaultDueDate: Date;
  groups: string[];
  version: number;
}

interface CategoryModel extends Model<CategoryDoc> {
  title: string;
  description: string;
  priority: number;
  assigmentMatrix: string;
  defaultDueDate: Date;
  groups: string[];
}

interface GroupDoc extends Document {
  title: string;
  users: string[];
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
    priority: { type: Number, required: true },
    assignmentMatrix: { type: String },
    defaultDueDate: {
      type: Date,
      required: true,
      default: Date.now() + ONE_HOUR,
    },
    groups: [
      {
        type: Schema.Types.ObjectId,
      },
    ],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
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
