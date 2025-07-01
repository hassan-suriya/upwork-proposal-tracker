import mongoose, { Schema } from 'mongoose';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  hashedPassword: string;
  role: 'freelancer' | 'viewer';
  settings?: {
    weeklyTarget?: number;
    defaultView?: 'list' | 'grid' | 'calendar';
    currency?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String },
    hashedPassword: { type: String, required: true },
    role: { type: String, enum: ['freelancer', 'viewer'], default: 'freelancer' },
    settings: {
      weeklyTarget: { type: Number, default: 10 },
      defaultView: { type: String, enum: ['list', 'grid', 'calendar'], default: 'list' },
      currency: { type: String, default: 'USD' }
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
