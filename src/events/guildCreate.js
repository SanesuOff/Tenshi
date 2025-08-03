const { Events } = require('discord.js');
const Guild = require('../models/Guild');

module.exports = {
  name: Events.GuildCreate,
  async execute(guild) {
    console.log(`🎉 Bot ajouté au serveur: ${guild.name} (${guild.id})`);
    
    try {
      // Création de l'entrée dans la base de données
      await Guild.findOneAndUpdate(
        { guildId: guild.id },
        { 
          guildId: guild.id,
          name: guild.name
        },
        { upsert: true, new: true }
      );
      
      // Message de bienvenue dans le premier canal textuel
      const channel = guild.channels.cache.find(ch => ch.type === 0 && ch.permissionsFor(guild.members.me).has('SendMessages'));
      
      if (channel) {
        const embed = {
          color: 0x00ff00,
          title: '🤖 Tenshi Bot',
          description: 'Merci de m\'avoir ajouté à votre serveur!',
          fields: [
            {
              name: '📝 Commandes',
              value: 'Utilisez `/help` pour voir toutes les commandes disponibles',
              inline: true
            },
            {
              name: '🌐 Dashboard',
              value: 'Visitez le dashboard web pour configurer le bot',
              inline: true
            },
            {
              name: '⚙️ Configuration',
              value: 'Utilisez `/setup` pour configurer les fonctionnalités',
              inline: true
            }
          ],
          footer: {
            text: 'Tenshi Bot - Fait avec ❤️'
          },
          timestamp: new Date()
        };
        
        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'ajout du serveur:', error);
    }
  }
}; 