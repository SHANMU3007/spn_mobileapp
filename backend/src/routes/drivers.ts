import { Router, Response } from 'express';
import Driver from '../models/Driver';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const drivers = await Driver.find().sort({ name: 1 });
  res.json(drivers);
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const driver = await Driver.findById(req.params.id);
  if (!driver) { res.status(404).json({ message: 'Driver not found' }); return; }
  res.json(driver);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const driver = await Driver.create(req.body);
    res.status(201).json(driver);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!driver) { res.status(404).json({ message: 'Driver not found' }); return; }
    res.json(driver);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const driver = await Driver.findByIdAndDelete(req.params.id);
  if (!driver) { res.status(404).json({ message: 'Driver not found' }); return; }
  res.json({ message: 'Driver deleted' });
});

export default router;
