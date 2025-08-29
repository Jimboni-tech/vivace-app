const mongoose = require('mongoose');

const PieceSchema = new mongoose.Schema({
  // Piece Identity
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  composer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  arranger: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Musical Details
  instrument: {
    type: String,
    required: true,
    trim: true
  },
  
  genre: {
    type: String,
    required: true,
    trim: true
  },
  
  period: {
    type: String,
    enum: ['medieval', 'renaissance', 'baroque', 'classical', 'romantic', 'modern', 'contemporary'],
    required: true
  },
  
  key: {
    type: String,
    trim: true
  },
  
  timeSignature: {
    type: String,
    trim: true
  },
  
  tempo: {
    suggested: { type: Number, min: 0 }, // BPM
    range: {
      min: { type: Number, min: 0 },
      max: { type: Number, min: 0 }
    }
  },
  
  // Difficulty & Classification
  difficulty: {
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true
    },
    
    score: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    
    factors: [{
      aspect: { type: String, required: true },
      weight: { type: Number, min: 0, max: 1, default: 1 }
    }]
  },
  
  // Structure
  movements: [{
    name: { type: String, required: true },
    duration: { type: Number, min: 0 }, // in minutes
    difficulty: { type: Number, min: 1, max: 10 },
    notes: { type: String, maxlength: 500 }
  }],
  
  sections: [{
    name: { type: String, required: true },
    startBar: { type: Number, min: 1 },
    endBar: { type: Number, min: 1 },
    difficulty: { type: Number, min: 1, max: 10 },
    practiceNotes: { type: String, maxlength: 500 }
  }],
  
  // Technical Requirements
  techniques: [{
    name: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 10 },
    description: { type: String, maxlength: 300 }
  }],
  
  // Learning Resources
  resources: {
    sheetMusic: [{
      url: { type: String, required: true },
      type: { type: String, enum: ['pdf', 'image', 'link'], default: 'pdf' },
      description: { type: String, maxlength: 200 }
    }],
    
    recordings: [{
      url: { type: String, required: true },
      performer: { type: String, trim: true },
      type: { type: String, enum: ['audio', 'video'], default: 'audio' },
      quality: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    }],
    
    tutorials: [{
      url: { type: String, required: true },
      title: { type: String, required: true },
      instructor: { type: String, trim: true },
      type: { type: String, enum: ['video', 'article', 'course'], default: 'video' }
    }]
  },
  
  // Practice Tracking
  practiceHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PracticeSession',
      required: true
    },
    
    date: {
      type: Date,
      default: Date.now
    },
    
    timeSpent: {
      type: Number,
      min: 0,
      required: true
    },
    
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    tempo: {
      type: Number,
      min: 0
    },
    
    accuracy: {
      type: Number,
      min: 0,
      max: 100
    },
    
    notes: {
      type: String,
      maxlength: 1000
    },
    
    sections: [{
      name: { type: String, required: true },
      timeSpent: { type: Number, min: 0 },
      progress: { type: Number, min: 0, max: 100 },
      notes: { type: String, maxlength: 300 }
    }]
  }],
  
  // User Progress
  userProgress: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    status: {
      type: String,
      enum: ['not_started', 'learning', 'practicing', 'performing', 'mastered'],
      default: 'not_started'
    },
    
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    currentTempo: {
      type: Number,
      min: 0,
      default: 0
    },
    
    targetTempo: {
      type: Number,
      min: 0
    },
    
    accuracy: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    lastPracticed: { type: Date },
    
    totalTimeSpent: {
      type: Number,
      min: 0,
      default: 0
    },
    
    practiceSessions: {
      type: Number,
      min: 0,
      default: 0
    },
    
    goals: [{
      description: { type: String, required: true },
      target: { type: Number, required: true },
      unit: { type: String, required: true },
      completed: { type: Boolean, default: false },
      deadline: { type: Date }
    }],
    
    notes: {
      type: String,
      maxlength: 2000
    }
  }],
  
  // Metadata
  tags: [{ type: String, maxlength: 50 }],
  
  language: {
    type: String,
    default: 'en'
  },
  
  isPublic: {
    type: Boolean,
    default: true
  },
  
  // Statistics
  stats: {
    totalPractitioners: { type: Number, default: 0 },
    averageProgress: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    difficultyRating: { type: Number, default: 0 },
    popularity: { type: Number, default: 0 }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total duration
PieceSchema.virtual('totalDuration').get(function() {
  if (this.movements.length > 0) {
    return this.movements.reduce((total, movement) => total + (movement.duration || 0), 0);
  }
  return 0;
});

// Virtual for average difficulty
PieceSchema.virtual('averageDifficulty').get(function() {
  if (this.sections.length > 0) {
    const total = this.sections.reduce((sum, section) => sum + section.difficulty, 0);
    return Math.round(total / this.sections.length);
  }
  return this.difficulty.score;
});

// Virtual for is popular
PieceSchema.virtual('isPopular').get(function() {
  return this.stats.popularity > 50;
});

// Indexes for performance
PieceSchema.index({ title: 1, composer: 1 });
PieceSchema.index({ instrument: 1, difficulty: 1 });
PieceSchema.index({ genre: 1, period: 1 });
PieceSchema.index({ 'difficulty.level': 1, 'difficulty.score': 1 });
PieceSchema.index({ isPublic: 1, 'stats.popularity': -1 });
PieceSchema.index({ 'practiceHistory.user': 1 });
PieceSchema.index({ 'userProgress.user': 1 });

// Pre-save middleware to update stats
PieceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Update total practitioners
  this.stats.totalPractitioners = this.userProgress.length;
  
  // Update average progress
  if (this.userProgress.length > 0) {
    const totalProgress = this.userProgress.reduce((sum, progress) => sum + progress.overallProgress, 0);
    this.stats.averageProgress = Math.round(totalProgress / this.userProgress.length);
  }
  
  // Update average time spent
  if (this.userProgress.length > 0) {
    const totalTime = this.userProgress.reduce((sum, progress) => sum + progress.totalTimeSpent, 0);
    this.stats.averageTimeSpent = Math.round(totalTime / this.userProgress.length);
  }
  
  // Update difficulty rating
  this.stats.difficultyRating = this.difficulty.score;
  
  next();
});

// Method to add practice session
PieceSchema.methods.addPracticeSession = function(userId, sessionId, practiceData) {
  this.practiceHistory.push({
    user: userId,
    session: sessionId,
    ...practiceData
  });
  
  // Update user progress
  let userProgress = this.userProgress.find(p => p.user.toString() === userId.toString());
  if (!userProgress) {
    userProgress = {
      user: userId,
      status: 'learning',
      overallProgress: 0,
      currentTempo: 0,
      accuracy: 0,
      totalTimeSpent: 0,
      practiceSessions: 0,
      goals: [],
      notes: ''
    };
    this.userProgress.push(userProgress);
  }
  
  userProgress.totalTimeSpent += practiceData.timeSpent || 0;
  userProgress.practiceSessions += 1;
  userProgress.lastPracticed = new Date();
  
  if (practiceData.progress) {
    userProgress.overallProgress = Math.max(userProgress.overallProgress, practiceData.progress);
  }
  
  if (practiceData.tempo) {
    userProgress.currentTempo = Math.max(userProgress.currentTempo, practiceData.tempo);
  }
  
  if (practiceData.accuracy) {
    userProgress.accuracy = Math.max(userProgress.accuracy, practiceData.accuracy);
  }
  
  return this;
};

// Method to update user progress
PieceSchema.methods.updateUserProgress = function(userId, progressData) {
  const userProgress = this.userProgress.find(p => p.user.toString() === userId.toString());
  if (userProgress) {
    Object.assign(userProgress, progressData);
    userProgress.lastPracticed = new Date();
  }
  return this;
};

// Method to add goal
PieceSchema.methods.addGoal = function(userId, goalData) {
  const userProgress = this.userProgress.find(p => p.user.toString() === userId.toString());
  if (userProgress) {
    userProgress.goals.push(goalData);
  }
  return this;
};

// Method to complete goal
PieceSchema.methods.completeGoal = function(userId, goalIndex) {
  const userProgress = this.userProgress.find(p => p.user.toString() === userId.toString());
  if (userProgress && userProgress.goals[goalIndex]) {
    userProgress.goals[goalIndex].completed = true;
  }
  return this;
};

// Static method to search pieces
PieceSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {};
  
  if (query) {
    searchQuery.$or = [
      { title: { $regex: query, $options: 'i' } },
      { composer: { $regex: query, $options: 'i' } },
      { genre: { $regex: query, $options: 'i' } }
    ];
  }
  
  if (filters.instrument) {
    searchQuery.instrument = filters.instrument;
  }
  
  if (filters.difficulty) {
    searchQuery['difficulty.level'] = filters.difficulty;
  }
  
  if (filters.genre) {
    searchQuery.genre = filters.genre;
  }
  
  if (filters.period) {
    searchQuery.period = filters.period;
  }
  
  return this.find(searchQuery)
    .sort({ 'stats.popularity': -1, title: 1 })
    .populate('userProgress.user', 'username profile.displayName');
};

// Static method to get pieces by difficulty
PieceSchema.statics.getByDifficulty = function(level, limit = 20) {
  return this.find({ 'difficulty.level': level, isPublic: true })
    .sort({ 'stats.popularity': -1 })
    .limit(limit);
};

// Static method to get popular pieces
PieceSchema.statics.getPopular = function(limit = 20) {
  return this.find({ isPublic: true })
    .sort({ 'stats.popularity': -1 })
    .limit(limit);
};

const Piece = mongoose.model('Piece', PieceSchema);
module.exports = Piece;
