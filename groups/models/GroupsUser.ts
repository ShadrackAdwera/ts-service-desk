import { Document, Model, Schema, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Roles } from '@adwesh/service-desk';

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
    roles: string[];
    version: number;
  }
  
  interface UserModel extends Model<UserDoc> {
    userId: string;
    email: string;
    roles: string[];
  }

const groupSchema = new Schema(
  {
    title: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId },
    users: [{ type: Schema.Types.ObjectId, ref: 'user' }],
  },
  { timestamps: true, toJSON: { getters: true } }
);

const userSchema = new Schema(
    {
      userId: { type: String, required: true },
      email: { type: String, required: true },
      roles: [{ type: String, enum: Object.values(Roles), default: Roles.AGENT }],
    },
    { timestamps: true, toJSON: { getters: true } }
  );

groupSchema.set('versionKey', 'version');
groupSchema.plugin(updateIfCurrentPlugin);
userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);

const Group = model<GroupDoc, GroupModel>('group', groupSchema);
const User = model<UserDoc, UserModel>('user', userSchema);

export { Group };
export { User };
