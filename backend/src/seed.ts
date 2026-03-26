import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User';

const seed = async () => {
    const uri = process.env.MONGO_URI;
    if (!uri) { console.error('MONGO_URI not set'); process.exit(1); }

    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const existing = await User.findOne({ role: 'admin' });
    if (existing) {
        console.log('⚠️  Admin already exists:', existing.email);
        console.log('   Password: admin123 (if you used seed before)');
        await mongoose.disconnect();
        return;
    }

    await User.create({
        name: 'Admin',
        email: 'admin@spn.com',
        password: 'admin123',
        role: 'admin',
    });

    console.log('✅ Admin user created!');
    console.log('   Email:    admin@spn.com');
    console.log('   Password: admin123');
    await mongoose.disconnect();
};

seed().catch((e) => { console.error(e); process.exit(1); });
