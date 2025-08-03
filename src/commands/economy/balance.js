const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Guild = require('../../models/Guild');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Affiche votre solde ou celui d\'un autre utilisateur')
    .addUserOption(option =>
      option.setName('utilisateur')
        .setDescription('Utilisateur dont vous voulez voir le solde')
        .setRequired(false)
    ),
  
  async execute(interaction) {
    const targetUser = interaction.options.getUser('utilisateur') || interaction.user;
    
    try {
      // Récupération des paramètres du serveur
      const guildData = await Guild.findOne({ guildId: interaction.guild.id });
      if (!guildData || !guildData.economy.enabled) {
        return await interaction.reply({
          content: '❌ Le système d\'économie n\'est pas activé sur ce serveur.',
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
          username: targetUser.username,
          economy: {
            balance: guildData.economy.startBalance,
            bank: 0
          }
        });
        await userData.save();
      }
      
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle(`💰 Solde de ${targetUser.username}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { 
            name: '💵 Portefeuille', 
            value: `${guildData.economy.currency} ${userData.economy.balance.toLocaleString()}`, 
            inline: true 
          },
          { 
            name: '🏦 Banque', 
            value: `${guildData.economy.currency} ${userData.economy.bank.toLocaleString()}`, 
            inline: true 
          },
          { 
            name: '💎 Total', 
            value: `${guildData.economy.currency} ${(userData.economy.balance + userData.economy.bank).toLocaleString()}`, 
            inline: true 
          }
        )
        .setFooter({ text: 'Tenshi Bot - Économie' })
        .setTimestamp();
      
      await interaction.reply({ embeds: [embed] });
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'affichage du solde:', error);
      await interaction.reply({
        content: '❌ Une erreur s\'est produite lors de l\'affichage du solde.',
        ephemeral: true
      });
    }
  }
}; 