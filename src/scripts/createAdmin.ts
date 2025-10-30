import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.model.js';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('MongoDB connected');

    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      name: 'Admin User',
      email: 'admin@woodward.com',
      password: hashedPassword,
      role: 'admin',
      isEmailVerified: true
    });

    await admin.save();
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@woodward.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error: any) {
    if (error.code === 11000) {
      console.log('⚠️ Admin user already exists!');
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
};

createAdmin();
