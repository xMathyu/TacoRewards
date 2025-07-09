import { User, IUser } from '@/database/models/User';
import { logger } from '@/utils/logger';

/**
 * Service for managing user data and statistics
 */
export class UserService {
  /**
   * Get or create a user document for a guild
   */
  async getOrCreateUser(userId: string, guildId: string): Promise<IUser> {
    try {
      let user = await User.findOne({ userId, guildId });

      if (!user) {
        user = new User({
          userId,
          guildId,
          tacosGiven: 0,
          tacosReceived: 0,
          achievements: [],
          joinedAt: new Date(),
          lastActiveAt: new Date(),
          preferences: {
            receiveNotifications: true,
            publicStats: true,
          },
        });

        await user.save();
        logger.info(`👤 Created new user profile for ${userId} in guild ${guildId}`);
      } else {
        // Update last active timestamp
        user.lastActiveAt = new Date();
        await user.save();
      }

      return user;
    } catch (error) {
      logger.error('Error in getOrCreateUser:', error);
      throw error;
    }
  }

  /**
   * Update user statistics
   */
  async updateStats(
    userId: string,
    guildId: string,
    updates: Partial<Pick<IUser, 'tacosGiven' | 'tacosReceived'>>,
  ): Promise<IUser> {
    try {
      const user = await this.getOrCreateUser(userId, guildId);

      if (updates.tacosGiven !== undefined) {
        user.tacosGiven += updates.tacosGiven;
      }

      if (updates.tacosReceived !== undefined) {
        user.tacosReceived += updates.tacosReceived;
      }

      user.lastActiveAt = new Date();
      await user.save();

      // Check for new achievements
      await this.checkAchievements(user);

      return user;
    } catch (error) {
      logger.error('Error in updateStats:', error);
      throw error;
    }
  }

  /**
   * Get leaderboard data for a guild
   */
  async getLeaderboard(
    guildId: string,
    type: 'received' | 'given' = 'received',
    limit: number = 10,
  ): Promise<IUser[]> {
    try {
      const sortField = type === 'received' ? 'tacosReceived' : 'tacosGiven';
      const sortOrder = -1; // Descending order

      const users = await User.find({
        guildId,
        'preferences.publicStats': true,
        [sortField]: { $gt: 0 }, // Only include users with tacos
      })
        .sort({ [sortField]: sortOrder })
        .limit(limit);

      return users;
    } catch (error) {
      logger.error('Error in getLeaderboard:', error);
      throw error;
    }
  }

  /**
   * Get user rank in guild
   */
  async getUserRank(
    userId: string,
    guildId: string,
    type: 'received' | 'given' = 'received',
  ): Promise<number> {
    try {
      const user = await this.getOrCreateUser(userId, guildId);
      const sortField = type === 'received' ? 'tacosReceived' : 'tacosGiven';
      const userScore = user[sortField];

      const rank = await User.countDocuments({
        guildId,
        [sortField]: { $gt: userScore },
        'preferences.publicStats': true,
      });

      return rank + 1; // +1 because rank is 0-indexed
    } catch (error) {
      logger.error('Error in getUserRank:', error);
      throw error;
    }
  }

  /**
   * Check and award achievements
   */
  private async checkAchievements(user: IUser): Promise<void> {
    try {
      const newAchievements: string[] = [];

      // First taco given
      if (user.tacosGiven >= 1 && !user.achievements.includes('FIRST_TACO_GIVEN')) {
        newAchievements.push('FIRST_TACO_GIVEN');
      }

      // First taco received
      if (user.tacosReceived >= 1 && !user.achievements.includes('FIRST_TACO_RECEIVED')) {
        newAchievements.push('FIRST_TACO_RECEIVED');
      }

      // Generous giver (50+ tacos given)
      if (user.tacosGiven >= 50 && !user.achievements.includes('GENEROUS_GIVER')) {
        newAchievements.push('GENEROUS_GIVER');
      }

      // Popular member (100+ tacos received)
      if (user.tacosReceived >= 100 && !user.achievements.includes('POPULAR_MEMBER')) {
        newAchievements.push('POPULAR_MEMBER');
      }

      // Taco master (500+ total tacos)
      if (
        user.tacosGiven + user.tacosReceived >= 500 &&
        !user.achievements.includes('TACO_MASTER')
      ) {
        newAchievements.push('TACO_MASTER');
      }

      if (newAchievements.length > 0) {
        user.achievements.push(...newAchievements);
        await user.save();

        logger.info(
          `🏆 User ${user.userId} earned ${newAchievements.length} new achievement(s): ${newAchievements.join(', ')}`,
        );
      }
    } catch (error) {
      logger.error('Error checking achievements:', error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    userId: string,
    guildId: string,
    preferences: Partial<IUser['preferences']>,
  ): Promise<IUser> {
    try {
      const user = await this.getOrCreateUser(userId, guildId);

      user.preferences = { ...user.preferences, ...preferences };
      await user.save();

      return user;
    } catch (error) {
      logger.error('Error in updatePreferences:', error);
      throw error;
    }
  }

  /**
   * Get user stats with ranking information
   */
  async getUserStatsWithRank(
    userId: string,
    guildId: string,
  ): Promise<{
    user: IUser;
    receivedRank: number;
    givenRank: number;
    totalUsers: number;
  }> {
    try {
      const user = await this.getOrCreateUser(userId, guildId);

      const [receivedRank, givenRank, totalUsers] = await Promise.all([
        this.getUserRank(userId, guildId, 'received'),
        this.getUserRank(userId, guildId, 'given'),
        User.countDocuments({ guildId, 'preferences.publicStats': true }),
      ]);

      return {
        user,
        receivedRank,
        givenRank,
        totalUsers,
      };
    } catch (error) {
      logger.error('Error in getUserStatsWithRank:', error);
      throw error;
    }
  }
}
