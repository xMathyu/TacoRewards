import { TacoTransaction, ITacoTransaction } from '@/database/models/TacoTransaction';
import { logger } from '@/utils/logger';
import { startOfDay, endOfDay } from '@/utils/dateUtils';

/**
 * Interface for taco giving parameters
 */
export interface GiveTacosParams {
  giverId: string;
  receiverId: string;
  guildId: string;
  channelId: string;
  amount: number;
  reason?: string | undefined;
}

/**
 * Service for managing taco transactions and related operations
 */
export class TacoService {
  /**
   * Give tacos from one user to another
   */
  async giveTacos(params: GiveTacosParams): Promise<ITacoTransaction> {
    try {
      const transaction = new TacoTransaction({
        giverId: params.giverId,
        receiverId: params.receiverId,
        guildId: params.guildId,
        channelId: params.channelId,
        amount: params.amount,
        reason: params.reason,
        timestamp: new Date(),
        acknowledged: false,
      });

      await transaction.save();

      logger.info(
        `🌮 Taco transaction: ${params.giverId} → ${params.receiverId} (${params.amount} tacos)`,
      );

      return transaction;
    } catch (error) {
      logger.error('Error in giveTacos:', error);
      throw error;
    }
  }

  /**
   * Get the number of tacos a user has given today
   */
  async getDailyTacosGiven(userId: string, guildId: string): Promise<number> {
    try {
      const today = new Date();
      const startOfToday = startOfDay(today);
      const endOfToday = endOfDay(today);

      const result = await TacoTransaction.aggregate([
        {
          $match: {
            giverId: userId,
            guildId: guildId,
            timestamp: {
              $gte: startOfToday,
              $lte: endOfToday,
            },
          },
        },
        {
          $group: {
            _id: null,
            totalGiven: { $sum: '$amount' },
          },
        },
      ]);

      return result.length > 0 ? result[0].totalGiven : 0;
    } catch (error) {
      logger.error('Error in getDailyTacosGiven:', error);
      throw error;
    }
  }

  /**
   * Get recent taco transactions for a guild
   */
  async getRecentTransactions(guildId: string, limit: number = 10): Promise<ITacoTransaction[]> {
    try {
      const transactions = await TacoTransaction.find({ guildId })
        .sort({ timestamp: -1 })
        .limit(limit);

      return transactions;
    } catch (error) {
      logger.error('Error in getRecentTransactions:', error);
      throw error;
    }
  }

  /**
   * Get user's taco giving history
   */
  async getUserGivingHistory(
    userId: string,
    guildId: string,
    limit: number = 20,
  ): Promise<ITacoTransaction[]> {
    try {
      const transactions = await TacoTransaction.find({
        giverId: userId,
        guildId,
      })
        .sort({ timestamp: -1 })
        .limit(limit);

      return transactions;
    } catch (error) {
      logger.error('Error in getUserGivingHistory:', error);
      throw error;
    }
  }

  /**
   * Get user's taco receiving history
   */
  async getUserReceivingHistory(
    userId: string,
    guildId: string,
    limit: number = 20,
  ): Promise<ITacoTransaction[]> {
    try {
      const transactions = await TacoTransaction.find({
        receiverId: userId,
        guildId,
      })
        .sort({ timestamp: -1 })
        .limit(limit);

      return transactions;
    } catch (error) {
      logger.error('Error in getUserReceivingHistory:', error);
      throw error;
    }
  }

  /**
   * Get guild statistics
   */
  async getGuildStats(guildId: string): Promise<{
    totalTransactions: number;
    totalTacosGiven: number;
    activeUsers: number;
    averageTacosPerTransaction: number;
  }> {
    try {
      const stats = await TacoTransaction.aggregate([
        { $match: { guildId } },
        {
          $group: {
            _id: null,
            totalTransactions: { $sum: 1 },
            totalTacosGiven: { $sum: '$amount' },
            uniqueGivers: { $addToSet: '$giverId' },
            uniqueReceivers: { $addToSet: '$receiverId' },
          },
        },
      ]);

      if (stats.length === 0) {
        return {
          totalTransactions: 0,
          totalTacosGiven: 0,
          activeUsers: 0,
          averageTacosPerTransaction: 0,
        };
      }

      const result = stats[0];
      const allUsers = new Set([...result.uniqueGivers, ...result.uniqueReceivers]);

      return {
        totalTransactions: result.totalTransactions,
        totalTacosGiven: result.totalTacosGiven,
        activeUsers: allUsers.size,
        averageTacosPerTransaction:
          result.totalTransactions > 0
            ? Math.round((result.totalTacosGiven / result.totalTransactions) * 100) / 100
            : 0,
      };
    } catch (error) {
      logger.error('Error in getGuildStats:', error);
      throw error;
    }
  }

  /**
   * Get top taco reasons for a guild
   */
  async getTopReasons(
    guildId: string,
    limit: number = 5,
  ): Promise<Array<{ reason: string; count: number }>> {
    try {
      const reasons = await TacoTransaction.aggregate([
        {
          $match: {
            guildId,
            reason: { $exists: true, $ne: null },
            $expr: { $ne: ['$reason', ''] },
          },
        },
        {
          $group: {
            _id: '$reason',
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: limit },
        {
          $project: {
            reason: '$_id',
            count: 1,
            _id: 0,
          },
        },
      ]);

      return reasons;
    } catch (error) {
      logger.error('Error in getTopReasons:', error);
      throw error;
    }
  }
}
