import mongoose, { Document, Schema } from 'mongoose';

const TripSegmentSchema = new Schema({
  date:           { type: String, required: true },
  from:           { type: String, required: true },
  to:             { type: String, required: true },
  office:         { type: String, required: true },
  loadType:       { type: String, required: true },
  tonnage:        { type: Number, default: 0 },
  hireAmount:     { type: Number, default: 0 },
  loadingCharge:  { type: Number, default: 0 },
  unloadingCharge:{ type: Number, default: 0 },
}, { _id: false });

const DieselEntrySchema = new Schema({
  date:     { type: String, required: true },
  quantity: { type: Number, default: 0 },
  amount:   { type: Number, default: 0 },
}, { _id: false });

const ExpenseEntrySchema = new Schema({
  type:        { type: String, enum: ['rto','police','toll','fastag','other'], required: true },
  description: { type: String },
  amount:      { type: Number, default: 0 },
  direction:   { type: String },
  city:        { type: String },
}, { _id: false });

const TransactionEntrySchema = new Schema({
  date:           { type: String, required: true },
  name:           { type: String, required: true },
  amountReceived: { type: Number, default: 0 },
}, { _id: false });

const CalculatedSchema = new Schema({
  totalKm:                  { type: Number, default: 0 },
  totalDieselLitres:        { type: Number, default: 0 },
  totalDieselAmount:        { type: Number, default: 0 },
  totalHire:                { type: Number, default: 0 },
  totalLoading:             { type: Number, default: 0 },
  totalUnloading:           { type: Number, default: 0 },
  totalExpenses:            { type: Number, default: 0 },
  totalTransactionsReceived:{ type: Number, default: 0 },
  totalCost:                { type: Number, default: 0 },
  mileage:                  { type: Number, default: 0 },
  balance:                  { type: Number, default: 0 },
}, { _id: false });

export interface ITrip extends Document {
  vehicle:        mongoose.Types.ObjectId;
  driver1:        mongoose.Types.ObjectId;
  driver2?:       mongoose.Types.ObjectId;
  advanceAmount:  number;
  startKm:        number;
  endKm:          number;
  totalKm:        number;
  status:         'draft' | 'submitted' | 'completed';
  tripSegments:   unknown[];
  dieselEntries:  unknown[];
  expenseEntries: unknown[];
  transactions:   unknown[];
  calculated:     unknown;
  completedAt?:   Date;
  completedBy?:   mongoose.Types.ObjectId;
}

const TripSchema = new Schema<ITrip>(
  {
    vehicle:       { type: Schema.Types.ObjectId, ref: 'Vehicle', required: true },
    driver1:       { type: Schema.Types.ObjectId, ref: 'Driver',  required: true },
    driver2:       { type: Schema.Types.ObjectId, ref: 'Driver' },
    advanceAmount: { type: Number, default: 0 },
    startKm:       { type: Number, default: 0 },
    endKm:         { type: Number, default: 0 },
    totalKm:       { type: Number, default: 0 },
    status:        { type: String, enum: ['draft','submitted','completed'], default: 'draft' },
    tripSegments:  [TripSegmentSchema],
    dieselEntries: [DieselEntrySchema],
    expenseEntries:[ExpenseEntrySchema],
    transactions:  [TransactionEntrySchema],
    calculated:    CalculatedSchema,
    completedAt:   { type: Date },
    completedBy:   { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model<ITrip>('Trip', TripSchema);
