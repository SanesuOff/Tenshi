const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const User = require("../../models/User");
const Guild = require("../../models/Guild");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("daily")
    .setDescription("Récupère votre récompense quotidienne"),

  async execute(interaction) {
    try {
      // Récupération des paramètres du serveur
      const guildData = await Guild.findOne({ guildId: interaction.guild.id });
      if (!guildData || !guildData.economy.enabled) {
        return await interaction.reply({
          content: "❌ Le système d'économie n'est pas activé sur ce serveur.",
          ephemeral: true,
        });
      }

      // Récupération des données utilisateur
      let userData = await User.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      });

      if (!userData) {
        userData = new User({
          userId: interaction.user.id,
          guildId: interaction.guild.id,
          username: interaction.user.username,
          economy: {
            balance: guildData.economy.startBalance,
            bank: 0,
          },
        });
      }

      // Vérification du cooldown (24 heures)
      const now = Date.now();
      const lastDaily = userData.economy.lastDaily || 0;
      const timeDiff = now - lastDaily;
      const dayInMs = 24 * 60 * 60 * 1000;

      if (timeDiff < dayInMs) {
        const remainingTime = dayInMs - timeDiff;
        const hours = Math.floor(remainingTime / (60 * 60 * 1000));
        const minutes = Math.floor(
          (remainingTime % (60 * 60 * 1000)) / (60 * 1000)
        );

        const embed = new EmbedBuilder()
          .setColor(0xff6b6b)
          .setTitle("⏰ Récompense Quotidienne")
          .setDescription(
            `Vous avez déjà récupéré votre récompense quotidienne !`
          )
          .addFields({
            name: "⏳ Temps restant",
            value: `${hours}h ${minutes}m`,
            inline: true,
          })
          .setFooter({ text: "Tenshi Bot - Économie" })
          .setTimestamp();

        return await interaction.reply({ embeds: [embed] });
      }

      // Calcul de la récompense (100-500)
      const reward = Math.floor(Math.random() * 401) + 100;
      userData.economy.balance += reward;
      userData.economy.lastDaily = now;
      await userData.save();

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle("💰 Récompense Quotidienne")
        .setDescription(
          `Félicitations ${interaction.user}! Vous avez reçu votre récompense quotidienne !`
        )
        .addFields(
          {
            name: "💎 Récompense",
            value: `${guildData.economy.currency} ${reward.toLocaleString()}`,
            inline: true,
          },
          {
            name: "💵 Nouveau solde",
            value: `${
              guildData.economy.currency
            } ${userData.economy.balance.toLocaleString()}`,
            inline: true,
          }
        )
        .setFooter({ text: "Tenshi Bot - Économie" })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération de la récompense quotidienne:",
        error
      );
      await interaction.reply({
        content:
          "❌ Une erreur s'est produite lors de la récupération de la récompense.",
        ephemeral: true,
      });
    }
  },
};
