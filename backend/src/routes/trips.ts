import { Router, Response } from 'express';
import Trip from '../models/Trip';
import { protect, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect);

// GET /api/trips?page=1&limit=10&status=draft
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total = await Trip.countDocuments(filter);
    const trips = await Trip.find(filter)
      .populate('vehicle', 'licenseNumber ownerName')
      .populate('driver1', 'name')
      .populate('driver2', 'name')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    res.json({
      data: trips,
      pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const trip = await Trip.findById(req.params.id)
    .populate('vehicle', 'licenseNumber ownerName')
    .populate('driver1', 'name')
    .populate('driver2', 'name')
    .populate('completedBy', 'name email');
  if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
  res.json(trip);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const trip = await Trip.create(req.body);
    res.status(201).json(trip);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('vehicle', 'licenseNumber ownerName')
      .populate('driver1', 'name')
      .populate('driver2', 'name');
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    res.json(trip);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH /api/trips/:id/complete
router.patch('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status: 'completed', completedAt: new Date(), completedBy: req.user!.id },
      { new: true }
    );
    if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
    res.json(trip);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const trip = await Trip.findByIdAndDelete(req.params.id);
  if (!trip) { res.status(404).json({ message: 'Trip not found' }); return; }
  res.json({ message: 'Trip deleted' });
});

export default router;
