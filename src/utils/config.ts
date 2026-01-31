import { BotConfig, AIProvider } from '../types';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Load bot configuration from environment variables
 */
export function loadConfig(): BotConfig {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  const aiProvider = (process.env.AI_PROVIDER || 'openai') as AIProvider;

  if (!telegramToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required');
  }

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('SUPABASE_URL and SUPABASE_KEY are required');
  }

  let apiKey: string;
  let model: string;

  switch (aiProvider) {
    case 'openai':
      apiKey = process.env.OPENAI_API_KEY || '';
      model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
      break;
    case 'openrouter':
      apiKey = process.env.OPENROUTER_API_KEY || '';
      model = process.env.OPENROUTER_MODEL || 'openai/gpt-3.5-turbo';
      break;
    case 'claude':
      apiKey = process.env.ANTHROPIC_API_KEY || '';
      model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
      break;
    default:
      throw new Error(`Unsupported AI provider: ${aiProvider}`);
  }

  if (!apiKey) {
    throw new Error(`API key for ${aiProvider} is required`);
  }

  return {
    telegramToken,
    aiConfig: {
      provider: aiProvider,
      apiKey,
      model,
    },
    supabase: {
      url: supabaseUrl,
      key: supabaseKey,
    },
    webhookUrl: process.env.WEBHOOK_URL,
    debug: process.env.DEBUG === 'true',
  };
}
