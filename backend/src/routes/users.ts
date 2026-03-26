import { Router, Response } from 'express';
import User from '../models/User';
import { protect, adminOnly, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(protect, adminOnly);

router.get('/', async (_req: AuthRequest, res: Response) => {
  const users = await User.find().sort({ name: 1 });
  res.json(users);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.create({ ...req.body, role: 'manager' });
    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('+password');
    if (!user) { res.status(404).json({ message: 'User not found' }); return; }
    if (req.body.name)     user.name  = req.body.name;
    if (req.body.email)    user.email = req.body.email;
    if (req.body.password) user.password = req.body.password;
    await user.save();
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) { res.status(404).json({ message: 'User not found' }); return; }
  res.json({ message: 'User deleted' });
});

export default router;
