const mongoose = require('mongoose');

const guildSchema = new mongoose.Schema({
  guildId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  prefix: {
    type: String,
    default: '!'
  },
  welcome: {
    enabled: {
      type: Boolean,
      default: false
    },
    channelId: String,
    message: {
      type: String,
      default: 'Bienvenue {user} sur {server}!'
    }
  },
  moderation: {
    logChannelId: String,
    autoMod: {
      enabled: {
        type: Boolean,
        default: false
      },
      antiSpam: {
        type: Boolean,
        default: true
      },
      antiLink: {
        type: Boolean,
        default: false
      }
    }
  },
  leveling: {
    enabled: {
      type: Boolean,
      default: true
    },
    announceChannelId: String,
    xpRate: {
      type: Number,
      default: 1
    }
  },
  economy: {
    enabled: {
      type: Boolean,
      default: true
    },
    currency: {
      type: String,
      default: '💎'
    },
    startBalance: {
      type: Number,
      default: 1000
    }
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

guildSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Guild', guildSchema); 