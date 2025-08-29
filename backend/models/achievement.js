const mongoose = require('mongoose');

const AchievementSchema = new mongoose.Schema({
  // Achievement Identity
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  category: {
    type: String,
    required: true,
    enum: [
      'practice', 'streak', 'skill', 'social', 'exploration', 
      'milestone', 'special', 'seasonal', 'challenge'
    ]
  },
  
  subcategory: {
    type: String,
    maxlength: 50
  },
  
  // Achievement Requirements
  requirements: {
    type: {
      type: String,
      required: true,
      enum: [
        'total_practice_time', 'consecutive_days', 'total_sessions',
        'skill_level', 'pieces_completed', 'exercises_completed',
        'friends_added', 'challenges_won', 'perfect_scores',
        'custom_goal', 'streak_length', 'xp_threshold'
      ]
    },
    
    threshold: {
      type: Number,
      required: true,
      min: 0
    },
    
    timeframe: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'once'
    },
    
    conditions: [{
      field: { type: String, required: true },
      operator: { 
        type: String, 
        enum: ['equals', 'greater_than', 'less_than', 'contains', 'not_equals'],
        default: 'greater_than'
      },
      value: { type: mongoose.Schema.Types.Mixed, required: true }
    }]
  },
  
  // Rewards
  rewards: {
    xp: {
      type: Number,
      default: 0,
      min: 0
    },
    
    badge: {
      type: String,
      maxlength: 100
    },
    
    title: {
      type: String,
      maxlength: 100
    },
    
    unlockables: [{
      type: { type: String, required: true },
      value: { type: String, required: true },
      description: { type: String, maxlength: 200 }
    }]
  },
  
  // Visual & Display
  icon: {
    type: String,
    required: true
  },
  
  color: {
    type: String,
    default: '#3D9CFF'
  },
  
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  
  // Achievement Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  isHidden: {
    type: Boolean,
    default: false
  },
  
  isRepeatable: {
    type: Boolean,
    default: false
  },
  
  // Metadata
  version: {
    type: String,
    default: '1.0.0'
  },
  
  tags: [{ type: String, maxlength: 50 }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for rarity color
AchievementSchema.virtual('rarityColor').get(function() {
  const colors = {
    common: '#A1A1A1',
    uncommon: '#4CAF50',
    rare: '#2196F3',
    epic: '#9C27B0',
    legendary: '#FF9800'
  };
  return colors[this.rarity] || colors.common;
});

// Virtual for rarity multiplier
AchievementSchema.virtual('rarityMultiplier').get(function() {
  const multipliers = {
    common: 1,
    uncommon: 1.5,
    rare: 2,
    epic: 3,
    legendary: 5
  };
  return multipliers[this.rarity] || 1;
});

// Indexes for performance
AchievementSchema.index({ category: 1, subcategory: 1 });
AchievementSchema.index({ 'requirements.type': 1 });
AchievementSchema.index({ rarity: 1 });
AchievementSchema.index({ isActive: 1 });
AchievementSchema.index({ isHidden: 1 });

// Method to check if user qualifies for achievement
AchievementSchema.methods.checkQualification = function(userStats) {
  const req = this.requirements;
  
  switch (req.type) {
    case 'total_practice_time':
      return userStats.totalPracticeTime >= req.threshold;
      
    case 'consecutive_days':
      return userStats.currentStreak >= req.threshold;
      
    case 'total_sessions':
      return userStats.totalSessions >= req.threshold;
      
    case 'skill_level':
      return userStats.level >= req.threshold;
      
    case 'streak_length':
      return userStats.longestStreak >= req.threshold;
      
    case 'xp_threshold':
      return userStats.totalXP >= req.threshold;
      
    default:
      return false;
  }
};

// Method to calculate XP reward with rarity bonus
AchievementSchema.methods.calculateXPReward = function() {
  return Math.round(this.rewards.xp * this.rarityMultiplier);
};

// Static method to get achievements by category
AchievementSchema.statics.getByCategory = function(category, includeHidden = false) {
  const query = { category, isActive: true };
  if (!includeHidden) {
    query.isHidden = false;
  }
  return this.find(query).sort({ rarity: 1, name: 1 });
};

// Static method to get achievements by rarity
AchievementSchema.statics.getByRarity = function(rarity) {
  return this.find({ rarity, isActive: true, isHidden: false }).sort({ name: 1 });
};

// Static method to get all active achievements
AchievementSchema.statics.getActive = function() {
  return this.find({ isActive: true, isHidden: false }).sort({ category: 1, name: 1 });
};

// Pre-save middleware to update version
AchievementSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Achievement = mongoose.model('Achievement', AchievementSchema);
module.exports = Achievement;
