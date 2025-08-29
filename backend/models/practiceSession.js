const mongoose = require('mongoose');

const PracticeSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Session Details
  title: {
    type: String,
    trim: true,
    maxlength: 100,
    default: 'Practice Session'
  },
  
  instrument: {
    type: String,
    required: true
  },
  
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  endTime: {
    type: Date
  },
  
  duration: {
    type: Number, // in minutes
    min: 0
  },
  
  // Practice Content
  pieces: [{
    title: { type: String, required: true },
    composer: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard', 'expert'] },
    timeSpent: { type: Number, min: 0 }, // in minutes
    notes: { type: String, maxlength: 500 }
  }],
  
  exercises: [{
    name: { type: String, required: true },
    type: { type: String, enum: ['scales', 'arpeggios', 'etudes', 'technique', 'other'] },
    timeSpent: { type: Number, min: 0 },
    notes: { type: String, maxlength: 500 }
  }],
  
  // Practice Metrics
  metrics: {
    focusScore: { type: Number, min: 1, max: 10 },
    enjoymentScore: { type: Number, min: 1, max: 10 },
    difficultyLevel: { type: Number, min: 1, max: 10 },
    accuracy: { type: Number, min: 0, max: 100 }, // percentage
    tempo: { type: Number, min: 0 }, // BPM
    metronomeUsed: { type: Boolean, default: false }
  },
  
  // Goals & Progress
  goals: [{
    description: { type: String, required: true },
    completed: { type: Boolean, default: false },
    notes: { type: String, maxlength: 300 }
  }],
  
  achievements: [{
    type: { type: String, required: true },
    description: { type: String, required: true },
    xpReward: { type: Number, min: 0 }
  }],
  
  // Notes & Reflection
  notes: {
    preSession: { type: String, maxlength: 1000 },
    postSession: { type: String, maxlength: 1000 },
    challenges: { type: String, maxlength: 500 },
    improvements: { type: String, maxlength: 500 }
  },
  
  // Tags & Categories
  tags: [{ type: String, maxlength: 50 }],
  
  // Session Status
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  },
  
  // Recording & Media
  recordings: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['audio', 'video'], default: 'audio' },
    duration: { type: Number, min: 0 },
    notes: { type: String, maxlength: 300 }
  }],
  
  // Weather & Mood (for correlation analysis)
  context: {
    mood: { type: String, enum: ['excited', 'focused', 'tired', 'stressed', 'relaxed', 'other'] },
    energy: { type: Number, min: 1, max: 10 },
    weather: { type: String },
    location: { type: String }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for session duration in minutes
PracticeSessionSchema.virtual('durationMinutes').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  return this.duration || 0;
});

// Virtual for total pieces time
PracticeSessionSchema.virtual('totalPiecesTime').get(function() {
  return this.pieces.reduce((total, piece) => total + (piece.timeSpent || 0), 0);
});

// Virtual for total exercises time
PracticeSessionSchema.virtual('totalExercisesTime').get(function() {
  return this.exercises.reduce((total, exercise) => total + (exercise.timeSpent || 0), 0);
});

// Virtual for total practice time
PracticeSessionSchema.virtual('totalPracticeTime').get(function() {
  return this.totalPiecesTime + this.totalExercisesTime;
});

// Virtual for completion percentage
PracticeSessionSchema.virtual('completionPercentage').get(function() {
  if (this.goals.length === 0) return 100;
  const completed = this.goals.filter(goal => goal.completed).length;
  return Math.round((completed / this.goals.length) * 100);
});

// Indexes for performance
PracticeSessionSchema.index({ user: 1, startTime: -1 });
PracticeSessionSchema.index({ user: 1, status: 1 });
PracticeSessionSchema.index({ startTime: -1 });
PracticeSessionSchema.index({ instrument: 1 });
PracticeSessionSchema.index({ 'metrics.focusScore': -1 });
PracticeSessionSchema.index({ duration: -1 });

// Pre-save middleware to calculate duration
PracticeSessionSchema.pre('save', function(next) {
  if (this.endTime && this.startTime && !this.duration) {
    this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  }
  next();
});

// Method to complete session
PracticeSessionSchema.methods.completeSession = function() {
  this.endTime = new Date();
  this.status = 'completed';
  this.duration = Math.round((this.endTime - this.startTime) / (1000 * 60));
  return this;
};

// Method to pause session
PracticeSessionSchema.methods.pauseSession = function() {
  this.status = 'paused';
  return this;
};

// Method to resume session
PracticeSessionSchema.methods.resumeSession = function() {
  this.status = 'active';
  return this;
};

// Method to add piece
PracticeSessionSchema.methods.addPiece = function(pieceData) {
  this.pieces.push(pieceData);
  return this;
};

// Method to add exercise
PracticeSessionSchema.methods.addExercise = function(exerciseData) {
  this.exercises.push(exerciseData);
  return this;
};

// Method to add goal
PracticeSessionSchema.methods.addGoal = function(goalData) {
  this.goals.push(goalData);
  return this;
};

// Method to complete goal
PracticeSessionSchema.methods.completeGoal = function(goalIndex) {
  if (this.goals[goalIndex]) {
    this.goals[goalIndex].completed = true;
  }
  return this;
};

// Method to add achievement
PracticeSessionSchema.methods.addAchievement = function(achievementData) {
  this.achievements.push(achievementData);
  return this;
};

// Static method to get user's practice statistics
PracticeSessionSchema.statics.getUserStats = async function(userId, timeframe = 'all') {
  const now = new Date();
  let startDate;
  
  switch (timeframe) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(0);
  }
  
  const sessions = await this.find({
    user: userId,
    startTime: { $gte: startDate },
    status: 'completed'
  });
  
  const totalSessions = sessions.length;
  const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
  const averageTime = totalSessions > 0 ? totalTime / totalSessions : 0;
  
  return {
    totalSessions,
    totalTime,
    averageTime: Math.round(averageTime),
    sessions
  };
};

const PracticeSession = mongoose.model('PracticeSession', PracticeSessionSchema);
module.exports = PracticeSession;
