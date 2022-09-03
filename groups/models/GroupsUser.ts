import { Document, Model, Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface GroupDoc extends Document {
  title: string;
  agents: string[];
  version: number;
}

interface GroupModel extends Model<GroupDoc> {
  title: string;
  agents: string[];
}

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    agents: [{ type: Schema.Types.ObjectId }],
  },
  { timestamps: true, toJSON: { getters: true } }
);

groupSchema.set('versionKey', 'version');
groupSchema.plugin(updateIfCurrentPlugin);

const Group = model<GroupDoc, GroupModel>('group', groupSchema);

export { Group };
