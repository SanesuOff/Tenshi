const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const expressLayouts = require("express-ejs-layouts");

class Dashboard {
  constructor() {
    this.app = express();
    this.client = null;
    this.config = null;
  }

  start(client, config) {
    this.client = client;
    this.config = config;

    this.setupMiddleware();
    this.setupPassport();
    this.setupRoutes();
    this.startServer();
  }

  setupMiddleware() {
    // Sécurité
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: [
              "'self'",
              "'unsafe-inline'",
              "https://fonts.googleapis.com",
              "https://cdnjs.cloudflare.com",
            ],
            fontSrc: [
              "'self'",
              "https://fonts.gstatic.com",
              "https://cdnjs.cloudflare.com",
            ],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "https://cdn.discordapp.com"],
          },
        },
      })
    );

    // Compression
    this.app.use(compression());

    // CORS
    this.app.use(cors());

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limite chaque IP à 100 requêtes par fenêtre
    });
    this.app.use(limiter);

    // Body parser
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Session
    this.app.use(
      session({
        secret: this.config.dashboard.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: process.env.NODE_ENV === "production",
          maxAge: 24 * 60 * 60 * 1000, // 24 heures
        },
      })
    );

    // Passport
    this.app.use(passport.initialize());
    this.app.use(passport.session());

    // View engine
    this.app.set("view engine", "ejs");
    this.app.set("views", path.join(__dirname, "views"));

    // Layout configuration
    this.app.use(expressLayouts);
    this.app.set("layout", "layout");

    // Static files
    this.app.use(express.static(path.join(__dirname, "public")));
  }

  setupPassport() {
    passport.serializeUser((user, done) => {
      done(null, user);
    });

    passport.deserializeUser((user, done) => {
      done(null, user);
    });

    passport.use(
      new DiscordStrategy(
        {
          clientID: this.config.clientId,
          clientSecret: this.config.clientSecret,
          callbackURL: `${this.config.dashboard.url}/auth/discord/callback`,
          scope: ["identify", "guilds"],
        },
        (accessToken, refreshToken, profile, done) => {
          return done(null, profile);
        }
      )
    );
  }

  setupRoutes() {
    // Routes d'authentification
    this.app.get("/auth/discord", passport.authenticate("discord"));

    this.app.get(
      "/auth/discord/callback",
      passport.authenticate("discord", { failureRedirect: "/" }),
      (req, res) => res.redirect("/dashboard")
    );

    this.app.get("/logout", (req, res) => {
      req.logout(() => {
        res.redirect("/");
      });
    });

    // Route principale
    this.app.get("/", (req, res) => {
      res.render("index", {
        user: req.user,
        client: this.client,
        config: this.config,
      });
    });

    // Dashboard (protégé)
    this.app.get("/dashboard", this.isAuthenticated, (req, res) => {
      const userGuilds = req.user.guilds.filter(
        (guild) =>
          (guild.permissions & 0x8) === 0x8 || // Administrateur
          (guild.permissions & 0x20) === 0x20 // Gérer le serveur
      );

      res.render("dashboard", {
        user: req.user,
        guilds: userGuilds,
        client: this.client,
        config: this.config,
      });
    });

    // Configuration d'un serveur
    this.app.get(
      "/dashboard/:guildId",
      this.isAuthenticated,
      async (req, res) => {
        try {
          const guildId = req.params.guildId;
          const guild = this.client.guilds.cache.get(guildId);

          if (!guild) {
            return res.status(404).render("error", {
              message: "Serveur non trouvé",
              user: req.user,
            });
          }

          // Vérifier les permissions
          const member = await guild.members.fetch(req.user.id);
          if (!member.permissions.has("Administrator")) {
            return res.status(403).render("error", {
              message: "Vous n'avez pas les permissions nécessaires",
              user: req.user,
            });
          }

          res.render("guild", {
            user: req.user,
            guild: guild,
            client: this.client,
            config: this.config,
          });
        } catch (error) {
          console.error("Erreur lors de l'accès au serveur:", error);
          res.status(500).render("error", {
            message: "Erreur interne du serveur",
            user: req.user,
          });
        }
      }
    );

    // API pour les données du serveur
    this.app.get(
      "/api/guild/:guildId",
      this.isAuthenticated,
      async (req, res) => {
        try {
          const guildId = req.params.guildId;
          const guild = this.client.guilds.cache.get(guildId);

          if (!guild) {
            return res.status(404).json({ error: "Serveur non trouvé" });
          }

          const stats = {
            memberCount: guild.memberCount,
            channelCount: guild.channels.cache.size,
            roleCount: guild.roles.cache.size,
            createdAt: guild.createdAt,
            owner: guild.owner?.user?.tag || "Inconnu",
          };

          res.json(stats);
        } catch (error) {
          console.error("Erreur API:", error);
          res.status(500).json({ error: "Erreur interne du serveur" });
        }
      }
    );

    // API pour récupérer la configuration d'un serveur
    this.app.get(
      "/api/guild/:guildId/config",
      this.isAuthenticated,
      async (req, res) => {
        try {
          const guildId = req.params.guildId;
          const guild = this.client.guilds.cache.get(guildId);

          if (!guild) {
            return res.status(404).json({ error: "Serveur non trouvé" });
          }

          // Vérifier les permissions
          const member = await guild.members.fetch(req.user.id);
          if (!member.permissions.has("Administrator")) {
            return res.status(403).json({ error: "Permissions insuffisantes" });
          }

          // Importer le modèle Guild
          const Guild = require("../models/Guild");

          // Récupérer la configuration existante
          const config = await Guild.findOne({ guildId: guildId });

          if (!config) {
            // Retourner une configuration par défaut
            return res.json({
              general: {
                language: "fr",
                timezone: "Europe/Paris",
                logChannel: "",
              },
              moderation: {
                modLogChannel: "",
                autoMod: [],
                muteRole: "",
              },
              economy: {
                currencyName: "coins",
                currencySymbol: "🪙",
                dailyAmount: "100",
                workAmount: "50",
              },
              leveling: {
                levelChannel: "",
                xpPerMessage: "15",
                xpCooldown: "60",
              },
              welcome: {
                welcomeChannel: "",
                welcomeMessage:
                  "Bienvenue {user} sur {server} ! Tu es le {memberCount}ème membre !",
                welcomeEmbed: false,
                welcomeColor: "#7289da",
              },
            });
          }

          // Retourner la configuration existante
          res.json({
            general: {
              language: config.language || "fr",
              timezone: config.timezone || "Europe/Paris",
              logChannel: config.logChannel || "",
            },
            moderation: {
              modLogChannel: config.moderation?.logChannelId || "",
              autoMod: config.moderation?.autoMod?.enabled
                ? (config.moderation.autoMod.antiSpam ? ["spam"] : [])
                    .concat(config.moderation.autoMod.antiLink ? ["links"] : [])
                    .concat(config.moderation.autoMod.antiCaps ? ["caps"] : [])
                : [],
              muteRole: config.moderation?.muteRole || "",
            },
            economy: {
              currencyName: config.economy?.currencyName || "coins",
              currencySymbol: config.economy?.currency || "🪙",
              dailyAmount: config.economy?.startBalance?.toString() || "100",
              workAmount: config.economy?.workAmount?.toString() || "50",
            },
            leveling: {
              levelChannel: config.leveling?.announceChannelId || "",
              xpPerMessage: config.leveling?.xpRate?.toString() || "15",
              xpCooldown: config.leveling?.xpCooldown?.toString() || "60",
            },
            welcome: {
              welcomeChannel: config.welcome?.channelId || "",
              welcomeMessage:
                config.welcome?.message ||
                "Bienvenue {user} sur {server} ! Tu es le {memberCount}ème membre !",
              welcomeEmbed: config.welcome?.embed || false,
              welcomeColor: config.welcome?.color || "#7289da",
            },
          });
        } catch (error) {
          console.error("Erreur récupération config:", error);
          res.status(500).json({ error: "Erreur lors de la récupération" });
        }
      }
    );

    // API pour sauvegarder la configuration d'un serveur
    this.app.post(
      "/api/guild/:guildId/config",
      this.isAuthenticated,
      async (req, res) => {
        try {
          const guildId = req.params.guildId;
          const guild = this.client.guilds.cache.get(guildId);

          if (!guild) {
            return res.status(404).json({ error: "Serveur non trouvé" });
          }

          // Vérifier les permissions
          const member = await guild.members.fetch(req.user.id);
          if (!member.permissions.has("Administrator")) {
            return res.status(403).json({ error: "Permissions insuffisantes" });
          }

          // Importer le modèle Guild
          const Guild = require("../models/Guild");

          console.log("Données reçues:", req.body);
          console.log("Guild ID:", guildId);

          // Structurer les données selon le schéma
          const configData = {
            guildId: guildId,
            name: guild.name,
            // Configuration générale
            prefix: req.body.prefix || "!",
            // Configuration de bienvenue
            welcome: {
              enabled: req.body.welcomeChannel ? true : false,
              channelId: req.body.welcomeChannel || null,
              message:
                req.body.welcomeMessage || "Bienvenue {user} sur {server}!",
            },
            // Configuration de modération
            moderation: {
              logChannelId: req.body.modLogChannel || null,
              autoMod: {
                enabled: req.body.autoMod ? true : false,
                antiSpam: req.body.autoMod && req.body.autoMod.includes("spam"),
                antiLink:
                  req.body.autoMod && req.body.autoMod.includes("links"),
              },
            },
            // Configuration des niveaux
            leveling: {
              enabled: true,
              announceChannelId: req.body.levelChannel || null,
              xpRate: parseInt(req.body.xpPerMessage) || 15,
            },
            // Configuration de l'économie
            economy: {
              enabled: true,
              currency: req.body.currencySymbol || "💎",
              startBalance: parseInt(req.body.dailyAmount) || 100,
            },
          };

          console.log("Données structurées:", configData);

          const result = await Guild.findOneAndUpdate(
            { guildId: guildId },
            configData,
            { upsert: true, new: true }
          );

          console.log("Résultat de la sauvegarde:", result);

          res.json({ success: true, message: "Configuration sauvegardée" });
        } catch (error) {
          console.error("Erreur sauvegarde config:", error);
          res
            .status(500)
            .json({ error: "Erreur lors de la sauvegarde: " + error.message });
        }
      }
    );
  }

  isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  }

  startServer() {
    const port = this.config.port || 3000;
    this.app.listen(port, () => {
      console.log(`🌐 Dashboard démarré sur le port ${port}`);
      console.log(`📊 Accédez au dashboard: ${this.config.url}`);
    });
  }
}

module.exports = new Dashboard();
