import { readdirSync } from 'fs';
import { join } from 'path';
import { pathToFileURL } from 'url';
import type { Client } from 'discord.js';
import { logger } from '@/utils/logger';

// Extended Client interface to include commands
interface ExtendedClient extends Client {
  commands: Map<string, unknown>;
}

/**
 * Dynamically loads all event files from the events directory
 */
export async function loadEvents(client: ExtendedClient): Promise<void> {
  const eventsPath = join(__dirname, '../events');

  try {
    const eventFiles = readdirSync(eventsPath).filter(
      (file: string) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'),
    );

    let eventCount = 0;

    for (const file of eventFiles) {
      const filePath = join(eventsPath, file);

      try {
        // Dynamically import the event module
        // Convert to file URL for proper ESM loading on Windows
        const fileUrl = pathToFileURL(filePath).href;
        const eventModule = await import(fileUrl);
        const event = eventModule.default || eventModule;

        if (!event.name || !event.execute) {
          logger.warn(`⚠️ Event file ${file} is missing required properties`);
          continue;
        }

        // Register the event listener
        if (event.once) {
          client.once(event.name, (...args: unknown[]) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args: unknown[]) => event.execute(...args, client));
        }

        eventCount++;
        logger.debug(`🎧 Loaded event: ${event.name} from ${file}`);
      } catch (error) {
        logger.error(`❌ Failed to load event ${file}:`, error);
      }
    }

    logger.info(`✅ Successfully loaded ${eventCount} events`);
  } catch (error) {
    logger.error('❌ Error loading events directory:', error);
    throw error;
  }
}
