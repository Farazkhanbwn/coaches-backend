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

export const getTeamCallSessions = async (req: AuthRequest, res: Response) => {
  try {
    const coachId = req.user?.userId;
    const { dateFrom, dateTo, member, scenario, minScore, maxScore, page = '1', limit = '4' } = req.query;

    // Get all team members
    const teamMembers = await User.find({ coachId, role: 'sales' }).select('_id');
    const teamMemberIds = teamMembers.map(member => member._id);

    // Build filter query
    const filter: any = { userId: { $in: teamMemberIds } };

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom as string);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo as string);
    }

    if (member) {
      filter.userId = member;
    }

    if (scenario) {
      filter.callType = scenario;
    }

    if (minScore || maxScore) {
      filter['feedback.overallScore'] = {};
      if (minScore) filter['feedback.overallScore'].$gte = Number(minScore);
      if (maxScore) filter['feedback.overallScore'].$lte = Number(maxScore);
    }

    const CallSession = (await import('../models/CallSession.model.js')).default;
    
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;
    
    const [sessions, total] = await Promise.all([
      CallSession.find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      CallSession.countDocuments(filter)
    ]);

    res.json({
      success: true,
      sessions,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getTeamAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const coachId = req.user?.userId;

    // Get all team members
    const teamMembers = await User.find({ coachId, role: 'sales' }).select('_id name email');
    const teamMemberIds = teamMembers.map(m => m._id);

    // Get all their call sessions
    const CallSession = (await import('../models/CallSession.model.js')).default;
    const sessions = await CallSession.find({ userId: { $in: teamMemberIds } });

    // Calculate average score
    const avgScore = sessions.length > 0
      ? (sessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / sessions.length).toFixed(1)
      : '0';

    // Calculate this week sessions
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekSessions = sessions.filter(s => new Date(s.createdAt) > weekAgo).length;

    // Calculate top performers
    const memberStats = teamMembers.map(member => {
      const memberId = String(member._id);
      const memberSessions = sessions.filter(s => s.userId.toString() === memberId);
      const memberAvgScore = memberSessions.length > 0
        ? memberSessions.reduce((sum, s) => sum + (s.feedback?.overallScore || 0), 0) / memberSessions.length
        : 0;

      return {
        id: member._id,
        name: member.name,
        email: member.email,
        role: 'Sales Rep',
        score: Math.round(memberAvgScore),
        sessionCount: memberSessions.length,
        status: 'Active'
      };
    });

    const topPerformers = memberStats
      .filter(m => m.sessionCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    res.json({
      success: true,
      analytics: {
        avgScore,
        thisWeekSessions,
        topPerformers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
