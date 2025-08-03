const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  leveling: {
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    lastMessage: Date
  },
  economy: {
    balance: {
      type: Number,
      default: 1000
    },
    bank: {
      type: Number,
      default: 0
    },
    lastDaily: Date,
    lastWork: Date
  },
  moderation: {
    warnings: [{
      reason: String,
      moderator: String,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    mutes: [{
      reason: String,
      moderator: String,
      duration: Number,
      startDate: {
        type: Date,
        default: Date.now
      },
      endDate: Date
    }],
    bans: [{
      reason: String,
      moderator: String,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index composé pour userId et guildId
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema); 