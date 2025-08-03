const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config/config.json');

const commands = [];

// Récupération de toutes les commandes
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath);

for (const folder of commandFolders) {
  const folderPath = path.join(commandsPath, folder);
  const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
  
  for (const file of commandFiles) {
    const filePath = path.join(folderPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`📝 Commande ajoutée: ${command.data.name}`);
    }
  }
}

// Configuration du REST
const rest = new REST({ version: '10' }).setToken(config.token);

// Fonction pour déployer les commandes
(async () => {
  try {
    console.log(`🔄 Début du déploiement de ${commands.length} commandes...`);

    // Déploiement global
    const data = await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commands },
    );

    console.log(`✅ ${data.length} commandes déployées avec succès!`);
  } catch (error) {
    console.error('❌ Erreur lors du déploiement:', error);
  }
})(); 