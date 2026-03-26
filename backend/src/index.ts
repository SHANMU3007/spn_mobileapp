import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';

import authRoutes    from './routes/auth';
import driverRoutes  from './routes/drivers';
import vehicleRoutes from './routes/vehicles';
import tripRoutes    from './routes/trips';
import userRoutes    from './routes/users';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth',     authRoutes);
app.use('/api/drivers',  driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips',    tripRoutes);
app.use('/api/users',    userRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });
