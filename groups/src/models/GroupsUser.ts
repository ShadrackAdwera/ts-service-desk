import { Document, Model, Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface GroupDoc extends Document {
  title: string;
  createdBy: string;
  users: string[];
  version: number;
}

interface GroupModel extends Model<GroupDoc> {
  title: string;
  createdBy: string;
  users: string[];
}

interface UserDoc extends Document {
  userId: string;
  email: string;
  version: number;
}

interface UserModel extends Model<UserDoc> {
  userId: string;
  email: string;
}

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const userSchema = new Schema(
  {
    userId: { type: String, required: true },
    email: { type: String, required: true },
  },
  { timestamps: true, toJSON: { getters: true } }
);

groupSchema.set('versionKey', 'version');
groupSchema.plugin(updateIfCurrentPlugin);
userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);

const Group = model<GroupDoc, GroupModel>('Group', groupSchema);
const User = model<UserDoc, UserModel>('User', userSchema);

export { Group };
export { User };
