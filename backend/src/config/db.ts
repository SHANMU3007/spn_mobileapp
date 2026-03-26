import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/spn_db';
  await mongoose.connect(uri);
  console.log('MongoDB connected');
};
