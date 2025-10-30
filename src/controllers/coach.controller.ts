import type { Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.model.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { sendRepInvitationEmail } from '../utils/email.util.js';

export const addRep = async (req: AuthRequest, res: Response) => {
  try {
    console.log('🚀 addRep API called');
    const { name, email, phone } = req.body;
    const coachId = req.user?.userId;
    console.log('📝 Request data:', { name, email, phone, coachId });

    if (!name || !email) {
      console.log('❌ Validation failed: name or email missing');
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user already exists
    console.log('🔍 Checking if user exists...');
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    console.log('✅ User does not exist');

    // Get coach details
    console.log('👤 Fetching coach details...');
    const coach = await User.findById(coachId);
    if (!coach || coach.role !== 'coach') {
      console.log('❌ Coach not found or invalid role');
      return res.status(403).json({ message: 'Only coaches can add reps' });
    }
    console.log('✅ Coach found:', coach.name, coach.companyName);

    // Generate invitation token
    console.log('🔑 Generating invitation token...');
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');

    // Create rep user (without password initially)
    console.log('💾 Creating rep user...');
    const rep = new User({
      name,
      email,
      phone,
      role: 'sales',
      coachId,
      companyId: coach.companyId,
      companyName: coach.companyName,
      isEmailVerified: false,
      invitationToken: hashedToken,
      invitationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await rep.save();
    console.log('✅ Rep user created:', rep._id);

    // Send invitation email
    try {
      console.log('📧 Sending rep invitation to:', email);
      await sendRepInvitationEmail(email, name, coach.companyName || coach.name, invitationToken);
      console.log('✅ Rep invitation email sent successfully');
    } catch (emailError) {
      console.error('❌ Failed to send rep invitation email:', emailError);
      // If email fails, delete the rep
      await User.deleteOne({ _id: rep._id });
      return res.status(500).json({ message: 'Failed to send invitation email. Please try again.' });
    }

    res.status(201).json({
      message: 'Sales rep invited successfully! They will receive an email to set up their account.',
      rep: { id: rep._id, name: rep.name, email: rep.email, phone: rep.phone }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTeamMembers = async (req: AuthRequest, res: Response) => {
  try {
    const coachId = req.user?.userId;

    const teamMembers = await User.find({ coachId, role: 'sales' })
      .select('-password -emailVerificationToken -resetPasswordToken -invitationToken')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      teamMembers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const removeRep = async (req: AuthRequest, res: Response) => {
  try {
    const { repId } = req.params;
    const coachId = req.user?.userId;

    const rep = await User.findOne({ _id: repId, coachId, role: 'sales' });
    if (!rep) {
      return res.status(404).json({ message: 'Rep not found or unauthorized' });
    }

    await User.deleteOne({ _id: repId });

    res.json({ message: 'Rep removed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
