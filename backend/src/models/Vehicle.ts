import mongoose, { Document, Schema } from 'mongoose';

export interface IVehicle extends Document {
  licenseNumber: string;
  ownerName: string;
  chassisNumber: string;
  numberOfWheels: number;
  fcExpiryDate?: Date;
  insuranceExpiryDate?: Date;
  nationalPermitExpiryDate?: Date;
  oilServiceKm?: number;
  gearBoxOilKm?: number;
  crownOilKm?: number;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    licenseNumber:           { type: String, required: true, unique: true },
    ownerName:               { type: String, required: true },
    chassisNumber:           { type: String, required: true },
    numberOfWheels:          { type: Number, required: true },
    fcExpiryDate:            { type: Date },
    insuranceExpiryDate:     { type: Date },
    nationalPermitExpiryDate:{ type: Date },
    oilServiceKm:            { type: Number },
    gearBoxOilKm:            { type: Number },
    crownOilKm:              { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IVehicle>('Vehicle', VehicleSchema);
