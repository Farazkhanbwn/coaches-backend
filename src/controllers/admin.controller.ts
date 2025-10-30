import type { Response } from 'express';
import crypto from 'crypto';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { sendCoachInvitationEmail } from '../utils/email.util.js';

export const addCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { name, ownerName, ownerEmail, status } = req.body;

    if (!name || !ownerName || !ownerEmail) {
      return res.status(400).json({ message: 'Company name, owner name, and owner email are required' });
    }

    // Normalize status to lowercase
    const normalizedStatus = status ? status.toLowerCase() : 'pending';

    // Check if company with this email already exists
    const existingCompany = await Company.findOne({ ownerEmail });
    if (existingCompany) {
      return res.status(400).json({ message: 'Company with this owner email already exists' });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email: ownerEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');

    // Create company
    const company = new Company({
      name,
      ownerName,
      ownerEmail,
      status: normalizedStatus
    });

    await company.save();

    // Create coach user (without password initially)
    const coach = new User({
      name: ownerName,
      email: ownerEmail,
      role: 'coach',
      companyId: company._id,
      companyName: name,
      isEmailVerified: false,
      invitationToken: hashedToken,
      invitationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    await coach.save();

    // Update company with ownerId
    company.ownerId = coach._id as any;
    await company.save();

    // Send invitation email
    try {
      await sendCoachInvitationEmail(ownerEmail, ownerName, name, invitationToken);
    } catch (emailError) {
      // If email fails, delete the company and coach
      await Company.deleteOne({ _id: company._id });
      await User.deleteOne({ _id: coach._id });
      return res.status(500).json({ message: 'Failed to send invitation email. Please try again.' });
    }

    res.status(201).json({
      message: 'Company created successfully! Coach invitation sent.',
      company: { id: company._id, name: company.name, ownerName: company.ownerName, ownerEmail: company.ownerEmail, status: company.status }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getCompanies = async (req: AuthRequest, res: Response) => {
  try {
    const companies = await Company.find()
      .populate('ownerId', 'name email isEmailVerified')
      .sort({ createdAt: -1 });

    // Get rep count for each company
    const companiesWithRepCount = await Promise.all(
      companies.map(async (company) => {
        const repCount = await User.countDocuments({ companyId: company._id, role: 'sales' });
        return {
          id: company._id,
          name: company.name,
          ownerName: company.ownerName,
          ownerEmail: company.ownerEmail,
          status: company.status,
          repCount,
          createdAt: company.createdAt
        };
      })
    );

    res.json({
      success: true,
      companies: companiesWithRepCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId } = req.params;
    const { name, ownerName, ownerEmail, status } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update company
    if (name) company.name = name;
    if (ownerName) company.ownerName = ownerName;
    if (ownerEmail) company.ownerEmail = ownerEmail;
    if (status) company.status = status.toLowerCase() as 'active' | 'inactive' | 'pending';

    await company.save();

    // Update coach user if owner details changed
    if (company.ownerId) {
      const coach = await User.findById(company.ownerId);
      if (coach) {
        if (ownerName) coach.name = ownerName;
        if (ownerEmail) coach.email = ownerEmail;
        if (name) coach.companyName = name;
        await coach.save();
      }
    }

    res.json({ message: 'Company updated successfully', company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteCompany = async (req: AuthRequest, res: Response) => {
  try {
    const { companyId } = req.params;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Delete all users (coach + reps) associated with this company
    await User.deleteMany({ companyId });

    // Delete company
    await Company.deleteOne({ _id: companyId });

    res.json({ message: 'Company and all associated users deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
