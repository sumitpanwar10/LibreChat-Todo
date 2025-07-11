import type { Document } from 'mongoose';

export interface ITodo extends Document {
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  user: string;
  createdAt?: Date;
  updatedAt?: Date;
}
