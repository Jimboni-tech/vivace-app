const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Achievement = require('../models/achievement.js');
const User = require('../models/user.js');
const logger = require('../utils/logger.js');

// Get all achievements
router.get('/', async (req, res) => {
  try {
    const { category, rarity, includeHidden = false } = req.query;
    
    let query = {};
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    
    const achievements = await Achievement.find(query)
      .sort({ category: 1, rarity: 1, name: 1 });
    
    res.json(achievements);
  } catch (error) {
    logger.error('Error getting achievements:', error);
    res.status(500).json({ message: 'Error retrieving achievements' });
  }
});

// Get achievements by category
router.get('/category/:category', async (req, res) => {
  try {
    const achievements = await Achievement.getByCategory(req.params.category);
    res.json(achievements);
  } catch (error) {
    logger.error('Error getting achievements by category:', error);
    res.status(500).json({ message: 'Error retrieving achievements' });
  }
});

// Get achievements by rarity
router.get('/rarity/:rarity', async (req, res) => {
  try {
    const achievements = await Achievement.getByRarity(req.params.rarity);
    res.json(achievements);
  } catch (error) {
    logger.error('Error getting achievements by rarity:', error);
    res.status(500).json({ message: 'Error retrieving achievements' });
  }
});

// Get user's achievements
router.get('/user', async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('stats.achievements');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      achievements: user.stats.achievements,
      total: user.stats.achievements.length
    });
  } catch (error) {
    logger.error('Error getting user achievements:', error);
    res.status(500).json({ message: 'Error retrieving user achievements' });
  }
});

// Check if user qualifies for new achievements
router.post('/check', async (req, res) => {
  try {
    const startTime = Date.now();
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get all active achievements
    const achievements = await Achievement.getActive();
    
    const newlyUnlocked = [];
    
    for (const achievement of achievements) {
      // Check if user already has this achievement
      if (user.stats.achievements.includes(achievement._id)) {
        continue;
      }
      
      // Check if user qualifies
      if (achievement.checkQualification(user.stats)) {
        // Add achievement to user
        user.stats.achievements.push(achievement._id);
        
        // Calculate XP reward
        const xpReward = achievement.calculateXPReward();
        const levelUpResult = user.addXP(xpReward);
        
        newlyUnlocked.push({
          achievement: {
            id: achievement._id,
            name: achievement.name,
            description: achievement.description,
            icon: achievement.icon,
            color: achievement.color,
            rarity: achievement.rarity
          },
          xpReward,
          leveledUp: levelUpResult.leveledUp,
          newLevel: levelUpResult.newLevel
        });
      }
    }
    
    if (newlyUnlocked.length > 0) {
      await user.save();
      
      logger.logBusiness('Achievements Unlocked', req.user._id, {
        count: newlyUnlocked.length,
        achievements: newlyUnlocked.map(a => a.achievement.name)
      });
    }
    
    logger.logPerformance('Check Achievements', Date.now() - startTime, {
      userId: req.user._id,
      newlyUnlocked: newlyUnlocked.length
    });
    
    res.json({
      newlyUnlocked,
      total: newlyUnlocked.length,
      leveledUp: newlyUnlocked.some(a => a.leveledUp)
    });
  } catch (error) {
    logger.error('Error checking achievements:', error);
    res.status(500).json({ message: 'Error checking achievements' });
  }
});

// Get achievement progress for user
router.get('/progress', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const achievements = await Achievement.getActive();
    
    const progress = achievements.map(achievement => {
      const hasAchievement = user.stats.achievements.includes(achievement._id);
      const qualifies = achievement.checkQualification(user.stats);
      
      let progressPercentage = 0;
      let progressValue = 0;
      let targetValue = 0;
      
      switch (achievement.requirements.type) {
        case 'total_practice_time':
          progressValue = user.stats.totalPracticeTime;
          targetValue = achievement.requirements.threshold;
          break;
        case 'consecutive_days':
          progressValue = user.stats.currentStreak;
          targetValue = achievement.requirements.threshold;
          break;
        case 'total_sessions':
          progressValue = user.stats.totalSessions;
          targetValue = achievement.requirements.threshold;
          break;
        case 'skill_level':
          progressValue = user.stats.level;
          targetValue = achievement.requirements.threshold;
          break;
        case 'streak_length':
          progressValue = user.stats.longestStreak;
          targetValue = achievement.requirements.threshold;
          break;
        case 'xp_threshold':
          progressValue = user.stats.totalXP;
          targetValue = achievement.requirements.threshold;
          break;
      }
      
      if (targetValue > 0) {
        progressPercentage = Math.min(100, Math.round((progressValue / targetValue) * 100));
      }
      
      return {
        id: achievement._id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        rarity: achievement.rarity,
        icon: achievement.icon,
        color: achievement.color,
        unlocked: hasAchievement,
        qualifies: qualifies,
        progress: {
          current: progressValue,
          target: targetValue,
          percentage: progressPercentage
        },
        xpReward: achievement.calculateXPReward()
      };
    });
    
    res.json({
      progress,
      unlocked: progress.filter(p => p.unlocked).length,
      total: progress.length,
      qualifies: progress.filter(p => p.qualifies && !p.unlocked).length
    });
  } catch (error) {
    logger.error('Error getting achievement progress:', error);
    res.status(500).json({ message: 'Error retrieving achievement progress' });
  }
});

// Get achievement statistics
router.get('/stats', async (req, res) => {
  try {
    const totalAchievements = await Achievement.countDocuments({ isActive: true });
    const achievementsByCategory = await Achievement.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const achievementsByRarity = await Achievement.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$rarity', count: { $sum: 1 } } },
      { $sort: { count: 1 } }
    ]);
    
    res.json({
      total: totalAchievements,
      byCategory: achievementsByCategory,
      byRarity: achievementsByRarity
    });
  } catch (error) {
    logger.error('Error getting achievement statistics:', error);
    res.status(500).json({ message: 'Error retrieving achievement statistics' });
  }
});

// Admin: Create new achievement
router.post('/', [
  body('name').notEmpty().withMessage('Achievement name is required'),
  body('description').notEmpty().withMessage('Achievement description is required'),
  body('category').isIn(['practice', 'streak', 'skill', 'social', 'exploration', 'milestone', 'special', 'seasonal', 'challenge']).withMessage('Invalid category'),
  body('requirements.type').notEmpty().withMessage('Requirement type is required'),
  body('requirements.threshold').isNumeric().withMessage('Threshold must be a number'),
  body('rewards.xp').optional().isNumeric().withMessage('XP reward must be a number'),
  body('icon').notEmpty().withMessage('Icon is required'),
  body('rarity').isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const achievement = new Achievement(req.body);
    await achievement.save();
    
    logger.logBusiness('Achievement Created', req.user._id, {
      achievementId: achievement._id,
      name: achievement.name
    });
    
    res.status(201).json(achievement);
  } catch (error) {
    logger.error('Error creating achievement:', error);
    res.status(500).json({ message: 'Error creating achievement' });
  }
});

// Admin: Update achievement
router.put('/:id', [
  body('name').optional().notEmpty().withMessage('Achievement name cannot be empty'),
  body('description').optional().notEmpty().withMessage('Achievement description cannot be empty'),
  body('category').optional().isIn(['practice', 'streak', 'skill', 'social', 'exploration', 'milestone', 'special', 'seasonal', 'challenge']).withMessage('Invalid category'),
  body('requirements.threshold').optional().isNumeric().withMessage('Threshold must be a number'),
  body('rewards.xp').optional().isNumeric().withMessage('XP reward must be a number'),
  body('rarity').optional().isIn(['common', 'uncommon', 'rare', 'epic', 'legendary']).withMessage('Invalid rarity')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation error',
        errors: errors.array()
      });
    }
    
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    logger.logBusiness('Achievement Updated', req.user._id, {
      achievementId: achievement._id,
      name: achievement.name
    });
    
    res.json(achievement);
  } catch (error) {
    logger.error('Error updating achievement:', error);
    res.status(500).json({ message: 'Error updating achievement' });
  }
});

// Admin: Delete achievement
router.delete('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    
    // Remove achievement from all users
    await User.updateMany(
      { 'stats.achievements': achievement._id },
      { $pull: { 'stats.achievements': achievement._id } }
    );
    
    logger.logBusiness('Achievement Deleted', req.user._id, {
      achievementId: achievement._id,
      name: achievement.name
    });
    
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    logger.error('Error deleting achievement:', error);
    res.status(500).json({ message: 'Error deleting achievement' });
  }
});

module.exports = router;
