import 'module-alias/register';
import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { connectDatabase } from '@/database/connection';
import { loadCommands } from '@/utils/commandLoader';
import { loadEvents } from '@/utils/eventLoader';
import { logger } from '@/utils/logger';
import type { Command } from '@/types/command';

// Load environment variables
config();

// Validate required environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'MONGODB_URI'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

/**
 * Main TacoBot Discord Client
 * Handles initialization, command loading, and database connection
 */
class TacoBot extends Client {
  public commands: Collection<string, Command>;

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.commands = new Collection();
  }

  /**
   * Initialize the bot with all necessary components
   */
  public async initialize(): Promise<void> {
    try {
      logger.info('🌮 Initializing TacoBot...');

      // Connect to database
      await connectDatabase();
      logger.info('✅ Database connection established');

      // Load commands and events
      loadCommands(this);
      loadEvents(this);

      // Login to Discord
      await this.login(process.env['DISCORD_TOKEN']);
      logger.info('🎉 TacoBot is now online and ready to serve tacos!');
    } catch (error) {
      logger.error('❌ Failed to initialize TacoBot:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown handler
   */
  public async shutdown(): Promise<void> {
    logger.info('🛑 Shutting down TacoBot...');

    try {
      this.destroy();
      // Database connection will be closed by mongoose
      logger.info('✅ TacoBot shut down successfully');
      process.exit(0);
    } catch (error) {
      logger.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  }
}

// Create and initialize the bot
const bot = new TacoBot();

// Handle process termination signals
process.on('SIGINT', () => bot.shutdown());
process.on('SIGTERM', () => bot.shutdown());

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the bot
bot.initialize().catch(error => {
  logger.error('Failed to start TacoBot:', error);
  process.exit(1);
});

export default bot;
