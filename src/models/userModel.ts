import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  googleId: string;
  displayName: string;
  email: string;
  avatar: string;
}

const UserSchema: Schema = new Schema({
  googleId: { type: String, required: true },
  displayName: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String },
});

export default mongoose.model<IUser>('User', UserSchema);
