import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserContext, DialogState, ConversationMessage, UserStateRecord } from '../types';
import { logger } from '../utils/logger';

/**
 * Database Service for managing user state with Supabase
 */
export class DatabaseService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get user context from database
   */
  async getUserContext(userId: number, chatId: number): Promise<UserContext | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_states')
        .select('*')
        .eq('user_id', userId)
        .eq('chat_id', chatId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      if (!data) {
        return null;
      }

      return this.mapRecordToContext(data as UserStateRecord);
    } catch (error) {
      logger.error('Error getting user context:', error);
      throw error;
    }
  }

  /**
   * Create or update user context
   */
  async upsertUserContext(context: Partial<UserContext>): Promise<UserContext> {
    try {
      const record: Partial<UserStateRecord> = {
        user_id: context.userId,
        chat_id: context.chatId,
        username: context.username,
        first_name: context.firstName,
        last_name: context.lastName,
        state: context.state || 'idle',
        conversation_history: context.conversationHistory || [],
        metadata: context.metadata || {},
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await this.supabase
        .from('user_states')
        .upsert(record, {
          onConflict: 'user_id,chat_id',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return this.mapRecordToContext(data as UserStateRecord);
    } catch (error) {
      logger.error('Error upserting user context:', error);
      throw error;
    }
  }

  /**
   * Update user state
   */
  async updateUserState(userId: number, chatId: number, state: DialogState): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_states')
        .update({
          state,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('chat_id', chatId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error updating user state:', error);
      throw error;
    }
  }

  /**
   * Add message to conversation history
   */
  async addConversationMessage(
    userId: number,
    chatId: number,
    message: ConversationMessage
  ): Promise<void> {
    try {
      const context = await this.getUserContext(userId, chatId);
      
      if (!context) {
        throw new Error('User context not found');
      }

      const updatedHistory = [...context.conversationHistory, message];
      
      // Keep only the last 20 messages to prevent unbounded growth
      const MAX_HISTORY_LENGTH = 20;
      const trimmedHistory = updatedHistory.length > MAX_HISTORY_LENGTH
        ? updatedHistory.slice(-MAX_HISTORY_LENGTH)
        : updatedHistory;

      const { error } = await this.supabase
        .from('user_states')
        .update({
          conversation_history: trimmedHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('chat_id', chatId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error adding conversation message:', error);
      throw error;
    }
  }

  /**
   * Clear conversation history
   */
  async clearConversationHistory(userId: number, chatId: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_states')
        .update({
          conversation_history: [],
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('chat_id', chatId);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Error clearing conversation history:', error);
      throw error;
    }
  }

  /**
   * Map database record to UserContext
   */
  private mapRecordToContext(record: UserStateRecord): UserContext {
    return {
      userId: record.user_id,
      chatId: record.chat_id,
      username: record.username,
      firstName: record.first_name,
      lastName: record.last_name,
      state: record.state,
      conversationHistory: record.conversation_history || [],
      metadata: record.metadata || {},
      createdAt: new Date(record.created_at),
      updatedAt: new Date(record.updated_at),
    };
  }

  /**
   * Initialize database schema (call this once)
   */
  async initializeSchema(): Promise<void> {
    logger.info('Database schema should be created manually in Supabase. See README.md for SQL schema.');
  }
}
