import { Schema, model, Document } from 'mongoose';

/**
 * Interface for User document
 */
export interface IUser extends Document {
  userId: string;
  guildId: string;
  tacosGiven: number;
  tacosReceived: number;
  achievements: string[];
  joinedAt: Date;
  lastActiveAt: Date;
  preferences: {
    receiveNotifications: boolean;
    publicStats: boolean;
  };
}

/**
 * User schema for storing user statistics and preferences
 */
const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    guildId: {
      type: String,
      required: true,
      index: true,
    },
    tacosGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
    tacosReceived: {
      type: Number,
      default: 0,
      min: 0,
    },
    achievements: [
      {
        type: String,
        enum: [
          'FIRST_TACO_GIVEN',
          'FIRST_TACO_RECEIVED',
          'GENEROUS_GIVER',
          'POPULAR_MEMBER',
          'TACO_MASTER',
          'HELPING_HAND',
          'COMMUNITY_BUILDER',
          'TACO_VETERAN',
        ],
      },
    ],
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      receiveNotifications: {
        type: Boolean,
        default: true,
      },
      publicStats: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  },
);

// Add indexes separately
userSchema.index({ userId: 1, guildId: 1 }, { unique: true }); // Compound unique index for user-guild pairs
userSchema.index({ tacosReceived: -1 }); // For leaderboards
userSchema.index({ tacosGiven: -1 }); // For giver leaderboards

export const User = model<IUser>('User', userSchema);
