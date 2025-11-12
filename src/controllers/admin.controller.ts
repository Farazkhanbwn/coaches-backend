import type { Response } from 'express';
import crypto from 'crypto';
import Company from '../models/Company.model.js';
import User from '../models/User.model.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';
import { sendCoachInvitationEmail, sendRepInvitationEmail, sendAccountSuspendedEmail, sendAccountActivatedEmail } from '../utils/email.util.js';

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
      invitationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      subscription: {
        plan: 'Free',
        status: 'Trial',
        billingCycle: 'Monthly',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days trial
      }
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
          ownerId: company.ownerId,
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

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({ role: { $in: ['coach', 'sales'] } })
      .select('-password -emailVerificationToken -resetPasswordToken')
      .sort({ lastLoginAt: -1, createdAt: -1 });

    // Check and update expired trials/subscriptions
    const now = new Date();
    const updatedUsers = await Promise.all(
      users.map(async (user) => {
        if (user.subscription?.nextBillingDate && 
            (user.subscription.status === 'Active' || user.subscription.status === 'Trial')) {
          const billingDate = new Date(user.subscription.nextBillingDate);
          if (now > billingDate) {
            // If trial expired, downgrade to Free plan and set status to Inactive
            if (user.subscription.status === 'Trial') {
              user.subscription.plan = 'Free';
              user.subscription.status = 'Inactive';
            } else {
              // If paid subscription expired, just set status to Inactive
              user.subscription.status = 'Inactive';
            }
            await user.save();
          }
        }
        return user;
      })
    );

    res.status(200).json({ success: true, users: updatedUsers });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, userType, companyId, role, status } = req.body;

    if (!name || !email || !userType || !role) {
      return res.status(400).json({ message: 'Name, email, user type, and role are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const invitationToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(invitationToken).digest('hex');

    const userRole = role === 'Coach/Team Lead' ? 'coach' : role === 'User' ? 'sales' : 'sales';

    const userData: any = {
      name,
      email,
      role: userRole,
      isEmailVerified: false,
      invitationToken: hashedToken,
      invitationExpires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subscription: {
        plan: 'Free',
        status: status || 'Trial',
        billingCycle: 'Monthly',
        startDate: new Date(),
        nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    };

    if (userType === 'company' && companyId) {
      const company = await Company.findById(companyId);
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
      userData.companyId = companyId;
      userData.companyName = company.name;
      
      // If creating a sales user, set the coachId to the company owner
      if (userRole === 'sales' && company.ownerId) {
        userData.coachId = company.ownerId;
      }
    }

    const user = new User(userData);
    await user.save();

    try {
      if (userRole === 'coach') {
        await sendCoachInvitationEmail(email, name, userData.companyName || 'Individual', invitationToken);
      } else {
        await sendRepInvitationEmail(email, name, userData.companyName || 'Individual', invitationToken);
      }
    } catch (emailError) {
      await User.deleteOne({ _id: user._id });
      return res.status(500).json({ message: 'Failed to send invitation email' });
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, email, role, status } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldStatus = user.subscription?.status;

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) {
      user.role = role === 'Coach' || role === 'Coach/Team Lead' ? 'coach' : 'sales';
    }
    if (status && user.subscription) {
      user.subscription.status = status;
    }

    await user.save();

    // Send email if status changed to Inactive or Active
    if (status && oldStatus !== status) {
      try {
        if (status === 'Inactive') {
          await sendAccountSuspendedEmail(user.email, user.name);
        } else if (status === 'Active' && oldStatus === 'Inactive') {
          await sendAccountActivatedEmail(user.email, user.name);
        }
      } catch (emailError) {
        console.error('Failed to send status change email:', emailError);
      }
    }

    res.status(200).json({ success: true, message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await User.deleteOne({ _id: userId });

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete user' });
  }
};

export const sendUpgradeLink = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { plan, billingCycle } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Determine Stripe price ID based on plan and billing cycle
    let priceId: string;
    if (plan === 'Pro') {
      priceId = billingCycle === 'Yearly' 
        ? process.env.STRIPE_PRO_YEARLY_PRICE_ID!
        : process.env.STRIPE_PRO_PLAN_PRICE_ID!;
    } else if (plan === 'Enterprise') {
      priceId = billingCycle === 'Yearly'
        ? process.env.STRIPE_TEAM_YEARLY_PRICE_ID!
        : process.env.STRIPE_TEAM_PLAN_PRICE_ID!;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid plan' });
    }

    if (!priceId) {
      return res.status(400).json({ success: false, message: 'Stripe price ID not configured' });
    }

    // Create Stripe checkout session
    const stripe = (await import('../services/stripe.service.js')).default;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
      metadata: {
        userId: String(userId),
        planType: plan,
        billingCycle: billingCycle,
        upgradedByAdmin: 'true'
      },
    });

    if (!session.url) {
      return res.status(500).json({ success: false, message: 'Failed to create payment session' });
    }

    // Send email with payment link
    const { sendUpgradeEmail } = await import('../utils/email.util.js');
    await sendUpgradeEmail(user.email, user.name, plan, billingCycle, session.url);

    res.status(200).json({ 
      success: true, 
      message: 'Upgrade link sent to user email',
      paymentUrl: session.url 
    });
  } catch (error) {
    console.error('Send upgrade link error:', error);
    res.status(500).json({ success: false, message: 'Failed to send upgrade link' });
  }
};

export const updateUserSubscription = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { plan, status, billingCycle, nextBillingDate } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const subscriptionData: any = {
      plan,
      status, 
      billingCycle,
      startDate: user.subscription?.startDate || new Date(),
      lastUpdatedBy: req.user?.userId,
      lastUpdatedAt: new Date()
    };

    if (nextBillingDate) {
      subscriptionData.nextBillingDate = new Date(nextBillingDate);
    }

    user.subscription = subscriptionData;
    await user.save();

    const updatedUser = await User.findById(userId).select('-password');
    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ success: false, message: 'Failed to update subscription' });
  }
};
