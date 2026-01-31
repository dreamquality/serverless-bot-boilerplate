/**
 * User context stored in the database
 */
export interface UserContext {
  userId: number;
  chatId: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  state: DialogState;
  conversationHistory: ConversationMessage[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dialog states for the FSM
 */
export type DialogState = 'idle' | 'waiting' | 'processing' | 'responded';

/**
 * Conversation message
 */
export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

/**
 * AI Provider configuration
 */
export type AIProvider = 'openai' | 'openrouter' | 'claude';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

/**
 * AI Service Response
 */
export interface AIResponse {
  content: string;
  tokensUsed?: number;
  model?: string;
}

/**
 * Bot configuration
 */
export interface BotConfig {
  telegramToken: string;
  aiConfig: AIConfig;
  supabase: {
    url: string;
    key: string;
  };
  webhookUrl?: string;
  debug?: boolean;
}

/**
 * FSM Context
 */
export interface BotMachineContext {
  userId: number;
  chatId: number;
  message: string;
  aiResponse?: string;
  error?: string;
  conversationHistory: ConversationMessage[];
}

/**
 * FSM Events
 */
export type BotMachineEvent =
  | { type: 'MESSAGE_RECEIVED'; message: string }
  | { type: 'AI_RESPONSE_SUCCESS'; response: string }
  | { type: 'AI_RESPONSE_ERROR'; error: string }
  | { type: 'RESET' };

/**
 * Database UserState record
 */
export interface UserStateRecord {
  user_id: number;
  chat_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  state: DialogState;
  conversation_history: ConversationMessage[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}
