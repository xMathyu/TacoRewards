import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import type { Command, ExtendedClient } from '@/types/command';
import { TacoService } from '@/services/TacoService';
import { UserService } from '@/services/UserService';
import { logger } from '@/utils/logger';

/**
 * Give tacos to recognize and appreciate other users
 */
const giveCommand: Command = {
  data: new SlashCommandBuilder()
    .setName('give')
    .setDescription('🌮 Give tacos to recognize someone awesome!')
    .addUserOption(option =>
      option
        .setName('user')
        .setDescription('The amazing person to give tacos to')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName('amount')
        .setDescription('Number of tacos to give (1-5)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(5),
    )
    .addStringOption(option =>
      option
        .setName('reason')
        .setDescription('Why are you giving tacos? (optional but encouraged!)')
        .setRequired(false)
        .setMaxLength(200),
    ) as SlashCommandBuilder,

  cooldown: 5000, // 5 seconds cooldown

  async execute(interaction: ChatInputCommandInteraction, client: ExtendedClient): Promise<void> {
    try {
      await interaction.deferReply();

      const giver = interaction.user;
      const receiver = interaction.options.getUser('user', true);
      const amount = interaction.options.getInteger('amount') ?? 1;
      const reason = interaction.options.getString('reason');

      // Validation checks
      if (receiver.id === giver.id) {
        const embed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('🚫 Hold up there!')
          .setDescription(
            "You can't give tacos to yourself! That's like high-fiving yourself... awkward! 😅",
          )
          .setFooter({ text: 'Try appreciating someone else instead!' });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      if (receiver.bot) {
        const embed = new EmbedBuilder()
          .setColor('#FF6B6B')
          .setTitle('🤖 Beep Boop!')
          .setDescription(
            "Bots don't need tacos... they run on electricity! ⚡\nSave your tacos for humans! 😄",
          )
          .setFooter({ text: "Unless it's a very special bot... 🌮" });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Check daily limit
      const tacoService = new TacoService();
      const userService = new UserService();

      const dailyGiven = await tacoService.getDailyTacosGiven(giver.id, interaction.guildId!);
      const maxDaily = parseInt(process.env['MAX_DAILY_TACOS'] || '5', 10);

      if (dailyGiven + amount > maxDaily) {
        const remaining = maxDaily - dailyGiven;
        const embed = new EmbedBuilder()
          .setColor('#FFA500')
          .setTitle('🌮 Taco Limit Reached!')
          .setDescription(
            `Whoa there, generous soul! You've almost reached your daily taco limit.\n\n` +
              `💫 You can give **${remaining}** more taco${remaining === 1 ? '' : 's'} today\n` +
              `🔄 Your limit resets tomorrow!`,
          )
          .setFooter({ text: 'Quality over quantity - make those tacos count! 🎯' });

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Give the tacos!
      await tacoService.giveTacos({
        giverId: giver.id,
        receiverId: receiver.id,
        guildId: interaction.guildId!,
        amount,
        reason: reason || undefined,
        channelId: interaction.channelId,
      });

      // Update user stats
      await userService.updateStats(giver.id, interaction.guildId!, { tacosGiven: amount });
      await userService.updateStats(receiver.id, interaction.guildId!, { tacosReceived: amount });

      // Create success embed
      const embed = new EmbedBuilder()
        .setColor('#4CAF50')
        .setTitle('🌮 Tacos Delivered!')
        .setDescription(
          `**${giver.displayName}** just gave **${amount}** taco${amount === 1 ? '' : 's'} to **${receiver.displayName}**! 🎉\n\n` +
            (reason ? `💭 *"${reason}"*\n\n` : '') +
            `🏆 **${receiver.displayName}** now has **${(await userService.getOrCreateUser(receiver.id, interaction.guildId!)).tacosReceived + amount}** total tacos!`,
        )
        .setThumbnail(receiver.displayAvatarURL())
        .setTimestamp()
        .setFooter(
          client.user
            ? {
                text: `Keep spreading the taco love! 🌮💕`,
                iconURL: client.user.displayAvatarURL(),
              }
            : { text: `Keep spreading the taco love! 🌮💕` },
        );

      // Add some fun reactions
      const reactions = ['🌮', '🎉', '💖', '👏', '⭐'] as const;
      const randomReaction = reactions[Math.floor(Math.random() * reactions.length)]!;

      await interaction.editReply({ embeds: [embed] });

      // Try to react to the message (might fail if no permissions)
      try {
        await interaction.followUp({ content: randomReaction, ephemeral: true });
      } catch (error) {
        // Silently ignore reaction errors
        logger.debug('Could not add reaction:', error);
      }

      logger.info(
        `🌮 ${giver.username} gave ${amount} taco(s) to ${receiver.username} in ${interaction.guild?.name}`,
      );
    } catch (error) {
      logger.error('Error in give command:', error);

      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle('😅 Oops! Taco Delivery Failed')
        .setDescription(
          'Something went wrong while delivering your tacos. Our taco chefs have been notified!',
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

export default giveCommand;
