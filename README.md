# 🤖 Tenshi Bot

Un bot Discord moderne avec dashboard web intégré, inspiré de [Darling Bot](https://github.com/eckigerluca/darling).

## ✨ Fonctionnalités

### 🛡️ Modération

- Système de kick, ban, mute et avertissements
- Modération automatique (anti-spam, anti-lien)
- Logs de modération personnalisables

### 💰 Économie

- Système de monnaie personnalisable
- Banque et portefeuille
- Récompenses quotidiennes et travail
- Transferts entre utilisateurs

### 📊 Niveaux

- Système d'XP et de niveaux
- Classements et leaderboards
- Barres de progression visuelles
- Annonces de niveau supérieur

### 🌐 Dashboard Web

- Interface moderne et responsive
- Authentification Discord OAuth2
- Configuration en temps réel
- Statistiques en direct
- Gestion multi-serveurs

### 🎵 Musique (à venir)

- Lecteur de musique intégré
- Support YouTube, Spotify
- File d'attente et contrôles

## 🚀 Installation

### Prérequis

- Node.js 16+
- MongoDB 6.0+
- Compte Discord Developer

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/tenshi-bot.git
cd tenshi-bot
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration

#### Créer une application Discord

1. Allez sur [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une nouvelle application
3. Notez le **Client ID** et **Client Secret**
4. Dans l'onglet "Bot", créez un bot et copiez le **Token**
5. Activez les **Server Members Intent** et **Message Content Intent**

#### Configurer le fichier config.json

```json
{
  "token": "votre_token_bot_discord",
  "clientId": "votre_client_id",
  "clientSecret": "votre_client_secret",
  "guildId": "id_serveur_test_optional",
  "mongoUri": "mongodb://localhost:27017/tenshi",
  "dashboard": {
    "url": "http://localhost:3000",
    "port": 3000,
    "sessionSecret": "votre_secret_session_aleatoire"
  },
  "topGG": {
    "enabled": false,
    "token": "votre_token_topgg"
  },
  "features": {
    "welcome": true,
    "moderation": true,
    "music": true,
    "leveling": true,
    "economy": true
  }
}
```

### 4. Déployer les commandes

```bash
npm run deploy
```

### 5. Démarrer le bot

```bash
npm start
```

Le bot sera en ligne et le dashboard accessible sur `http://localhost:3000`

## 📁 Structure du Projet

```
tenshi-bot/
├── src/
│   ├── commands/          # Commandes slash Discord
│   │   ├── general/       # Commandes générales
│   │   ├── economy/       # Commandes d'économie
│   │   ├── leveling/      # Commandes de niveaux
│   │   └── moderation/    # Commandes de modération
│   ├── events/            # Événements Discord
│   ├── models/            # Modèles MongoDB
│   ├── dashboard/         # Dashboard web
│   │   ├── views/         # Templates EJS
│   │   ├── public/        # Fichiers statiques
│   │   └── server.js      # Serveur Express
│   ├── config/            # Configuration
│   ├── index.js           # Point d'entrée principal
│   └── deploy-commands.js # Déploiement des commandes
├── package.json
└── README.md
```

## 🎮 Commandes Disponibles

### Général

- `/help` - Affiche la liste des commandes
- `/ping` - Affiche la latence du bot
- `/info` - Informations sur le serveur
- `/userinfo` - Informations sur un utilisateur

### Économie

- `/balance` - Affiche votre solde
- `/daily` - Récupère votre récompense quotidienne
- `/work` - Travaillez pour gagner de l'argent
- `/transfer` - Transfère de l'argent

### Niveaux

- `/level` - Affiche votre niveau
- `/leaderboard` - Classement des niveaux
- `/rank` - Rang d'un utilisateur

### Modération

- `/kick` - Expulse un utilisateur
- `/ban` - Bannit un utilisateur
- `/mute` - Rend muet un utilisateur
- `/warn` - Avertit un utilisateur
- `/clear` - Supprime des messages

## 🌐 Dashboard Web

### Fonctionnalités

- **Authentification Discord** - Connexion sécurisée via OAuth2
- **Gestion multi-serveurs** - Configurez plusieurs serveurs
- **Configuration en temps réel** - Modifications instantanées
- **Statistiques en direct** - Données mises à jour automatiquement
- **Interface responsive** - Compatible mobile et desktop

### Accès

1. Démarrez le bot
2. Allez sur `http://localhost:3000`
3. Connectez-vous avec Discord
4. Sélectionnez un serveur à configurer

## 🔧 Configuration Avancée

### Variables d'environnement

Créez un fichier `.env` pour les variables sensibles :

```env
DISCORD_TOKEN=votre_token
DISCORD_CLIENT_ID=votre_client_id
DISCORD_CLIENT_SECRET=votre_client_secret
MONGODB_URI=mongodb://localhost:27017/tenshi
SESSION_SECRET=votre_secret_session
```

### Base de données

Le bot utilise MongoDB pour stocker :

- Configuration des serveurs
- Données utilisateurs (niveaux, économie)
- Historique de modération

### Déploiement Production

1. Utilisez un service comme Heroku, Railway ou VPS
2. Configurez les variables d'environnement
3. Utilisez MongoDB Atlas pour la base de données
4. Configurez un domaine pour le dashboard

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- Inspiré par [Darling Bot](https://github.com/eckigerluca/darling)
- Utilise [Discord.js](https://discord.js.org/) pour l'API Discord
- Dashboard construit avec Express.js et EJS

## 📞 Support

- **Discord**: Rejoignez notre serveur de support
- **Email**: support@tenshi-bot.xyz
- **Issues**: [GitHub Issues](https://github.com/votre-username/tenshi-bot/issues)

---

⭐ N'oubliez pas de donner une étoile si ce projet vous plaît !
