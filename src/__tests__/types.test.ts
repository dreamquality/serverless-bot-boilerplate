import {
  DialogState,
  ConversationMessage,
  AIProvider,
  AIConfig,
  AIResponse,
  BotConfig,
  BotMachineContext,
  BotMachineEvent,
} from '../types';

describe('Types', () => {
  describe('DialogState', () => {
    it('should have valid dialog states', () => {
      const states: DialogState[] = ['idle', 'waiting', 'processing', 'responded'];
      states.forEach((state) => {
        expect(['idle', 'waiting', 'processing', 'responded']).toContain(state);
      });
    });
  });

  describe('ConversationMessage', () => {
    it('should create valid conversation message', () => {
      const message: ConversationMessage = {
        role: 'user',
        content: 'Hello',
        timestamp: '2024-01-01T00:00:00.000Z',
      };
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello');
      expect(message.timestamp).toBe('2024-01-01T00:00:00.000Z');
    });

    it('should support all roles', () => {
      const roles: ConversationMessage['role'][] = ['user', 'assistant', 'system'];
      roles.forEach((role) => {
        const message: ConversationMessage = {
          role,
          content: 'Test',
          timestamp: '2024-01-01T00:00:00.000Z',
        };
        expect(message.role).toBe(role);
      });
    });
  });

  describe('AIProvider', () => {
    it('should have valid AI providers', () => {
      const providers: AIProvider[] = ['openai', 'openrouter', 'claude'];
      providers.forEach((provider) => {
        expect(['openai', 'openrouter', 'claude']).toContain(provider);
      });
    });
  });

  describe('AIConfig', () => {
    it('should create valid AI config', () => {
      const config: AIConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      };
      expect(config.provider).toBe('openai');
      expect(config.apiKey).toBe('test-key');
      expect(config.model).toBe('gpt-4');
    });
  });

  describe('AIResponse', () => {
    it('should create valid AI response', () => {
      const response: AIResponse = {
        content: 'Test response',
        tokensUsed: 100,
        model: 'gpt-4',
      };
      expect(response.content).toBe('Test response');
      expect(response.tokensUsed).toBe(100);
    });
  });

  describe('BotConfig', () => {
    it('should create valid bot config', () => {
      const config: BotConfig = {
        telegramToken: 'test-token',
        aiConfig: {
          provider: 'openai',
          apiKey: 'test-key',
          model: 'gpt-4',
        },
        supabase: {
          url: 'https://test.supabase.co',
          key: 'test-key',
        },
      };
      expect(config.telegramToken).toBe('test-token');
      expect(config.aiConfig.provider).toBe('openai');
      expect(config.supabase.url).toBe('https://test.supabase.co');
    });
  });

  describe('BotMachineContext', () => {
    it('should create valid bot machine context', () => {
      const context: BotMachineContext = {
        userId: 123,
        chatId: 456,
        message: 'Hello',
        conversationHistory: [],
      };
      expect(context.userId).toBe(123);
      expect(context.chatId).toBe(456);
      expect(context.message).toBe('Hello');
    });
  });

  describe('BotMachineEvent', () => {
    it('should create MESSAGE_RECEIVED event', () => {
      const event: BotMachineEvent = {
        type: 'MESSAGE_RECEIVED',
        message: 'Test message',
      };
      expect(event.type).toBe('MESSAGE_RECEIVED');
      expect(event.message).toBe('Test message');
    });

    it('should create AI_RESPONSE_SUCCESS event', () => {
      const event: BotMachineEvent = {
        type: 'AI_RESPONSE_SUCCESS',
        response: 'AI response',
      };
      expect(event.type).toBe('AI_RESPONSE_SUCCESS');
      expect(event.response).toBe('AI response');
    });

    it('should create AI_RESPONSE_ERROR event', () => {
      const event: BotMachineEvent = {
        type: 'AI_RESPONSE_ERROR',
        error: 'Error message',
      };
      expect(event.type).toBe('AI_RESPONSE_ERROR');
      expect(event.error).toBe('Error message');
    });

    it('should create RESET event', () => {
      const event: BotMachineEvent = {
        type: 'RESET',
      };
      expect(event.type).toBe('RESET');
    });
  });
});
