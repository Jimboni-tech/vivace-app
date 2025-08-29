const mongoose = require('mongoose');

const ChallengeSchema = new mongoose.Schema({
  // Challenge Identity
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Challenge Type & Category
  type: {
    type: String,
    required: true,
    enum: [
      'practice_time', 'streak', 'pieces_completed', 'exercises_completed',
      'accuracy', 'tempo', 'skill_level', 'custom_goal', 'social'
    ]
  },
  
  category: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'custom', 'seasonal', 'special']
  },
  
  // Challenge Requirements
  requirements: {
    target: {
      type: Number,
      required: true,
      min: 0
    },
    
    unit: {
      type: String,
      required: true,
      enum: ['minutes', 'days', 'count', 'percentage', 'bpm', 'level', 'custom']
    },
    
    instrument: {
      type: String,
      required: false
    },
    
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      required: false
    },
    
    customRules: [{
      field: { type: String, required: true },
      operator: { 
        type: String, 
        enum: ['equals', 'greater_than', 'less_than', 'contains', 'not_equals'],
        default: 'greater_than'
      },
      value: { type: mongoose.Schema.Types.Mixed, required: true }
    }]
  },
  
  // Challenge Settings
  settings: {
    maxParticipants: {
      type: Number,
      default: 100,
      min: 2,
      max: 1000
    },
    
    isPublic: {
      type: Boolean,
      default: true
    },
    
    allowInvites: {
      type: Boolean,
      default: true
    },
    
    autoStart: {
      type: Boolean,
      default: false
    },
    
    requireApproval: {
      type: Boolean,
      default: false
    }
  },
  
  // Timeline
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true
  },
  
  duration: {
    type: Number, // in days
    required: true,
    min: 1
  },
  
  // Participants & Progress
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    joinedAt: {
      type: Date,
      default: Date.now
    },
    
    progress: {
      current: { type: Number, default: 0 },
      lastUpdate: { type: Date, default: Date.now },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    },
    
    achievements: [{
      type: { type: String, required: true },
      description: { type: String, required: true },
      xpReward: { type: Number, min: 0 },
      earnedAt: { type: Date, default: Date.now }
    }]
  }],
  
  // Invitations
  invitations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    invitedAt: {
      type: Date,
      default: Date.now
    },
    
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    
    respondedAt: { type: Date }
  }],
  
  // Rewards & Prizes
  rewards: {
    xp: {
      first: { type: Number, default: 100, min: 0 },
      second: { type: Number, default: 50, min: 0 },
      third: { type: Number, default: 25, min: 0 },
      participation: { type: Number, default: 10, min: 0 }
    },
    
    badges: [{
      position: { type: Number, required: true },
      name: { type: String, required: true },
      icon: { type: String, required: true }
    }],
    
    titles: [{
      position: { type: Number, required: true },
      name: { type: String, required: true },
      duration: { type: Number, default: 7 } // in days
    }]
  },
  
  // Challenge Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  // Leaderboard
  leaderboard: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    lastUpdated: { type: Date, default: Date.now }
  }],
  
  // Tags & Categories
  tags: [{ type: String, maxlength: 50 }],
  
  // Statistics
  stats: {
    totalParticipants: { type: Number, default: 0 },
    completedParticipants: { type: Number, default: 0 },
    averageProgress: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for challenge duration in days
ChallengeSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return this.duration;
});

// Virtual for time remaining
ChallengeSchema.virtual('timeRemaining').get(function() {
  const now = new Date();
  if (this.endDate && now < this.endDate) {
    return Math.ceil((this.endDate - now) / (1000 * 60 * 60 * 24));
  }
  return 0;
};

// Virtual for progress percentage
ChallengeSchema.virtual('progressPercentage').get(function() {
  if (this.startDate && this.endDate) {
    const total = this.endDate - this.startDate;
    const elapsed = Date.now() - this.startDate;
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  }
  return 0;
});

// Virtual for is active
ChallengeSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && now >= this.startDate && now <= this.endDate;
});

// Virtual for can join
ChallengeSchema.virtual('canJoin').get(function() {
  return this.status === 'pending' && this.participants.length < this.settings.maxParticipants;
});

// Indexes for performance
ChallengeSchema.index({ creator: 1, status: 1 });
ChallengeSchema.index({ status: 1, startDate: 1 });
ChallengeSchema.index({ type: 1, category: 1 });
ChallengeSchema.index({ 'participants.user': 1 });
ChallengeSchema.index({ startDate: 1, endDate: 1 });
ChallengeSchema.index({ isPublic: 1, status: 1 });

// Pre-save middleware to calculate duration
ChallengeSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && !this.duration) {
    this.duration = Math.ceil((this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  next();
});

// Method to add participant
ChallengeSchema.methods.addParticipant = function(userId) {
  if (this.participants.length >= this.settings.maxParticipants) {
    throw new Error('Challenge is full');
  }
  
  if (this.participants.find(p => p.user.toString() === userId.toString())) {
    throw new Error('User already participating');
  }
  
  this.participants.push({
    user: userId,
    joinedAt: new Date(),
    progress: { current: 0, lastUpdate: new Date(), completed: false }
  });
  
  this.stats.totalParticipants = this.participants.length;
  return this;
};

// Method to remove participant
ChallengeSchema.methods.removeParticipant = function(userId) {
  const index = this.participants.findIndex(p => p.user.toString() === userId.toString());
  if (index > -1) {
    this.participants.splice(index, 1);
    this.stats.totalParticipants = this.participants.length;
    return true;
  }
  return false;
};

// Method to update participant progress
ChallengeSchema.methods.updateProgress = function(userId, progress) {
  const participant = this.participants.find(p => p.user.toString() === userId.toString());
  if (participant) {
    participant.progress.current = progress;
    participant.progress.lastUpdate = new Date();
    
    if (progress >= this.requirements.target && !participant.progress.completed) {
      participant.progress.completed = true;
      participant.progress.completedAt = new Date();
      this.stats.completedParticipants++;
    }
    
    this.updateLeaderboard();
    return true;
  }
  return false;
};

// Method to update leaderboard
ChallengeSchema.methods.updateLeaderboard = function() {
  this.leaderboard = this.participants
    .map(p => ({
      user: p.user,
      score: p.progress.current,
      lastUpdated: p.progress.lastUpdate
    }))
    .sort((a, b) => b.score - a.score)
    .map((p, index) => ({ ...p, rank: index + 1 }));
  
  // Calculate average progress
  const totalProgress = this.participants.reduce((sum, p) => sum + p.progress.current, 0);
  this.stats.averageProgress = this.participants.length > 0 ? totalProgress / this.participants.length : 0;
};

// Method to invite user
ChallengeSchema.methods.inviteUser = function(userId, invitedBy) {
  if (!this.settings.allowInvites) {
    throw new Error('Invites not allowed for this challenge');
  }
  
  if (this.invitations.find(i => i.user.toString() === userId.toString())) {
    throw new Error('User already invited');
  }
  
  this.invitations.push({
    user: userId,
    invitedBy: invitedBy,
    invitedAt: new Date(),
    status: 'pending'
  });
  
  return this;
};

// Method to respond to invitation
ChallengeSchema.methods.respondToInvitation = function(userId, response) {
  const invitation = this.invitations.find(i => i.user.toString() === userId.toString());
  if (invitation && invitation.status === 'pending') {
    invitation.status = response;
    invitation.respondedAt = new Date();
    
    if (response === 'accepted') {
      this.addParticipant(userId);
    }
    
    return true;
  }
  return false;
};

// Method to start challenge
ChallengeSchema.methods.startChallenge = function() {
  if (this.status !== 'pending') {
    throw new Error('Challenge cannot be started');
  }
  
  this.status = 'active';
  return this;
};

// Method to complete challenge
ChallengeSchema.methods.completeChallenge = function() {
  if (this.status !== 'active') {
    throw new Error('Challenge cannot be completed');
  }
  
  this.status = 'completed';
  this.updateLeaderboard();
  this.distributeRewards();
  return this;
};

// Method to distribute rewards
ChallengeSchema.methods.distributeRewards = function() {
  // This would be implemented to distribute XP, badges, and titles
  // based on the leaderboard positions
  return this;
};

// Static method to get active challenges
ChallengeSchema.statics.getActive = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now }
  }).populate('creator', 'username profile.displayName');
};

// Static method to get challenges by user
ChallengeSchema.statics.getByUser = function(userId) {
  return this.find({
    $or: [
      { creator: userId },
      { 'participants.user': userId }
    ]
  }).populate('creator', 'username profile.displayName');
};

const Challenge = mongoose.model('Challenge', ChallengeSchema);
module.exports = Challenge;
