import { Events } from 'discord.js';
import type { ExtendedClient } from '@/types/command';
import { logger } from '@/utils/logger';

/**
 * Bot ready event - fires when the bot successfully connects to Discord
 */
export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: ExtendedClient): Promise<void> {
    if (!client.user) return;

    logger.info(`🎉 TacoBot is ready! Logged in as ${client.user.tag}`);
    logger.info(`🌮 Serving tacos in ${client.guilds.cache.size} server(s)`);

    // Set bot activity status
    client.user.setActivity('🌮 Spreading taco love!', {
      type: 3, // Watching
    });

    // Log some stats
    const userCount = client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);
    logger.info(`👥 Reaching ${userCount} users across all servers`);

    // Optional: Register slash commands globally on startup
    // This is usually done separately, but can be useful for development
    if (process.env['NODE_ENV'] === 'development') {
      try {
        logger.info('🔄 Refreshing application commands for development...');

        const commands = Array.from(client.commands.values()).map(command => command.data.toJSON());

        // Register commands globally in development
        await client.application?.commands.set(commands);

        logger.info(`✅ Successfully registered ${commands.length} application commands`);
      } catch (error) {
        logger.error('❌ Failed to register application commands:', error);
      }
    }
  },
};
