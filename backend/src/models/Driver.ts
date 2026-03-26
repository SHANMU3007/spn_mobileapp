import mongoose, { Document, Schema } from 'mongoose';

export interface IDriver extends Document {
  name: string;
  phone: string;
  licenseNumber?: string;
  address?: string;
}

const DriverSchema = new Schema<IDriver>(
  {
    name:          { type: String, required: true },
    phone:         { type: String, required: true },
    licenseNumber: { type: String },
    address:       { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IDriver>('Driver', DriverSchema);
