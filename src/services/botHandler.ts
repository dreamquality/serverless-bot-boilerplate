import TelegramBot from 'node-telegram-bot-api';
import { createActor } from 'xstate';
import { botMachine } from '../machines/botMachine';
import { AIService } from './aiService';
import { DatabaseService } from './databaseService';
import { BotConfig } from '../types';
import { logger } from '../utils/logger';

/**
 * Bot Handler Service
 * Manages the bot logic, FSM, and coordinates AI and database services
 */
export class BotHandler {
  private bot: TelegramBot;
  private aiService: AIService;
  private dbService: DatabaseService;

  constructor(config: BotConfig) {
    this.bot = new TelegramBot(config.telegramToken);
    this.aiService = new AIService(config.aiConfig);
    this.dbService = new DatabaseService(config.supabase.url, config.supabase.key);
  }

  /**
   * Get the bot instance for local testing
   */
  getBot(): TelegramBot {
    return this.bot;
  }

  /**
   * Handle incoming Telegram message
   */
  async handleMessage(message: any): Promise<void> {
    try {
      const userId = message.from?.id;
      const chatId = message.chat.id;
      const text = message.text;

      if (!userId || !text) {
        logger.warn('Invalid message received:', message);
        return;
      }

      // Validate message length
      if (text.length > 4000) {
        await this.bot.sendMessage(chatId, 'Message is too long. Please send a shorter message (max 4000 characters).');
        return;
      }

      logger.info(`Processing message from user ${userId}: ${text}`);

      // Handle special commands
      if (text === '/start') {
        await this.handleStartCommand(chatId, userId, message);
        return;
      }

      if (text === '/clear') {
        await this.handleClearCommand(chatId, userId);
        return;
      }

      if (text === '/help') {
        await this.handleHelpCommand(chatId);
        return;
      }

      // Get or create user context
      let userContext = await this.dbService.getUserContext(userId, chatId);
      
      if (!userContext) {
        userContext = await this.dbService.upsertUserContext({
          userId,
          chatId,
          username: message.from?.username,
          firstName: message.from?.first_name,
          lastName: message.from?.last_name,
          state: 'idle',
          conversationHistory: [],
        });
      }

      // Create and start FSM actor
      const actor = createActor(
        botMachine.withContext({
          userId,
          chatId,
          message: '',
          conversationHistory: userContext.conversationHistory,
        })
      );

      actor.start();

      // Update state to waiting
      await this.dbService.updateUserState(userId, chatId, 'waiting');

      // Send MESSAGE_RECEIVED event
      actor.send({ type: 'MESSAGE_RECEIVED', message: text });

      // Update state to processing
      await this.dbService.updateUserState(userId, chatId, 'processing');

      try {
        // Get AI response
        const aiResponse = await this.aiService.generateResponse(
          userContext.conversationHistory,
          text
        );

        logger.debug('AI Response:', aiResponse);

        // Send AI_RESPONSE_SUCCESS event
        actor.send({ type: 'AI_RESPONSE_SUCCESS', response: aiResponse.content });

        // Update state to responded
        await this.dbService.updateUserState(userId, chatId, 'responded');

        // Save conversation to database
        await this.dbService.addConversationMessage(userId, chatId, {
          role: 'user',
          content: text,
          timestamp: new Date().toISOString(),
        });

        await this.dbService.addConversationMessage(userId, chatId, {
          role: 'assistant',
          content: aiResponse.content,
          timestamp: new Date().toISOString(),
        });

        // Send response to user
        await this.bot.sendMessage(chatId, aiResponse.content);

        // Update state back to idle
        await this.dbService.updateUserState(userId, chatId, 'idle');

        logger.info(`Successfully processed message for user ${userId}`);
      } catch (error) {
        logger.error('Error processing AI response:', error);
        
        // Send AI_RESPONSE_ERROR event
        actor.send({ 
          type: 'AI_RESPONSE_ERROR', 
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        // Update state back to idle
        await this.dbService.updateUserState(userId, chatId, 'idle');

        // Send error message to user
        await this.bot.sendMessage(
          chatId,
          'Sorry, I encountered an error processing your message. Please try again.'
        );
      }

      actor.stop();
    } catch (error) {
      logger.error('Error handling message:', error);
      
      if (message.chat.id) {
        try {
          await this.bot.sendMessage(
            message.chat.id,
            'An unexpected error occurred. Please try again later.'
          );
        } catch (sendError) {
          logger.error('Error sending error message:', sendError);
        }
      }
    }
  }

  /**
   * Handle /start command
   */
  private async handleStartCommand(chatId: number, userId: number, message: any): Promise<void> {
    await this.dbService.upsertUserContext({
      userId,
      chatId,
      username: message.from?.username,
      firstName: message.from?.first_name,
      lastName: message.from?.last_name,
      state: 'idle',
      conversationHistory: [],
    });

    const welcomeMessage = `
Welcome to the AI Bot! 🤖

I'm powered by AI and can help you with various tasks. Just send me a message and I'll respond.

Available commands:
/start - Start or reset the bot
/clear - Clear conversation history
/help - Show this help message

Let's chat!
    `.trim();

    await this.bot.sendMessage(chatId, welcomeMessage);
  }

  /**
   * Handle /clear command
   */
  private async handleClearCommand(chatId: number, userId: number): Promise<void> {
    await this.dbService.clearConversationHistory(userId, chatId);
    await this.bot.sendMessage(chatId, 'Conversation history cleared! ✨');
  }

  /**
   * Handle /help command
   */
  private async handleHelpCommand(chatId: number): Promise<void> {
    const helpMessage = `
Available commands:
/start - Start or reset the bot
/clear - Clear conversation history
/help - Show this help message

Just send me any message and I'll respond using AI! 🤖
    `.trim();

    await this.bot.sendMessage(chatId, helpMessage);
  }
}
