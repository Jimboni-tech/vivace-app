const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PracticeSession = require('../models/practiceSession.js');
const User = require('../models/user.js');
const logger = require('../utils/logger.js');

// Get all practice sessions for a user
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const { page = 1, limit = 20, status, instrument, startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    if (status) query.status = status;
    if (instrument) query.instrument = instrument;
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    
    const sessions = await PracticeSession.find(query)
      .sort({ startTime: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('pieces.title', 'title composer')
      .populate('exercises.name', 'name type');
    
    const total = await PracticeSession.countDocuments(query);
    
    logger.logPerformance('Get Practice Sessions', Date.now() - startTime, {
      userId: req.user._id,
      count: sessions.length
    });
    
    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    logger.error('Error getting practice sessions:', error);
    res.status(500).json({ message: 'Error retrieving practice sessions' });
  }
});

// Get a specific practice session
router.get('/:id', async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    }).populate('pieces.title', 'title composer');
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    res.json(session);
  } catch (error) {
    logger.error('Error getting practice session:', error);
    res.status(500).json({ message: 'Error retrieving practice session' });
  }
});

// Create a new practice session
router.post('/', [
  body('instrument').notEmpty().withMessage('Instrument is required'),
  body('title').optional().isLength({ max: 100 }).withMessage('Title too long'),
  body('notes').optional().isString().isLength({ max: 2000 }),
  body('recordings').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }
    const sessionData = {
      user: req.user._id,
      instrument: req.body.instrument,
      title: req.body.title || 'Practice Session',
      notes: req.body.notes || '',
      recordings: req.body.recordings || []
    };
    const session = new PracticeSession(sessionData);
    await session.save();
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalSessions': 1 },
      $set: { 'stats.lastPracticeDate': new Date() }
    });
    res.status(201).json(session);
  } catch (error) {
    logger.error('Error creating practice session:', error);
    res.status(500).json({ message: 'Error creating practice session' });
  }
});

// Update a practice session
router.put('/:id', [
  body('title').optional().isLength({ max: 100 }).withMessage('Title too long'),
  body('instrument').optional().isString(),
  body('notes').optional().isString().isLength({ max: 2000 }),
  body('recordings').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation error', errors: errors.array() });
    }
    const updateFields = {};
    if (req.body.title) updateFields.title = req.body.title;
    if (req.body.instrument) updateFields.instrument = req.body.instrument;
    if (req.body.notes !== undefined) updateFields.notes = req.body.notes;
    if (req.body.recordings !== undefined) updateFields.recordings = req.body.recordings;
    const session = await PracticeSession.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updateFields },
      { new: true, runValidators: true }
    );
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    res.json(session);
  } catch (error) {
    logger.error('Error updating practice session:', error);
    res.status(500).json({ message: 'Error updating practice session' });
  }
});

// Complete a practice session
router.patch('/:id/complete', [
  body('endTime').optional().isISO8601().withMessage('Invalid end time'),
  body('duration').optional().isNumeric().withMessage('Duration must be a number'),
  body('metrics').optional().isObject(),
  body('notes.postSession').optional().isLength({ max: 1000 }).withMessage('Post-session notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const startTime = Date.now();
    
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Session already completed' });
    }
    
    // Complete the session
    session.completeSession();
    
    // Update with additional data
    if (req.body.endTime) session.endTime = new Date(req.body.endTime);
    if (req.body.duration) session.duration = req.body.duration;
    if (req.body.metrics) session.metrics = { ...session.metrics, ...req.body.metrics };
    if (req.body.notes) session.notes = { ...session.notes, ...req.body.notes };
    
    await session.save();
    
    // Update user stats
    const user = await User.findById(req.user._id);
    const xpGained = Math.floor(session.duration / 5); // 1 XP per 5 minutes
    
    const levelUpResult = user.addXP(xpGained);
    user.stats.totalPracticeTime += session.duration;
    user.stats.averageSessionLength = Math.round(
      (user.stats.totalPracticeTime / user.stats.totalSessions)
    );
    user.updateStreak();
    
    await user.save();
    
    logger.logPerformance('Complete Practice Session', Date.now() - startTime, {
      userId: req.user._id,
      sessionId: session._id,
      duration: session.duration,
      xpGained
    });
    
    logger.logBusiness('Practice Session Completed', req.user._id, {
      sessionId: session._id,
      duration: session.duration,
      xpGained,
      leveledUp: levelUpResult.leveledUp
    });
    
    res.json({
      session,
      xpGained,
      leveledUp: levelUpResult.leveledUp,
      newLevel: levelUpResult.newLevel,
      newStreak: user.stats.currentStreak
    });
  } catch (error) {
    logger.error('Error completing practice session:', error);
    res.status(500).json({ message: 'Error completing practice session' });
  }
});

// Pause a practice session
router.patch('/:id/pause', async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    session.pauseSession();
    await session.save();
    
    logger.logBusiness('Practice Session Paused', req.user._id, {
      sessionId: session._id
    });
    
    res.json(session);
  } catch (error) {
    logger.error('Error pausing practice session:', error);
    res.status(500).json({ message: 'Error pausing practice session' });
  }
});

// Resume a practice session
router.patch('/:id/resume', async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    session.resumeSession();
    await session.save();
    
    logger.logBusiness('Practice Session Resumed', req.user._id, {
      sessionId: session._id
    });
    
    res.json(session);
  } catch (error) {
    logger.error('Error resuming practice session:', error);
    res.status(500).json({ message: 'Error resuming practice session' });
  }
});

// Add piece to session
router.post('/:id/pieces', [
  body('title').notEmpty().withMessage('Piece title is required'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    session.addPiece(req.body);
    await session.save();
    
    res.json(session);
  } catch (error) {
    logger.error('Error adding piece to session:', error);
    res.status(500).json({ message: 'Error adding piece to session' });
  }
});

// Add exercise to session
router.post('/:id/exercises', [
  body('name').notEmpty().withMessage('Exercise name is required'),
  body('type').isIn(['scales', 'arpeggios', 'etudes', 'technique', 'other']).withMessage('Invalid exercise type'),
  body('timeSpent').optional().isNumeric().withMessage('Time spent must be a number'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    session.addExercise(req.body);
    await session.save();
    
    res.json(session);
  } catch (error) {
    logger.error('Error adding exercise to session:', error);
    res.status(500).json({ message: 'Error adding exercise to session' });
  }
});

// Add goal to session
router.post('/:id/goals', [
  body('description').notEmpty().withMessage('Goal description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    session.addGoal(req.body);
    await session.save();
    
    res.json(session);
  } catch (error) {
    logger.error('Error adding goal to session:', error);
    res.status(500).json({ message: 'Error adding goal to session' });
  }
});

// Complete a goal
router.patch('/:id/goals/:goalIndex/complete', async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    const goalIndex = parseInt(req.params.goalIndex);
    if (goalIndex < 0 || goalIndex >= session.goals.length) {
      return res.status(400).json({ message: 'Invalid goal index' });
    }
    
    session.completeGoal(goalIndex);
    await session.save();
    
    res.json(session);
  } catch (error) {
    logger.error('Error completing goal:', error);
    res.status(500).json({ message: 'Error completing goal' });
  }
});

// Delete a practice session
router.delete('/:id', async (req, res) => {
  try {
    const session = await PracticeSession.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    // Update user stats if session was completed
    if (session.status === 'completed' && session.duration) {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 
          'stats.totalSessions': -1,
          'stats.totalPracticeTime': -session.duration
        }
      });
    }
    
    logger.logBusiness('Practice Session Deleted', req.user._id, {
      sessionId: session._id
    });
    
    res.json({ message: 'Practice session deleted successfully' });
  } catch (error) {
    logger.error('Error deleting practice session:', error);
    res.status(500).json({ message: 'Error deleting practice session' });
  }
});

// Get practice statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const { timeframe = 'month' } = req.query;
    
    const stats = await PracticeSession.getUserStats(req.user._id, timeframe);
    
    // Get additional stats
    const totalSessions = await PracticeSession.countDocuments({ user: req.user._id });
    const totalTime = await PracticeSession.aggregate([
      { $match: { user: req.user._id, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$duration' } } }
    ]);
    
    const response = {
      timeframe,
      totalSessions,
      totalTime: totalTime[0]?.total || 0,
      ...stats
    };
    
    logger.logPerformance('Get Practice Stats', Date.now() - startTime, {
      userId: req.user._id,
      timeframe
    });
    
    res.json(response);
  } catch (error) {
    logger.error('Error getting practice statistics:', error);
    res.status(500).json({ message: 'Error retrieving practice statistics' });
  }
});

module.exports = router;
