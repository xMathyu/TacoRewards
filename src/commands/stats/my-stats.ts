import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import type { Command, ExtendedClient } from '@/types/command';
import { UserService } from '@/services/UserService';
import { logger } from '@/utils/logger';

/**
 * View personal taco statistics and achievements
 */
const myStatsCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('my-stats')
    .setDescription('📊 View your taco statistics and achievements')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription("View another user's stats (optional)")
        .setRequired(false),
    ) as SlashCommandBuilder,

  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    try {
      await interaction.deferReply();

      const targetUser = interaction.options.getUser('user') ?? interaction.user;
      const isOwnStats = targetUser.id === interaction.user.id;

      if (targetUser.bot) {
        const embed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('🤖 Bot Stats')
          .setDescription(
            "Bots don't have taco stats! They're powered by electricity, not tacos! ⚡🌮",
          )
          .setFooter({ text: 'Try checking a human user instead!' });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const userService = new UserService();
      const stats = await userService.getUserStatsWithRank(targetUser.id, interaction.guildId!);

      // Check if user has private stats
      if (!isOwnStats && !stats.user.preferences.publicStats) {
        const embed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('🔒 Private Profile')
          .setDescription(
            `${targetUser.displayName} has chosen to keep their taco stats private! 🙈`,
          )
          .setFooter({ text: 'Respect their privacy and taco choices!' });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Create achievement display
      const achievementEmojis: Record<string, string> = {
        FIRST_TACO_GIVEN: '🌮',
        FIRST_TACO_RECEIVED: '🎁',
        GENEROUS_GIVER: '💝',
        POPULAR_MEMBER: '⭐',
        TACO_MASTER: '👑',
        HELPING_HAND: '🤝',
        COMMUNITY_BUILDER: '🏗️',
        TACO_VETERAN: '🎖️',
      };

      const achievementDisplay =
        stats.user.achievements.length > 0
          ? stats.user.achievements
              .map(
                (achievement: string) =>
                  `${achievementEmojis[achievement] || '🏆'} ${achievement.replace(/_/g, ' ')}`,
              )
              .join('\n')
          : '*No achievements yet - start giving and receiving tacos! 🌮*';

      // Calculate percentiles
      const receivedPercentile = Math.round(
        ((stats.totalUsers - stats.receivedRank + 1) / stats.totalUsers) * 100,
      );
      const givenPercentile = Math.round(
        ((stats.totalUsers - stats.givenRank + 1) / stats.totalUsers) * 100,
      );

      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle(`🌮 ${isOwnStats ? 'Your' : `${targetUser.displayName}'s`} Taco Stats`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          {
            name: '🎁 Tacos Received',
            value: `**${stats.user.tacosReceived}** tacos\n#${stats.receivedRank} of ${stats.totalUsers} (${receivedPercentile}th percentile)`,
            inline: true,
          },
          {
            name: '💝 Tacos Given',
            value: `**${stats.user.tacosGiven}** tacos\n#${stats.givenRank} of ${stats.totalUsers} (${givenPercentile}th percentile)`,
            inline: true,
          },
          {
            name: '🏆 Achievements',
            value: achievementDisplay,
            inline: false,
          },
          {
            name: '📅 Member Since',
            value: `<t:${Math.floor(stats.user.joinedAt.getTime() / 1000)}:D>`,
            inline: true,
          },
          {
            name: '⏰ Last Active',
            value: `<t:${Math.floor(stats.user.lastActiveAt.getTime() / 1000)}:R>`,
            inline: true,
          },
        )
        .setTimestamp()
        .setFooter(
          client.user
            ? {
                text: isOwnStats
                  ? 'Keep spreading the taco love! 🌮💕'
                  : `Stats requested by ${interaction.user.displayName}`,
                iconURL: client.user.displayAvatarURL(),
              }
            : {
                text: isOwnStats
                  ? 'Keep spreading the taco love! 🌮💕'
                  : `Stats requested by ${interaction.user.displayName}`,
              },
        );

      // Add progress towards next achievement
      if (isOwnStats) {
        let nextGoal = '';

        if (stats.user.tacosReceived < 10) {
          nextGoal = `Give ${10 - stats.user.tacosReceived} more tacos to reach 10! 🎯`;
        } else if (stats.user.tacosReceived < 50) {
          nextGoal = `Receive ${50 - stats.user.tacosReceived} more tacos to unlock Generous Giver! 🎯`;
        } else if (stats.user.tacosReceived < 100) {
          nextGoal = `Receive ${100 - stats.user.tacosReceived} more tacos to become Popular Member! 🎯`;
        }

        if (nextGoal) {
          embed.addFields({
            name: '🎯 Next Goal',
            value: nextGoal,
            inline: false,
          });
        }
      }

      await interaction.editReply({ embeds: [embed] });

      logger.info(`📊 ${interaction.user.username} viewed stats for ${targetUser.username}`);
    } catch (error) {
      logger.error('Error in my-stats command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('😅 Stats Loading Failed')
        .setDescription(
          "Couldn't load the taco stats right now. Our taco counters might be taking a break!",
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

export default myStatsCommand;
