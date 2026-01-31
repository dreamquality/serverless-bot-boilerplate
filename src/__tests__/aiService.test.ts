import { AIService } from '../services/aiService';
import { ConversationMessage } from '../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('AIService', () => {
  let aiService: AIService;
  const mockConfig = {
    provider: 'openai' as const,
    openaiApiKey: 'test-api-key',
    openRouterApiKey: undefined,
    claudeApiKey: undefined,
  };

  beforeEach(() => {
    aiService = new AIService(mockConfig);
    jest.clearAllMocks();
  });

  describe('generateResponse', () => {
    const mockHistory: ConversationMessage[] = [
      { role: 'user', content: 'Hello', timestamp: '2024-01-01T00:00:00.000Z' },
    ];

    it('should throw error for empty message', async () => {
      await expect(aiService.generateResponse(mockHistory, '')).rejects.toThrow(
        'Message cannot be empty'
      );
    });

    it('should call OpenAI API when provider is openai', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello from OpenAI' } }],
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await aiService.generateResponse(mockHistory, 'Test message');

      expect(result.content).toBe('Hello from OpenAI');
      expect(result.provider).toBe('openai');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should throw error when OpenAI response is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({}),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(aiService.generateResponse(mockHistory, 'Test')).rejects.toThrow(
        'Invalid response from OpenAI API'
      );
    });

    it('should throw error when OpenAI API fails', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(aiService.generateResponse(mockHistory, 'Test')).rejects.toThrow(
        'OpenAI API error'
      );
    });

    it('should call OpenRouter API when provider is openrouter', async () => {
      const openRouterService = new AIService({
        ...mockConfig,
        provider: 'openrouter',
        openRouterApiKey: 'openrouter-key',
      });

      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Hello from OpenRouter' } }],
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await openRouterService.generateResponse(mockHistory, 'Test');

      expect(result.content).toBe('Hello from OpenRouter');
      expect(result.provider).toBe('openrouter');
    });

    it('should call Claude API when provider is claude', async () => {
      const claudeService = new AIService({
        ...mockConfig,
        provider: 'claude',
        claudeApiKey: 'claude-key',
      });

      const mockResponse = {
        ok: true,
        json: async () => ({
          content: [{ text: 'Hello from Claude' }],
        }),
      };
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await claudeService.generateResponse(mockHistory, 'Test');

      expect(result.content).toBe('Hello from Claude');
      expect(result.provider).toBe('claude');
    });
  });
});
