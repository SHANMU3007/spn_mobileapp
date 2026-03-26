import { Router, Response } from 'express';
import Vehicle from '../models/Vehicle';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const vehicles = await Vehicle.find().sort({ licenseNumber: 1 });
  res.json(vehicles);
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) { res.status(404).json({ message: 'Vehicle not found' }); return; }
  res.json(vehicle);
});

router.post('/', async (_req: AuthRequest, res: Response) => {
  try {
    const vehicle = await Vehicle.create(_req.body);
    res.status(201).json(vehicle);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) { res.status(404).json({ message: 'Vehicle not found' }); return; }
    res.json(vehicle);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
  if (!vehicle) { res.status(404).json({ message: 'Vehicle not found' }); return; }
  res.json({ message: 'Vehicle deleted' });
});

export default router;
