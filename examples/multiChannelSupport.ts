/**
 * Example: Multi-Channel Support
 * 
 * This example demonstrates how to extend the bot to support
 * multiple messaging platforms (Telegram, Discord, Slack).
 */

import { BotHandler } from '../src/services/botHandler';
import { BotConfig } from '../src/types';

/**
 * Abstract channel adapter interface
 */
export interface ChannelAdapter {
  sendMessage(chatId: string, message: string): Promise<void>;
  parseIncomingMessage(payload: any): ChannelMessage;
  getChannelName(): string;
}

/**
 * Unified message format across channels
 */
export interface ChannelMessage {
  userId: string;
  chatId: string;
  text: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  channel: 'telegram' | 'discord' | 'slack';
}

/**
 * Telegram Channel Adapter
 */
export class TelegramAdapter implements ChannelAdapter {
  private bot: any; // TelegramBot instance

  constructor(_token: string) {
    // Initialize Telegram bot
  }

  async sendMessage(chatId: string, message: string): Promise<void> {
    await this.bot.sendMessage(chatId, message);
  }

  parseIncomingMessage(update: any): ChannelMessage {
    return {
      userId: update.message.from.id.toString(),
      chatId: update.message.chat.id.toString(),
      text: update.message.text,
      username: update.message.from.username,
      firstName: update.message.from.first_name,
      lastName: update.message.from.last_name,
      channel: 'telegram',
    };
  }

  getChannelName(): string {
    return 'telegram';
  }
}

/**
 * Discord Channel Adapter
 */
export class DiscordAdapter implements ChannelAdapter {
  private client: any; // Discord.Client instance

  constructor(_token: string) {
    // Initialize Discord client
  }

  async sendMessage(chatId: string, message: string): Promise<void> {
    const channel = await this.client.channels.fetch(chatId);
    if (channel && 'send' in channel) {
      await channel.send(message);
    }
  }

  parseIncomingMessage(message: any): ChannelMessage {
    return {
      userId: message.author.id,
      chatId: message.channel.id,
      text: message.content,
      username: message.author.username,
      firstName: message.author.username,
      channel: 'discord',
    };
  }

  getChannelName(): string {
    return 'discord';
  }
}

/**
 * Slack Channel Adapter
 */
export class SlackAdapter implements ChannelAdapter {
  private client: any; // Slack WebClient instance

  constructor(_token: string) {
    // Initialize Slack client
  }

  async sendMessage(chatId: string, message: string): Promise<void> {
    await this.client.chat.postMessage({
      channel: chatId,
      text: message,
    });
  }

  parseIncomingMessage(event: any): ChannelMessage {
    return {
      userId: event.user,
      chatId: event.channel,
      text: event.text,
      username: event.username,
      firstName: event.username,
      channel: 'slack',
    };
  }

  getChannelName(): string {
    return 'slack';
  }
}

/**
 * Multi-Channel Bot Handler
 */
export class MultiChannelBotHandler {
  private adapters: Map<string, ChannelAdapter> = new Map();
  private botHandler: BotHandler;
  private config: BotConfig;

  constructor(config: BotConfig) {
    this.config = config;
    this.botHandler = new BotHandler(config);
  }

  /**
   * Register a channel adapter
   */
  registerChannel(adapter: ChannelAdapter): void {
    this.adapters.set(adapter.getChannelName(), adapter);
  }

  /**
   * Handle incoming message from any channel
   */
  async handleChannelMessage(channel: string, payload: any): Promise<void> {
    const adapter = this.adapters.get(channel);
    
    if (!adapter) {
      throw new Error(`Channel adapter not found: ${channel}`);
    }

    // Parse message from channel-specific format
    const message = adapter.parseIncomingMessage(payload);

    // Convert to Telegram message format for BotHandler
    const telegramMessage = this.convertToTelegramMessage(message);

    // Process with existing bot handler
    await this.botHandler.handleMessage(telegramMessage);

    // Note: Response is sent via webhook callback or stored response
    // You may need to modify BotHandler to support custom message sending
  }

  /**
   * Convert unified message to Telegram format
   */
  private convertToTelegramMessage(message: ChannelMessage): any {
    return {
      from: {
        id: parseInt(message.userId),
        username: message.username,
        first_name: message.firstName,
        last_name: message.lastName,
      },
      chat: {
        id: parseInt(message.chatId),
      },
      text: message.text,
    };
  }
}

/**
 * Example Usage in Vercel Functions:
 * 
 * // api/telegram-webhook.ts
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   const config = loadConfig();
 *   const multiBot = new MultiChannelBotHandler(config);
 *   multiBot.registerChannel(new TelegramAdapter(config.telegramToken));
 *   
 *   await multiBot.handleChannelMessage('telegram', req.body);
 *   return res.status(200).json({ ok: true });
 * }
 * 
 * // api/discord-webhook.ts
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   const config = loadConfig();
 *   const multiBot = new MultiChannelBotHandler(config);
 *   multiBot.registerChannel(new DiscordAdapter(process.env.DISCORD_TOKEN!));
 *   
 *   await multiBot.handleChannelMessage('discord', req.body);
 *   return res.status(200).json({ ok: true });
 * }
 * 
 * // api/slack-webhook.ts
 * export default async function handler(req: VercelRequest, res: VercelResponse) {
 *   const config = loadConfig();
 *   const multiBot = new MultiChannelBotHandler(config);
 *   multiBot.registerChannel(new SlackAdapter(process.env.SLACK_TOKEN!));
 *   
 *   await multiBot.handleChannelMessage('slack', req.body);
 *   return res.status(200).json({ ok: true });
 * }
 */

/**
 * Required modifications to BotHandler:
 * 
 * 1. Abstract the sendMessage functionality:
 *    - Accept a MessageSender interface in constructor
 *    - Use messageSender.send() instead of this.bot.sendMessage()
 * 
 * 2. Make the handler channel-agnostic:
 *    - Work with normalized message format
 *    - Don't depend on Telegram-specific features
 * 
 * 3. Store channel information in database:
 *    - Add 'channel' field to user_states table
 *    - Support channel-specific formatting
 */
