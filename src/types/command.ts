import type {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionResolvable,
  Client,
  Collection,
} from 'discord.js';

/**
 * Extended Discord client with additional properties
 */
export interface ExtendedClient extends Client {
  commands: Collection<string, Command>;
}

/**
 * Base interface for all bot commands
 */
export interface Command {
  /** The slash command data */
  data: SlashCommandBuilder;

  /** Required permissions to use this command */
  permissions?: PermissionResolvable[];

  /** Whether this command is admin-only */
  adminOnly?: boolean;

  /** Cooldown in milliseconds */
  cooldown?: number;

  /** Command execution function */
  execute: (interaction: ChatInputCommandInteraction, client: ExtendedClient) => Promise<void>;
}

/**
 * Command category types
 */
export enum CommandCategory {
  TACO = 'taco',
  ADMIN = 'admin',
  STATS = 'stats',
  FUN = 'fun',
  UTILITY = 'utility',
}

/**
 * Command execution context
 */
export interface CommandContext {
  interaction: ChatInputCommandInteraction;
  client: Client;
  args: Record<string, unknown>;
}

/**
 * Command registration data
 */
export interface CommandRegistration {
  name: string;
  category: CommandCategory;
  enabled: boolean;
  guildOnly?: boolean;
}
