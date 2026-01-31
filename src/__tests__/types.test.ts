import {
  ConversationMessage,
  UserContext,
  AIResponse,
  BotConfig,
  DatabaseConfig,
  AIConfig,
} from '../types';

describe('Type Definitions', () => {
  describe('ConversationMessage', () => {
    it('should accept valid user message', () => {
      const message: ConversationMessage = {
        role: 'user',
        content: 'Hello',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(typeof message.timestamp).toBe('string');
    });

    it('should accept valid assistant message', () => {
      const message: ConversationMessage = {
        role: 'assistant',
        content: 'Hi there!',
        timestamp: '2024-01-01T00:00:00.000Z',
      };

      expect(message.role).toBe('assistant');
    });
  });

  describe('UserContext', () => {
    it('should accept valid user context', () => {
      const context: UserContext = {
        userId: 123,
        chatId: 456,
        currentState: 'idle',
        conversationHistory: [],
        lastInteraction: '2024-01-01T00:00:00.000Z',
      };

      expect(context.userId).toBe(123);
      expect(context.chatId).toBe(456);
      expect(context.currentState).toBe('idle');
    });

    it('should accept all valid states', () => {
      const states: UserContext['currentState'][] = [
        'idle',
        'waiting',
        'processing',
        'responded',
      ];

      states.forEach((state) => {
        const context: UserContext = {
          userId: 1,
          chatId: 1,
          currentState: state,
          conversationHistory: [],
          lastInteraction: '2024-01-01T00:00:00.000Z',
        };
        expect(context.currentState).toBe(state);
      });
    });
  });

  describe('AIResponse', () => {
    it('should accept valid AI response', () => {
      const response: AIResponse = {
        content: 'Response text',
        provider: 'openai',
      };

      expect(response.content).toBe('Response text');
      expect(response.provider).toBe('openai');
    });

    it('should accept all valid providers', () => {
      const providers: AIResponse['provider'][] = ['openai', 'openrouter', 'claude'];

      providers.forEach((provider) => {
        const response: AIResponse = {
          content: 'Test',
          provider,
        };
        expect(response.provider).toBe(provider);
      });
    });
  });

  describe('BotConfig', () => {
    it('should accept valid bot configuration', () => {
      const config: BotConfig = {
        telegramBotToken: 'test-token',
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
        aiProvider: 'openai',
        openaiApiKey: 'test-openai-key',
      };

      expect(config.telegramBotToken).toBe('test-token');
      expect(config.aiProvider).toBe('openai');
    });

    it('should accept optional API keys', () => {
      const config: BotConfig = {
        telegramBotToken: 'test-token',
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
        aiProvider: 'openrouter',
        openRouterApiKey: 'test-key',
      };

      expect(config.openRouterApiKey).toBe('test-key');
      expect(config.openaiApiKey).toBeUndefined();
    });
  });

  describe('DatabaseConfig', () => {
    it('should accept valid database configuration', () => {
      const config: DatabaseConfig = {
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
      };

      expect(config.supabaseUrl).toBe('https://test.supabase.co');
      expect(config.supabaseKey).toBe('test-key');
    });
  });

  describe('AIConfig', () => {
    it('should accept valid AI configuration for openai', () => {
      const config: AIConfig = {
        provider: 'openai',
        openaiApiKey: 'test-key',
      };

      expect(config.provider).toBe('openai');
      expect(config.openaiApiKey).toBe('test-key');
    });

    it('should accept valid AI configuration for openrouter', () => {
      const config: AIConfig = {
        provider: 'openrouter',
        openRouterApiKey: 'test-key',
      };

      expect(config.provider).toBe('openrouter');
      expect(config.openRouterApiKey).toBe('test-key');
    });

    it('should accept valid AI configuration for claude', () => {
      const config: AIConfig = {
        provider: 'claude',
        claudeApiKey: 'test-key',
      };

      expect(config.provider).toBe('claude');
      expect(config.claudeApiKey).toBe('test-key');
    });
  });
});
