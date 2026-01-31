import { BotHandler } from '../services/botHandler';
import { DatabaseService } from '../services/databaseService';
import { AIService } from '../services/aiService';
import TelegramBot from 'node-telegram-bot-api';

// Mock dependencies
jest.mock('../services/databaseService');
jest.mock('../services/aiService');
jest.mock('node-telegram-bot-api');

describe('BotHandler', () => {
  let botHandler: BotHandler;
  let mockDbService: jest.Mocked<DatabaseService>;
  let mockAiService: jest.Mocked<AIService>;
  let mockBot: jest.Mocked<TelegramBot>;

  beforeEach(() => {
    mockDbService = new DatabaseService({
      supabaseUrl: 'test',
      supabaseKey: 'test',
    }) as jest.Mocked<DatabaseService>;

    mockAiService = new AIService({
      provider: 'openai',
      openaiApiKey: 'test',
    }) as jest.Mocked<AIService>;

    mockBot = new TelegramBot('test-token', {
      polling: false,
    }) as jest.Mocked<TelegramBot>;

    botHandler = new BotHandler(mockBot, mockDbService, mockAiService);
  });

  describe('handleMessage', () => {
    const mockMessage = {
      message_id: 1,
      from: { id: 123, is_bot: false, first_name: 'Test' },
      chat: { id: 456, type: 'private' as const },
      date: 1234567890,
      text: 'Hello bot',
    };

    it('should handle message for new user', async () => {
      mockDbService.getUserContext.mockResolvedValue(null);
      mockDbService.createUserContext.mockResolvedValue({
        userId: 123,
        chatId: 456,
        currentState: 'idle',
        conversationHistory: [],
        lastInteraction: '2024-01-01T00:00:00.000Z',
      });
      mockAiService.generateResponse.mockResolvedValue({
        content: 'Hello!',
        provider: 'openai',
      });
      mockDbService.updateUserContext.mockResolvedValue({
        userId: 123,
        chatId: 456,
        currentState: 'idle',
        conversationHistory: [],
        lastInteraction: '2024-01-01T00:00:00.000Z',
      });
      mockBot.sendMessage.mockResolvedValue({} as any);

      await botHandler.handleMessage(mockMessage);

      expect(mockDbService.createUserContext).toHaveBeenCalledWith(123, 456);
      expect(mockAiService.generateResponse).toHaveBeenCalled();
      expect(mockBot.sendMessage).toHaveBeenCalledWith(456, 'Hello!');
    });

    it('should handle message for existing user', async () => {
      mockDbService.getUserContext.mockResolvedValue({
        userId: 123,
        chatId: 456,
        currentState: 'idle',
        conversationHistory: [
          { role: 'user', content: 'Previous', timestamp: '2024-01-01T00:00:00.000Z' },
        ],
        lastInteraction: '2024-01-01T00:00:00.000Z',
      });
      mockAiService.generateResponse.mockResolvedValue({
        content: 'Response',
        provider: 'openai',
      });
      mockDbService.updateUserContext.mockResolvedValue({
        userId: 123,
        chatId: 456,
        currentState: 'idle',
        conversationHistory: [],
        lastInteraction: '2024-01-01T00:00:00.000Z',
      });
      mockBot.sendMessage.mockResolvedValue({} as any);

      await botHandler.handleMessage(mockMessage);

      expect(mockDbService.getUserContext).toHaveBeenCalledWith(123, 456);
      expect(mockAiService.generateResponse).toHaveBeenCalled();
    });

    it('should reject messages that are too long', async () => {
      const longMessage = {
        ...mockMessage,
        text: 'a'.repeat(4001),
      };

      mockBot.sendMessage.mockResolvedValue({} as any);

      await botHandler.handleMessage(longMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        456,
        expect.stringContaining('too long')
      );
      expect(mockAiService.generateResponse).not.toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockDbService.getUserContext.mockRejectedValue(new Error('Database error'));
      mockBot.sendMessage.mockResolvedValue({} as any);

      await botHandler.handleMessage(mockMessage);

      expect(mockBot.sendMessage).toHaveBeenCalledWith(
        456,
        expect.stringContaining('error')
      );
    });
  });
});
