import OpenAI from 'openai';
import axios from 'axios';
import { AIConfig, AIResponse, ConversationMessage } from '../types';
import { logger } from '../utils/logger';

/**
 * AI Service for handling different AI providers
 */
export class AIService {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  /**
   * Generate AI response based on conversation history
   */
  async generateResponse(
    conversationHistory: ConversationMessage[],
    newMessage: string
  ): Promise<AIResponse> {
    // Validate inputs
    if (!newMessage || newMessage.trim().length === 0) {
      throw new Error('Message cannot be empty')
    }

    if (newMessage.length > 4000) {
      throw new Error('Message is too long (max 4000 characters)')
    }

    try {
      switch (this.config.provider) {
        case 'openai':
          return await this.generateOpenAIResponse(conversationHistory, newMessage);
        case 'openrouter':
          return await this.generateOpenRouterResponse(conversationHistory, newMessage);
        case 'claude':
          return await this.generateClaudeResponse(conversationHistory, newMessage);
        default:
          throw new Error(`Unsupported AI provider: ${this.config.provider}`);
      }
    } catch (error) {
      logger.error('AI Service Error:', error);
      throw error;
    }
  }

  /**
   * Generate response using OpenAI API
   */
  private async generateOpenAIResponse(
    conversationHistory: ConversationMessage[],
    newMessage: string
  ): Promise<AIResponse> {
    const openai = new OpenAI({
      apiKey: this.config.apiKey,
    });

    const messages = [
      {
        role: 'system' as const,
        content: 'You are a helpful assistant in a Telegram bot. Be concise and friendly.',
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content: newMessage,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: this.config.model,
      messages,
      temperature: 0.7,
      max_tokens: 500,
    });

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error('Invalid response from OpenAI API: missing choices or message')
    }

    return {
      content: completion.choices[0].message.content || 'Sorry, I could not generate a response.',
      tokensUsed: completion.usage?.total_tokens,
      model: completion.model,
    };
  }

  /**
   * Generate response using OpenRouter API
   */
  private async generateOpenRouterResponse(
    conversationHistory: ConversationMessage[],
    newMessage: string
  ): Promise<AIResponse> {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful assistant in a Telegram bot. Be concise and friendly.',
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: newMessage,
      },
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: this.config.model,
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://github.com/serverless-bot-boilerplate',
        },
      }
    );

    if (!response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      throw new Error('Invalid response from OpenRouter API: missing choices or message')
    }

    return {
      content: response.data.choices[0].message.content || 'Sorry, I could not generate a response.',
      tokensUsed: response.data.usage?.total_tokens,
      model: response.data.model,
    };
  }

  /**
   * Generate response using Claude API (Anthropic)
   */
  private async generateClaudeResponse(
    conversationHistory: ConversationMessage[],
    newMessage: string
  ): Promise<AIResponse> {
    const messages = conversationHistory.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    messages.push({
      role: 'user',
      content: newMessage,
    });

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: this.config.model,
        max_tokens: 1024,
        messages,
        system: 'You are a helpful assistant in a Telegram bot. Be concise and friendly.',
      },
      {
        headers: {
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.data.content || !response.data.content[0] || !response.data.content[0].text) {
      throw new Error('Invalid response from Claude API: missing content or text')
    }

    return {
      content: response.data.content[0].text || 'Sorry, I could not generate a response.',
      model: response.data.model,
    };
  }
}
