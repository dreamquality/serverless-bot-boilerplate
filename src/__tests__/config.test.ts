import { loadConfig } from '../utils/config';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('loadConfig', () => {
    it('should load valid config with required env vars', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-bot-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-supabase-key';
      process.env.OPENAI_API_KEY = 'test-openai-key';

      const config = loadConfig();

      expect(config.telegramToken).toBe('test-bot-token');
      expect(config.supabase.url).toBe('https://test.supabase.co');
      expect(config.supabase.key).toBe('test-supabase-key');
      expect(config.aiConfig.provider).toBe('openai');
      expect(config.aiConfig.apiKey).toBe('test-openai-key');
    });

    it('should default to openai provider', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'test-key';

      const config = loadConfig();

      expect(config.aiConfig.provider).toBe('openai');
    });

    it('should throw error if TELEGRAM_BOT_TOKEN is missing', () => {
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';

      expect(() => loadConfig()).toThrow('TELEGRAM_BOT_TOKEN is required');
    });

    it('should throw error if SUPABASE_URL is missing', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.SUPABASE_KEY = 'test-key';

      expect(() => loadConfig()).toThrow('SUPABASE_URL and SUPABASE_KEY are required');
    });

    it('should throw error if API key for provider is missing', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';
      process.env.AI_PROVIDER = 'openai';
      delete process.env.OPENAI_API_KEY;

      expect(() => loadConfig()).toThrow('API key for openai is required');
    });

    it('should support OpenRouter provider', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';
      process.env.AI_PROVIDER = 'openrouter';
      process.env.OPENROUTER_API_KEY = 'test-key';

      const config = loadConfig();

      expect(config.aiConfig.provider).toBe('openrouter');
      expect(config.aiConfig.apiKey).toBe('test-key');
    });

    it('should support Claude provider', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';
      process.env.AI_PROVIDER = 'claude';
      process.env.ANTHROPIC_API_KEY = 'test-key';

      const config = loadConfig();

      expect(config.aiConfig.provider).toBe('claude');
      expect(config.aiConfig.apiKey).toBe('test-key');
    });

    it('should include debug flag', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.DEBUG = 'true';

      const config = loadConfig();

      expect(config.debug).toBe(true);
    });

    it('should include webhook URL if provided', () => {
      process.env.TELEGRAM_BOT_TOKEN = 'test-token';
      process.env.SUPABASE_URL = 'https://test.supabase.co';
      process.env.SUPABASE_KEY = 'test-key';
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.WEBHOOK_URL = 'https://example.com/webhook';

      const config = loadConfig();

      expect(config.webhookUrl).toBe('https://example.com/webhook');
    });
  });
});
