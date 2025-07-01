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
    email: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    name: { type: String },
    hashedPassword: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['freelancer', 'viewer'], 
      default: 'freelancer' 
    },
    settings: {
      weeklyTarget: { type: Number, default: 10 },
      defaultView: { type: String, enum: ['list', 'grid', 'calendar'], default: 'list' },
      currency: { type: String, default: 'USD' }
    }
  },
  { 
    timestamps: true,
    // Add options to improve performance
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Create the model only if it doesn't exist to prevent overwriting
const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
