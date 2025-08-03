const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Affiche le classement des niveaux')
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Type de classement à afficher')
        .setRequired(false)
        .addChoices(
          { name: 'Niveaux', value: 'level' },
          { name: 'XP', value: 'xp' }
        )
    ),
  
  async execute(interaction) {
    try {
      const type = interaction.options.getString('type') || 'level';
      
      // Récupération des paramètres du serveur
      const guildData = await Guild.findOne({ guildId: interaction.guild.id });
      if (!guildData || !guildData.leveling.enabled) {
        return await interaction.reply({
          content: '❌ Le système de niveaux n\'est pas activé sur ce serveur.',
          ephemeral: true
        });
      }
      
      // Récupération du classement
      const sortField = type === 'level' ? 'leveling.level' : 'leveling.xp';
      const users = await User.find({ guildId: interaction.guild.id })
        .sort({ [sortField]: -1 })
        .limit(10);
      
      if (users.length === 0) {
        const embed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle('📊 Classement des Niveaux')
          .setDescription('Aucun utilisateur n\'a encore gagné d\'XP sur ce serveur.')
          .setFooter({ text: 'Tenshi Bot - Système de Niveaux' })
          .setTimestamp();
        
        return await interaction.reply({ embeds: [embed] });
      }
      
      // Création du classement
      let leaderboardText = '';
      const medals = ['🥇', '🥈', '🥉'];
      
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        const rank = i + 1;
        const medal = rank <= 3 ? medals[rank - 1] : `${rank}.`;
        
        try {
          const member = await interaction.guild.members.fetch(user.userId);
          const displayName = member.displayName;
          
          if (type === 'level') {
            leaderboardText += `${medal} **${displayName}** - Niveau ${user.leveling.level} (${user.leveling.xp.toLocaleString()} XP)\n`;
          } else {
            leaderboardText += `${medal} **${displayName}** - ${user.leveling.xp.toLocaleString()} XP (Niveau ${user.leveling.level})\n`;
          }
        } catch (error) {
          // Utilisateur n'est plus sur le serveur
          if (type === 'level') {
            leaderboardText += `${medal} **${user.username}** - Niveau ${user.leveling.level} (${user.leveling.xp.toLocaleString()} XP)\n`;
          } else {
            leaderboardText += `${medal} **${user.username}** - ${user.leveling.xp.toLocaleString()} XP (Niveau ${user.leveling.level})\n`;
          }
        }
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(`📊 Classement des ${type === 'level' ? 'Niveaux' : 'XP'}`)
        .setDescription(leaderboardText)
        .setThumbnail(interaction.guild.iconURL())
        .addFields(
          { 
            name: '📈 Votre position', 
            value: await getUserPosition(interaction.user.id, interaction.guild.id, sortField), 
            inline: true 
          },
          { 
            name: '👥 Total participants', 
            value: `${users.length} utilisateurs`, 
            inline: true 
          }
        )
        .setFooter({ text: 'Tenshi Bot - Système de Niveaux' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage du classement:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite lors de l\'affichage du classement.',
        ephemeral: true
      });
    }
  }
};

async function getUserPosition(userId, guildId, sortField) {
  try {
    const userRank = await User.countDocuments({
      guildId: guildId,
      [sortField]: { $gt: 0 }
    });
    
    const userData = await User.findOne({ userId: userId, guildId: guildId });
    if (!userData) return 'Non classé';
    
    const higherUsers = await User.countDocuments({
      guildId: guildId,
      [sortField]: { $gt: userData[sortField.split('.')[0]][sortField.split('.')[1]] }
    });
    
    const position = higherUsers + 1;
    return `#${position}`;
  } catch (error) {
    return 'Non classé';
  }
} 