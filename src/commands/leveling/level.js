const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('level')
    .setDescription('Affiche votre niveau ou celui d\'un autre utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur dont vous voulez voir le niveau')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    
    try {
      // Récupération des paramètres du serveur
      const guildData = await Guild.findOne({ guildId: interaction.guild.id });
      if (!guildData || !guildData.leveling.enabled) {
        return await interaction.reply({
          content: '❌ Le système de niveaux n\'est pas activé sur ce serveur.',
          ephemeral: true
        });
      }
      
      // Récupération des données utilisateur
      let userData = await User.findOne({ 
        userId: targetUser.id, 
        guildId: interaction.guild.id 
      });
      
      if (!userData) {
        userData = new User({
          userId: targetUser.id,
          guildId: interaction.guild.id,
          username: targetUser.username
        });
        await userData.save();
      }
      
      // Calcul de l'XP nécessaire pour le prochain niveau
      const currentLevel = userData.leveling.level;
      const currentXP = userData.leveling.xp;
      const xpForNextLevel = Math.pow((currentLevel + 1) / 0.1, 2);
      const xpNeeded = Math.ceil(xpForNextLevel - currentXP);
      const progress = Math.min(100, (currentXP / xpForNextLevel) * 100);
      
      // Création de la barre de progression
      const progressBar = createProgressBar(progress);
      
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`📊 Niveau de ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { 
            name: '⭐ Niveau', 
            value: `${currentLevel}`, 
            inline: true 
          },
          { 
            name: '📈 XP Total', 
            value: `${currentXP.toLocaleString()}`, 
            inline: true 
          },
          { 
            name: '🎯 XP pour le prochain niveau', 
            value: `${xpNeeded.toLocaleString()}`, 
            inline: true 
          },
          { 
            name: '📊 Progression', 
            value: `${progressBar} ${progress.toFixed(1)}%`, 
            inline: false 
          }
        )
        .setFooter({ text: 'Tenshi Bot - Système de Niveaux' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage du niveau:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite lors de l\'affichage du niveau.',
        ephemeral: true
      });
    }
  }
};

function createProgressBar(percentage) {
  const filled = '█';
  const empty = '░';
  const totalBars = 10;
  const filledBars = Math.round((percentage / 100) * totalBars);
  const emptyBars = totalBars - filledBars;
  
  return filled.repeat(filledBars) + empty.repeat(emptyBars);
} 