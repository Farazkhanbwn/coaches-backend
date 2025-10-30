import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';

dotenv.config();

const deleteAllCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ MongoDB connected');

    // Delete all companies
    const companiesResult = await Company.deleteMany({});
    console.log(`🗑️  Deleted ${companiesResult.deletedCount} companies`);

    // Delete all coach users
    const coachesResult = await User.deleteMany({ role: 'coach' });
    console.log(`🗑️  Deleted ${coachesResult.deletedCount} coaches`);

    // Delete all sales reps
    const repsResult = await User.deleteMany({ role: 'sales' });
    console.log(`🗑️  Deleted ${repsResult.deletedCount} sales reps`);

    console.log('✅ All companies and users deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

deleteAllCompanies();
