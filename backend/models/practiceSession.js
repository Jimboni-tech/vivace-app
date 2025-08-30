
const mongoose = require('mongoose');

const PracticeSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
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
  notes: {
    type: String,
    maxlength: 2000
  },
  recordings: [{
    url: { type: String, required: true },
    type: { type: String, enum: ['audio', 'video'], default: 'audio' },
    duration: { type: Number, min: 0 }
  }],
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'cancelled'],
    default: 'active'
  }
}, {
  timestamps: true
});

const PracticeSession = mongoose.model('PracticeSession', PracticeSessionSchema);
module.exports = PracticeSession;
