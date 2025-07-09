import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
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
export async function loadCommands(client: ExtendedClient): Promise<void> {
  const commandsPath = join(__dirname, '../commands');

  try {
    const commandCategories = readdirSync(commandsPath, { withFileTypes: true })
      .filter((dirent: { isDirectory: () => boolean }) => dirent.isDirectory())
      .map((dirent: { name: string }) => dirent.name);

    let commandCount = 0;

    for (const category of commandCategories) {
      const categoryPath = join(commandsPath, category);
      const commandFiles = readdirSync(categoryPath).filter(
        (file: string) => file.endsWith('.ts') || file.endsWith('.js'),
      );

      for (const file of commandFiles) {
        const filePath = join(categoryPath, file);

        try {
          // Dynamically import the command module
          // Convert to file URL for proper ESM loading on Windows
          const fileUrl = pathToFileURL(filePath).href;
          const commandModule = await import(fileUrl);
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
export async function reloadCommand(client: ExtendedClient, commandName: string): Promise<boolean> {
  try {
    // For ESM, we need to construct the full path and convert to file URL
    const commandPath = join(__dirname, `../commands/${commandName}`);
    const fileUrl = pathToFileURL(commandPath).href;

    // Reload the command
    const commandModule = await import(fileUrl);
    const command: Command = commandModule.default || commandModule;

    client.commands.set(command.data.name, command);
    logger.info(`🔄 Reloaded command: ${commandName}`);
    return true;
  } catch (error) {
    logger.error(`❌ Failed to reload command ${commandName}:`, error);
    return false;
  }
}
