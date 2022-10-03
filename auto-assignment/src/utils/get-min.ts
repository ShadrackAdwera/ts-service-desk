import { Types } from 'mongoose';
import { UserDoc } from '../models/Replicas';

export interface IAgentAssigned {
  id: string;
  timeAssigned: number;
}

export const getMinAgent = (
  agents: (UserDoc & {
    _id: Types.ObjectId;
  })[]
):
  | UserDoc & {
      _id: Types.ObjectId;
    } => {
  return agents.reduce((prev, curr) =>
    prev.timeAssigned < curr.timeAssigned ? prev : curr
  );
};
