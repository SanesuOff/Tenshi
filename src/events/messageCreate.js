const { Events } = require('discord.js');
const User = require('../models/User');
const Guild = require('../models/Guild');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    // Ignorer les messages des bots
    if (message.author.bot) return;
    
    try {
      // Récupération des paramètres du serveur
      const guildData = await Guild.findOne({ guildId: message.guild.id });
      if (!guildData || !guildData.leveling.enabled) return;
      
      // Récupération ou création de l'utilisateur
      let userData = await User.findOne({ 
        userId: message.author.id, 
        guildId: message.guild.id 
      });
      
      if (!userData) {
        userData = new User({
          userId: message.author.id,
          guildId: message.guild.id,
          username: message.author.username
        });
      }
      
      // Vérification du cooldown (1 minute)
      const now = Date.now();
      const lastMessage = userData.leveling.lastMessage || 0;
      
      if (now - lastMessage < 60000) return; // 1 minute de cooldown
      
      // Calcul de l'XP gagné
      const xpGained = Math.floor(Math.random() * 15) + 1; // 1-15 XP
      const oldLevel = userData.leveling.level;
      
      userData.leveling.xp += xpGained;
      userData.leveling.lastMessage = now;
      
      // Calcul du nouveau niveau
      const newLevel = Math.floor(0.1 * Math.sqrt(userData.leveling.xp));
      
      if (newLevel > oldLevel) {
        userData.leveling.level = newLevel;
        
        // Message de niveau supérieur
        if (guildData.leveling.announceChannelId) {
          const announceChannel = message.guild.channels.cache.get(guildData.leveling.announceChannelId);
          if (announceChannel) {
            const embed = {
              color: 0x00ff00,
              title: '🎉 Niveau Supérieur!',
              description: `Félicitations ${message.author}! Tu as atteint le niveau **${newLevel}**!`,
              thumbnail: {
                url: message.author.displayAvatarURL()
              },
              footer: {
                text: 'Tenshi Bot - Système de Niveaux'
              },
              timestamp: new Date()
            };
            
            await announceChannel.send({ embeds: [embed] });
          }
        }
      }
      
      await userData.save();
      
    } catch (error) {
      console.error('❌ Erreur lors du traitement du message:', error);
    }
  }
}; 