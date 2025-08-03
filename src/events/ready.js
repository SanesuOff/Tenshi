const { Events } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ ${client.user.tag} est maintenant en ligne!`);
    console.log(`📊 Bot présent sur ${client.guilds.cache.size} serveurs`);
    
    // Mise à jour du statut du bot
    client.user.setActivity('!help | tenshi-bot.xyz', { type: 'PLAYING' });
    
    // Synchronisation des serveurs avec la base de données
    try {
      for (const guild of client.guilds.cache.values()) {
        await Guild.findOneAndUpdate(
          { guildId: guild.id },
          { 
            guildId: guild.id,
            name: guild.name
          },
          { upsert: true, new: true }
        );
      }
      console.log('✅ Synchronisation des serveurs terminée');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }
}; 