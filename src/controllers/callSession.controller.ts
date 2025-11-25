import CallSession from '../models/CallSession.model.js';

// Save call session
export const saveCallSession = async (req: any, res: any) => {
  try {
    const { callType, callGoal, voiceUsed, duration, transcript, feedback, sessionId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const callSession = new CallSession({
      userId,
      callType,
      callGoal,
      voiceUsed,
      duration,
      transcript,
      feedback,
      sessionId,
    });

    await callSession.save();

    res.status(201).json({
      success: true,
      message: 'Call session saved successfully',
      session: callSession,
    });
  } catch (error: any) {
    console.error('Error saving call session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's call sessions
export const getCallSessions = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const { limit = 10, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const sessions = await CallSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await CallSession.countDocuments({ userId });

    res.json({
      success: true,
      sessions,
      total,
    });
  } catch (error: any) {
    console.error('Error fetching call sessions:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats
export const getDashboardStats = async (req: any, res: any) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    // Total sessions
    const totalSessions = await CallSession.countDocuments({ userId });

    // Average score
    const scoreAgg = await CallSession.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$feedback.overallScore' },
        },
      },
    ]);
    const averageScore = scoreAgg.length > 0 ? scoreAgg[0].avgScore : 0;

    // Total practice time (in hours)
    const timeAgg = await CallSession.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: null,
          totalSeconds: { $sum: '$duration' },
        },
      },
    ]);
    const totalSeconds = timeAgg.length > 0 ? timeAgg[0].totalSeconds : 0;
    const totalHours = (totalSeconds / 3600).toFixed(1);

    // Recent sessions (last 5)
    const recentSessions = await CallSession.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('callType feedback.overallScore createdAt duration');

    res.json({
      success: true,
      stats: {
        totalSessions,
        averageScore: averageScore.toFixed(1),
        totalHours,
        recentSessions,
      },
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single session by ID
export const getSessionById = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const session = await CallSession.findOne({ _id: id, userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete session
export const deleteSession = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const session = await CallSession.findOneAndDelete({ _id: id, userId });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found' });
    }

    res.json({
      success: true,
      message: 'Session deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting session:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
