import { Roles } from '@adwesh/service-desk';
import { Schema, Document, model } from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface IUserDoc extends Document {
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  tokenExpirationDate?: Date;
  role: Roles;
  version: number;
}

interface IUserSchema extends Schema<IUserDoc> {
  username: string;
  email: string;
  password: string;
  resetToken?: string;
  tokenExpirationDate?: Date;
  role: Roles;
}

const userSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    resetToken: { type: String },
    tokenExpirationDate: { type: Date },
  },
  { timestamps: true, toJSON: { getters: true } }
);

userSchema.plugin(updateIfCurrentPlugin);
const User = model<IUserDoc, IUserSchema>('user', userSchema);
export { User };
