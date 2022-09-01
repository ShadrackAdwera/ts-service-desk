import { Roles } from '@adwesh/service-desk';
import { Schema, Model, Document, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface UserDoc extends Document {
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  tokenExpirationDate?: Date;
  roles: string[];
  version: number;
}

interface UserModel extends Model<UserDoc> {
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  tokenExpirationDate?: Date;
  roles: string[];
}

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, min: 6 },
    // group: { type: Schema.Types.ObjectId, required: true, ref: 'group' }, might change this to also include the group a user belongs to
    resetToken: { type: String },
    tokenExpirationDate: { type: Date },
    roles: [{ type: String, enum: Object.values(Roles), default: Roles.USER }],
  },
  { timestamps: true, toJSON: { getters: true } }
);

userSchema.set('versionKey', 'version');
userSchema.plugin(updateIfCurrentPlugin);

const User = model<UserDoc, UserModel>('user', userSchema);

export { User };
