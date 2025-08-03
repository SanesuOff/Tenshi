const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Affiche la latence du bot'),
  
  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Pinging...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);
    
    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🏓 Pong!')
      .addFields(
        { name: 'Latence du Bot', value: `${latency}ms`, inline: true },
        { name: 'Latence de l\'API', value: `${apiLatency}ms`, inline: true }
      )
      .setFooter({ text: 'Tenshi Bot' })
      .setTimestamp();
    
    await interaction.editReply({ content: null, embeds: [embed] });
  }
}; 