import { readdirSync } from 'fs';
import { join } from 'path';
import type { Client } from 'discord.js';
import type { Command } from '@/types/command';
import { logger } from '@/utils/logger';

// Extended Client interface to include commands
interface ExtendedClient extends Client {
  commands: Map<string, Command>;
}

/**
 * Dynamically loads all command files from the commands directory
 */
export function loadCommands(client: ExtendedClient): void {
  const commandsPath = join(__dirname, '../commands');

  logger.debug(`📂 Looking for commands in: ${commandsPath}`);

  try {
    const commandCategories = readdirSync(commandsPath, { withFileTypes: true })
      .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
      .map((dirent: { name: string }) => dirent.name);

    let commandCount = 0;

    for (const category of commandCategories) {
      const categoryPath = join(commandsPath, category);
      logger.debug(`📁 Scanning category: ${category} at ${categoryPath}`);
      const commandFiles = readdirSync(categoryPath).filter(
        (file: string) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'),
      );

      logger.debug(`📄 Found command files: ${commandFiles.join(', ')}`);

      for (const file of commandFiles) {
        const filePath = join(categoryPath, file);
        logger.debug(`📥 Attempting to load: ${filePath}`);

        try {
          // Use require for better compatibility with module-alias
          // Clear require cache to allow reloading
          delete require.cache[require.resolve(filePath)];
          const commandModule = require(filePath);
          const command: Command = commandModule.default || commandModule;

          if (!command.data || !command.execute) {
            logger.warn(`⚠️ Command file ${file} is missing required properties`);
            continue;
          }

          // Add command to client collection
          client.commands.set(command.data.name, command);
          commandCount++;

          logger.debug(`📝 Loaded command: ${command.data.name} from ${category}/${file}`);
        } catch (error) {
          logger.error(`❌ Failed to load command ${file}:`, error);
        }
      }
    }

    logger.info(`✅ Successfully loaded ${commandCount} commands`);
  } catch (error) {
    logger.error('❌ Error loading commands directory:', error);
    throw error;
  }
}

/**
 * Reloads a specific command by name
 */
export function reloadCommand(client: ExtendedClient, commandName: string): boolean {
  try {
    // Construct the full path
    const commandPath = join(__dirname, `../commands/${commandName}`);

    // Clear require cache and reload
    delete require.cache[require.resolve(commandPath)];
    const commandModule = require(commandPath);
    const command: Command = commandModule.default || commandModule;

    client.commands.set(command.data.name, command);
    logger.info(`🔄 Reloaded command: ${commandName}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to reload command ${commandName}:`, error);
    return false;
  }
}
