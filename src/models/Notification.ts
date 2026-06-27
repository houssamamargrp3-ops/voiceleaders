import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INotification extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'like' | 'comment' | 'challenge_win' | 'system';
  senderId?: mongoose.Types.ObjectId;
  senderName?: string;
  senderAvatar?: string;
  postId?: mongoose.Types.ObjectId;
  text: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['like', 'comment', 'challenge_win', 'system'], required: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    senderName: { type: String },
    senderAvatar: { type: String },
    postId: { type: Schema.Types.ObjectId, ref: 'Post' },
    text: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, index: -1 }
  }
);

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
