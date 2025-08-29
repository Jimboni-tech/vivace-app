// models/user.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Basic Authentication
  username: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  appleId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Profile Information
  profile: {
    firstName: { type: String, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    displayName: { type: String, trim: true, maxlength: 100 },
    bio: { type: String, maxlength: 500 },
    avatar: { type: String }
  },

  // Musical Profile
  musicalProfile: {
    primaryInstrument: { type: String, default: 'piano' },
    skillLevel: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    },
    genres: [{ type: String }],
    goals: [{ type: String, maxlength: 200 }],
    customGoals: [{ type: String, maxlength: 200 }],
    practiceGoals: {
      dailyMinutes: { type: Number, default: 30 },
      weeklySessions: { type: Number, default: 5 }
    }
  },

  // Statistics & Progress
  stats: {
    totalPracticeTime: { type: Number, default: 0 }, // in minutes
    totalSessions: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    averageSessionLength: { type: Number, default: 0 },
    lastPracticeDate: { type: Date },
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    achievements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Achievement' }]
  },

  // Social Features
  social: {
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    friendRequests: {
      sent: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
      received: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }],
    isPublic: { type: Boolean, default: true },
    allowFriendRequests: { type: Boolean, default: true }
  },

  // Settings & Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true },
      social: { type: Boolean, default: true }
    },
    privacy: {
      showProgress: { type: Boolean, default: true },
      showStats: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true }
    },
    theme: { type: String, default: 'dark' },
    language: { type: String, default: 'en' }
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.username;
});

// Virtual for XP to next level
UserSchema.virtual('xpToNextLevel').get(function() {
  const currentLevel = this.stats.level;
  const xpForNextLevel = Math.pow(currentLevel + 1, 2) * 100;
  return Math.max(0, xpForNextLevel - this.stats.totalXP);
});

// Indexes for performance
// Note: email and username already have indexes from unique: true
UserSchema.index({ 'stats.totalXP': -1 });
UserSchema.index({ 'stats.currentStreak': -1 });
UserSchema.index({ 'social.friends': 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware for password hashing
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Update lastActive on any modification
  this.lastActive = new Date();
  next();
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to add XP and handle leveling
UserSchema.methods.addXP = function(amount) {
  this.stats.totalXP += amount;
  
  // Calculate new level
  const newLevel = Math.floor(Math.sqrt(this.stats.totalXP / 100)) + 1;
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel;
    return { leveledUp: true, newLevel, xpGained: amount };
  }
  
  return { leveledUp: false, xpGained: amount };
};

// Method to update streak
UserSchema.methods.updateStreak = function() {
  const now = new Date();
  const lastPractice = this.stats.lastPracticeDate;
  
  if (!lastPractice) {
    this.stats.currentStreak = 1;
  } else {
    const daysDiff = Math.floor((now - lastPractice) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      this.stats.currentStreak += 1;
    } else if (daysDiff > 1) {
      this.stats.currentStreak = 1;
    }
  }
  
  if (this.stats.currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = this.stats.currentStreak;
  }
  
  this.stats.lastPracticeDate = now;
  return this.stats.currentStreak;
};

// Method to add friend
UserSchema.methods.addFriend = function(friendId) {
  if (!this.social.friends.includes(friendId)) {
    this.social.friends.push(friendId);
    return true;
  }
  return false;
};

// Method to remove friend
UserSchema.methods.removeFriend = function(friendId) {
  const index = this.social.friends.indexOf(friendId);
  if (index > -1) {
    this.social.friends.splice(index, 1);
    return true;
  }
  return false;
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
