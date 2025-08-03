const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Affiche la liste des commandes disponibles')
    .addStringOption(option =>
      option.setName('categorie')
        .setDescription('Catégorie de commandes à afficher')
        .setRequired(false)
        .addChoices(
          { name: 'Général', value: 'general' },
          { name: 'Modération', value: 'moderation' },
          { name: 'Économie', value: 'economy' },
          { name: 'Niveaux', value: 'leveling' },
          { name: 'Configuration', value: 'config' }
        )
    ),
  
  async execute(interaction) {
    const category = interaction.options.getString('categorie');
    
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🤖 Tenshi Bot - Aide')
      .setDescription('Voici toutes les commandes disponibles:')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: 'Tenshi Bot - Fait avec ❤️' })
      .setTimestamp();
    
    if (!category) {
      // Afficher toutes les catégories
      embed.addFields(
        { name: '📝 Général', value: '`/help`, `/ping`, `/info`, `/userinfo`', inline: true },
        { name: '🛡️ Modération', value: '`/kick`, `/ban`, `/mute`, `/warn`, `/clear`', inline: true },
        { name: '💰 Économie', value: '`/balance`, `/daily`, `/work`, `/transfer`', inline: true },
        { name: '📊 Niveaux', value: '`/level`, `/leaderboard`, `/rank`', inline: true },
        { name: '⚙️ Configuration', value: '`/setup`, `/prefix`, `/welcome`', inline: true },
        { name: '🌐 Dashboard', value: 'Visitez le dashboard web pour plus d\'options', inline: true }
      );
    } else {
      // Afficher une catégorie spécifique
      switch (category) {
        case 'general':
          embed.setTitle('📝 Commandes Générales')
            .addFields(
              { name: '/help', value: 'Affiche cette liste de commandes', inline: false },
              { name: '/ping', value: 'Affiche la latence du bot', inline: false },
              { name: '/info', value: 'Informations sur le serveur', inline: false },
              { name: '/userinfo', value: 'Informations sur un utilisateur', inline: false }
            );
          break;
          
        case 'moderation':
          embed.setTitle('🛡️ Commandes de Modération')
            .addFields(
              { name: '/kick', value: 'Expulse un utilisateur du serveur', inline: false },
              { name: '/ban', value: 'Bannit un utilisateur du serveur', inline: false },
              { name: '/mute', value: 'Rend muet un utilisateur', inline: false },
              { name: '/warn', value: 'Avertit un utilisateur', inline: false },
              { name: '/clear', value: 'Supprime des messages', inline: false }
            );
          break;
          
        case 'economy':
          embed.setTitle('💰 Commandes d\'Économie')
            .addFields(
              { name: '/balance', value: 'Affiche votre solde', inline: false },
              { name: '/daily', value: 'Récupère votre récompense quotidienne', inline: false },
              { name: '/work', value: 'Travaillez pour gagner de l\'argent', inline: false },
              { name: '/transfer', value: 'Transfère de l\'argent à un autre utilisateur', inline: false }
            );
          break;
          
        case 'leveling':
          embed.setTitle('📊 Commandes de Niveaux')
            .addFields(
              { name: '/level', value: 'Affiche votre niveau et XP', inline: false },
              { name: '/leaderboard', value: 'Affiche le classement des niveaux', inline: false },
              { name: '/rank', value: 'Affiche le rang d\'un utilisateur', inline: false }
            );
          break;
          
        case 'config':
          embed.setTitle('⚙️ Commandes de Configuration')
            .addFields(
              { name: '/setup', value: 'Configure les fonctionnalités du bot', inline: false },
              { name: '/prefix', value: 'Change le préfixe des commandes', inline: false },
              { name: '/welcome', value: 'Configure les messages de bienvenue', inline: false }
            );
          break;
      }
    }
    
    await interaction.reply({ embeds: [embed] });
  }
}; 