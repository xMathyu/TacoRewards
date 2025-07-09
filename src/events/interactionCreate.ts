import { Events, Interaction } from 'discord.js';
import { logger } from '@/utils/logger';
import type { Command, ExtendedClient } from '@/types/command';

/**
 * Handle slash command interactions
 */
export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction, client: ExtendedClient): Promise<void> {
    // Only handle slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName) as Command;

    if (!command) {
      logger.warn(`❌ Unknown command: ${interaction.commandName}`);
      await interaction.reply({
        content: "🤔 I don't recognize that command! Try `/help` to see what I can do.",
        ephemeral: true,
      });
      return;
    }

    try {
      // Check if command is admin-only
      if (command.adminOnly) {
        const adminIds = process.env['ADMIN_USER_IDS']?.split(',') || [];
        if (!adminIds.includes(interaction.user.id)) {
          await interaction.reply({
            content: "🚫 You don't have permission to use this command!",
            ephemeral: true,
          });
          return;
        }
      }

      // Check permissions if specified
      if (command.permissions && interaction.guild) {
        const member = interaction.guild.members.cache.get(interaction.user.id);
        if (member && !member.permissions.has(command.permissions)) {
          await interaction.reply({
            content: "🚫 You don't have the required permissions to use this command!",
            ephemeral: true,
          });
          return;
        }
      }

      // Execute the command
      await command.execute(interaction, client);

      logger.info(
        `📝 Command executed: ${interaction.commandName} by ${interaction.user.username} ` +
          `in ${interaction.guild?.name || 'DM'}`,
      );
    } catch (error) {
      logger.error(`❌ Error executing command ${interaction.commandName}:`, error);

      const errorMessage = {
        content:
          '😅 Something went wrong while executing that command! Our taco chefs have been notified.',
        ephemeral: true,
      };

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(errorMessage);
        } else {
          await interaction.reply(errorMessage);
        }
      } catch (followUpError) {
        logger.error('❌ Failed to send error message:', followUpError);
      }
    }
  },
};
