import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  hashedPassword: string;
  role: 'freelancer' | 'viewer';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    role: { type: String, enum: ['freelancer', 'viewer'], default: 'viewer' },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
