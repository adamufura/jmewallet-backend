import mongoose, { Schema } from 'mongoose';

export interface IUserStatement extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  earnings: number;
  spending: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userStatementSchema = new Schema<IUserStatement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    earnings: {
      type: Number,
      required: [true, 'Earnings is required'],
      default: 0,
      min: [0, 'Earnings cannot be negative'],
    },
    spending: {
      type: Number,
      required: [true, 'Spending is required'],
      default: 0,
      min: [0, 'Spending cannot be negative'],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries - one entry per user per date
userStatementSchema.index({ userId: 1, date: 1 }, { unique: true });
userStatementSchema.index({ userId: 1, createdAt: -1 });

const UserStatement = mongoose.model<IUserStatement>('UserStatement', userStatementSchema);

export default UserStatement;

