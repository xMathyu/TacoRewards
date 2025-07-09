import { Schema, model, Document } from 'mongoose';

/**
 * Interface for TacoTransaction document
 */
export interface ITacoTransaction extends Document {
  giverId: string;
  receiverId: string;
  guildId: string;
  channelId: string;
  amount: number;
  reason?: string;
  timestamp: Date;
  acknowledged: boolean;
}

/**
 * TacoTransaction schema for tracking all taco giving activities
 */
const tacoTransactionSchema = new Schema<ITacoTransaction>(
  {
    giverId: {
      type: String,
      required: true,
      index: true,
    },
    receiverId: {
      type: String,
      required: true,
      index: true,
    },
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    channelId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    reason: {
      type: String,
      maxlength: 200,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    acknowledged: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes separately
tacoTransactionSchema.index({ guildId: 1, timestamp: -1 }); // For guild activity queries
tacoTransactionSchema.index({ giverId: 1, timestamp: -1 }); // For user giving history
tacoTransactionSchema.index({ receiverId: 1, timestamp: -1 }); // For user receiving history

export const TacoTransaction = model<ITacoTransaction>('TacoTransaction', tacoTransactionSchema);
