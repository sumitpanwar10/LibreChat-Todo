import { Schema } from 'mongoose';
import { ITodo } from '~/types';

const todoSchema: Schema<ITodo> = new Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 255,
      trim: true,
    },
    description: {
      type: String,
      maxlength: 1000,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
      required: true,
    },
    user: {
      type: String,
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

// Create compound index for efficient querying
todoSchema.index({ user: 1, status: 1 });
todoSchema.index({ user: 1, createdAt: -1 });

export default todoSchema;
