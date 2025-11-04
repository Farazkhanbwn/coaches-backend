import type { Response } from 'express';
import crypto from 'crypto';
import User from '../models/User.model.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { sendRepInvitationEmail } from '../utils/email.util.js';

export const addRep = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone } = req.body;
    const coachId = req.user?.userId;

    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Get coach details
    const coach = await User.findById(coachId);
    if (!coach || coach.role !== 'coach') {
      return res.status(403).json({ message: 'Only coaches can add reps' });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');

    // Create rep user (without password initially)
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
      invitationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      subscription: {
        plan: 'Free',
        status: 'Trial',
        billingCycle: 'Monthly',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
      }
    });

    await rep.save();

    // Send invitation email
    try {
      await sendRepInvitationEmail(email, name, coach.companyName || coach.name, invitationToken);
    } catch (emailError) {
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
