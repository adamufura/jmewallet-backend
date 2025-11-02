import mongoose, { Schema } from 'mongoose';

export interface IUserEbook extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const userEbookSchema = new Schema<IUserEbook>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
      maxlength: [50000, 'Content cannot exceed 50000 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
userEbookSchema.index({ userId: 1, createdAt: -1 });

const UserEbook = mongoose.model<IUserEbook>('UserEbook', userEbookSchema);

export default UserEbook;

