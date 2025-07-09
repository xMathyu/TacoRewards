#!/usr/bin/env node

/**
 * Script to register slash commands with Discord
 * Run this after adding new commands or modifying existing ones
 */

import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join } from 'path';

// Load environment variables
config();

interface Command {
  data: {
    toJSON: () => unknown;
    name: string;
  };
}

async function deployCommands(): Promise<void> {
  const token = process.env.DISCORD_TOKEN;
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!token || !clientId) {
    console.error('❌ Missing DISCORD_TOKEN or DISCORD_CLIENT_ID in environment variables');
    process.exit(1);
  }

  const commands: unknown[] = [];
  const commandsPath = join(__dirname, '../dist/commands');

  try {
    // Read all command categories
    const commandCategories = readdirSync(commandsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log(`📂 Found ${commandCategories.length} command categories`);

    // Load commands from each category
    for (const category of commandCategories) {
      const categoryPath = join(commandsPath, category);
      const commandFiles = readdirSync(categoryPath).filter(file => 
        file.endsWith('.js')
      );

      for (const file of commandFiles) {
        const filePath = join(categoryPath, file);
        
        try {
          const commandModule = await import(filePath);
          const command: Command = commandModule.default || commandModule;

          if (command.data && command.data.toJSON) {
            commands.push(command.data.toJSON());
            console.log(`✅ Loaded command: ${command.data.name}`);
          } else {
            console.warn(`⚠️ Command file ${file} is missing required properties`);
          }
        } catch (error) {
          console.error(`❌ Failed to load command ${file}:`, error);
        }
      }
    }

    console.log(`🚀 Deploying ${commands.length} commands...`);

    // Create REST instance
    const rest = new REST().setToken(token);

    // Deploy commands globally
    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    ) as unknown[];

    console.log(`🎉 Successfully deployed ${data.length} application commands globally!`);

  } catch (error) {
    console.error('❌ Error deploying commands:', error);
    process.exit(1);
  }
}

// Check if script is run directly
if (require.main === module) {
  deployCommands()
    .then(() => {
      console.log('✨ Command deployment completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Command deployment failed:', error);
      process.exit(1);
    });
}

export { deployCommands };
