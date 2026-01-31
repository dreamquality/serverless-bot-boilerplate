import { loadConfig, validateConfig } from '../utils/config';

describe('Config Utils', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load configuration from environment variables', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-supabase-key';
      process.env.AI_PROVIDER = 'openai';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const config = loadConfig();

      expect(config.telegramBotToken).toBe('test-bot-token');
      expect(config.supabaseUrl).toBe('https://test.supabase.co');
      expect(config.supabaseKey).toBe('test-supabase-key');
      expect(config.aiProvider).toBe('openai');
      expect(config.openaiApiKey).toBe('test-openai-key');
    });

    it('should use default AI provider when not specified', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      delete process.env.AI_PROVIDER;

      const config = loadConfig();

      expect(config.aiProvider).toBe('openai');
    });

    it('should handle missing optional API keys', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      delete process.env.OPENROUTER_API_KEY;
      delete process.env.CLAUDE_API_KEY;

      const config = loadConfig();

      expect(config.openRouterApiKey).toBeUndefined();
      expect(config.claudeApiKey).toBeUndefined();
    });
  });

  describe('validateConfig', () => {
    it('should validate complete configuration', () => {
      const config = {
        telegramBotToken: 'test-token',
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
        aiProvider: 'openai' as const,
        openaiApiKey: 'test-openai-key',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should throw error when telegram token is missing', () => {
      const config = {
        telegramBotToken: '',
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
        aiProvider: 'openai' as const,
        openaiApiKey: 'test-key',
      };

      expect(() => validateConfig(config)).toThrow('TELEGRAM_BOT_TOKEN');
    });

    it('should throw error when supabase url is missing', () => {
      const config = {
        telegramBotToken: 'test-token',
        supabaseUrl: '',
        supabaseKey: 'test-key',
        aiProvider: 'openai' as const,
        openaiApiKey: 'test-key',
      };

      expect(() => validateConfig(config)).toThrow('SUPABASE_URL');
    });

    it('should throw error when AI provider key is missing', () => {
      const config = {
        telegramBotToken: 'test-token',
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
        aiProvider: 'openai' as const,
        openaiApiKey: '',
      };

      expect(() => validateConfig(config)).toThrow('OPENAI_API_KEY');
    });

    it('should validate openrouter configuration', () => {
      const config = {
        telegramBotToken: 'test-token',
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
        aiProvider: 'openrouter' as const,
        openRouterApiKey: 'test-key',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('should validate claude configuration', () => {
      const config = {
        telegramBotToken: 'test-token',
        supabaseUrl: 'https://test.supabase.co',
        supabaseKey: 'test-key',
        aiProvider: 'claude' as const,
        claudeApiKey: 'test-key',
      };

      expect(() => validateConfig(config)).not.toThrow();
    });
  });
});
