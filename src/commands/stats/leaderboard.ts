import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import type { Command, ExtendedClient } from '@/types/command';
import { UserService } from '@/services/UserService';
import { logger } from '@/utils/logger';

/**
 * Display server leaderboards for taco statistics
 */
const leaderboardCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 View the server taco leaderboards')
    .addStringOption(option =>
      option
        .setName('type')
        .setDescription('Type of leaderboard to display')
        .setRequired(false)
        .addChoices(
          { name: '🎁 Most Tacos Received', value: 'received' },
          { name: '💝 Most Tacos Given', value: 'given' },
        ),
    )
    .addIntegerOption(option =>
      option
        .setName('limit')
        .setDescription('Number of users to display (1-20)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    try {
      await interaction.deferReply();

      const type = (interaction.options.getString('type') as 'received' | 'given') ?? 'received';
      const limit = interaction.options.getInteger('limit') ?? 10;

      const userService = new UserService();
      const leaderboard = await userService.getLeaderboard(interaction.guildId!, type, limit);

      if (leaderboard.length === 0) {
        const embed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('🌮 Empty Leaderboard')
          .setDescription(
            'No taco stats to display yet! 🤔\n\n' +
              'Start giving tacos to your awesome teammates:\n' +
              '`/give @someone 1 for being amazing!`',
          )
          .setFooter({ text: 'Be the first to spread some taco love! 💕' });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Create leaderboard display
      const typeDisplay = type === 'received' ? 'Most Tacos Received' : 'Most Tacos Given';
      const emoji = type === 'received' ? '🎁' : '💝';

      const leaderboardText = leaderboard
        .map((user, index) => {
          const count = type === 'received' ? user.tacosReceived : user.tacosGiven;
          const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : `**${index + 1}.**`;
          return `${medal} <@${user.userId}> - **${count}** taco${count === 1 ? '' : 's'}`;
        })
        .join('\n');

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`🏆 ${typeDisplay}`)
        .setDescription(leaderboardText)
        .addFields(
          {
            name: '📊 Quick Stats',
            value: `Showing top ${leaderboard.length} ${type === 'received' ? 'receivers' : 'givers'}`,
            inline: true,
          },
          {
            name: '🌮 Total Tacos',
            value: leaderboard
              .reduce(
                (sum, user) => sum + (type === 'received' ? user.tacosReceived : user.tacosGiven),
                0,
              )
              .toString(),
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter(
          client.user
            ? {
                text: `${emoji} Keep spreading the taco love!`,
                iconURL: client.user.displayAvatarURL(),
              }
            : {
                text: `${emoji} Keep spreading the taco love!`,
              },
        );

      // Add server info if available
      if (interaction.guild) {
        embed.setThumbnail(interaction.guild.iconURL());
        const guildIconURL = interaction.guild.iconURL();
        if (guildIconURL) {
          embed.setAuthor({
            name: `${interaction.guild.name} Leaderboard`,
            iconURL: guildIconURL,
          });
        } else {
          embed.setAuthor({
            name: `${interaction.guild.name} Leaderboard`,
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });

      logger.info(
        `🏆 ${interaction.user.username} viewed ${type} leaderboard in ${interaction.guild?.name}`,
      );
    } catch (error) {
      logger.error('Error in leaderboard command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('😅 Leaderboard Loading Failed')
        .setDescription(
          "Couldn't load the leaderboard right now. Our taco scorekeepers might be on break!",
        )
        .setFooter({ text: 'Please try again in a moment' });

      if (interaction.deferred) {
        await interaction.editReply({ embeds: [errorEmbed] });
      } else {
        await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }
    }
  },
};

export default leaderboardCommand;
