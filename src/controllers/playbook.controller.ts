import type { Response } from 'express';
import { Playbook } from '../models/Playbook.model.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

// Create new playbook
export const createPlaybook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, formData, generatedContent } = req.body;

    const playbook = new Playbook({
      createdBy: req.user?.userId,
      title,
      formData,
      generatedContent,
    });

    await playbook.save();

    res.status(201).json({
      success: true,
      message: 'Playbook created successfully',
      playbook,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to create playbook',
      error: error.message,
    });
  }
};

// Get all playbooks for logged-in user
export const getPlaybooks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const playbooks = await Playbook.find({ createdBy: req.user?.userId })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.status(200).json({
      success: true,
      count: playbooks.length,
      playbooks,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch playbooks',
      error: error.message,
    });
  }
};

// Get single playbook by ID
export const getPlaybookById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const playbook = await Playbook.findById(id);

    if (!playbook) {
      res.status(404).json({
        success: false,
        message: 'Playbook not found',
      });
      return;
    }

    // Check if user owns this playbook
    if (playbook.createdBy.toString() !== req.user?.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to access this playbook',
      });
      return;
    }

    res.status(200).json({
      success: true,
      playbook,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch playbook',
      error: error.message,
    });
  }
};

// Update playbook
export const updatePlaybook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const playbook = await Playbook.findById(id);

    if (!playbook) {
      res.status(404).json({
        success: false,
        message: 'Playbook not found',
      });
      return;
    }

    // Check if user owns this playbook
    if (playbook.createdBy.toString() !== req.user?.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to update this playbook',
      });
      return;
    }

    const updatedPlaybook = await Playbook.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Playbook updated successfully',
      playbook: updatedPlaybook,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to update playbook',
      error: error.message,
    });
  }
};

// Delete playbook
export const deletePlaybook = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const playbook = await Playbook.findById(id);

    if (!playbook) {
      res.status(404).json({
        success: false,
        message: 'Playbook not found',
      });
      return;
    }

    // Check if user owns this playbook
    if (playbook.createdBy.toString() !== req.user?.userId) {
      res.status(403).json({
        success: false,
        message: 'Not authorized to delete this playbook',
      });
      return;
    }

    await Playbook.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Playbook deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete playbook',
      error: error.message,
    });
  }
};
