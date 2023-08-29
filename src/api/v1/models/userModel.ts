import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  firstname: { type: String },
  lastname: { type: String },
  password: { type: String },
  role: { type: String, default: 'user' },
  email: { type: String },
});

export const User = mongoose.model('User', userSchema);
