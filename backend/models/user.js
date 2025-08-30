
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  // Auth
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
    required: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },

  // Profile
  profile: {
    firstName: { type: String, trim: true, maxlength: 50 },
    lastName: { type: String, trim: true, maxlength: 50 },
    displayName: { type: String, trim: true, maxlength: 100 },
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

  // Stats
  stats: {
    totalPracticeTime: { type: Number, default: 0 },
    totalSessions: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    averageSessionLength: { type: Number, default: 0 },
    lastPracticeDate: { type: Date },
    totalXP: { type: Number, default: 0 },
    level: { type: Number, default: 1 }
  },

  // Minimal Social (optional, keep if needed)
  social: {
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: [] }]
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Password hashing
UserSchema.pre('save', async function(next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  this.lastActive = new Date();
  next();
});

// Password comparison
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// XP and Level
UserSchema.methods.addXP = function(amount) {
  this.stats.totalXP += amount;
  const newLevel = Math.floor(Math.sqrt(this.stats.totalXP / 100)) + 1;
  if (newLevel > this.stats.level) {
    this.stats.level = newLevel;
    return { leveledUp: true, newLevel, xpGained: amount };
  }
  return { leveledUp: false, xpGained: amount };
};

// Streak update
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

const User = mongoose.model('User', UserSchema);
module.exports = User;
