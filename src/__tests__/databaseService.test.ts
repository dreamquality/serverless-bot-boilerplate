import { DatabaseService } from '../services/databaseService';
import { UserContext } from '../types';

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(),
          })),
        })),
      })),
    })),
  })),
}));

describe('DatabaseService', () => {
  let dbService: DatabaseService;
  const mockConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key',
  };

  beforeEach(() => {
    dbService = new DatabaseService(mockConfig);
  });

  describe('getUserContext', () => {
    it('should return user context when user exists', async () => {
      const mockData: UserContext = {
        userId: 123,
        chatId: 456,
        currentState: 'idle',
        conversationHistory: [],
        lastInteraction: '2024-01-01T00:00:00.000Z',
      };

      const mockSupabase = (dbService as any).supabase;
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await dbService.getUserContext(123, 456);

      expect(result).toEqual(mockData);
    });

    it('should return null when user does not exist', async () => {
      const mockSupabase = (dbService as any).supabase;
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const result = await dbService.getUserContext(123, 456);

      expect(result).toBeNull();
    });

    it('should throw error on database error', async () => {
      const mockSupabase = (dbService as any).supabase;
      mockSupabase.from().select().eq().single.mockResolvedValue({
        data: null,
        error: { message: 'Database error', code: 'ERROR' },
      });

      await expect(dbService.getUserContext(123, 456)).rejects.toThrow(
        'Failed to get user context'
      );
    });
  });

  describe('createUserContext', () => {
    it('should create new user context', async () => {
      const mockData: UserContext = {
        userId: 123,
        chatId: 456,
        currentState: 'idle',
        conversationHistory: [],
        lastInteraction: '2024-01-01T00:00:00.000Z',
      };

      const mockSupabase = (dbService as any).supabase;
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: mockData,
        error: null,
      });

      const result = await dbService.createUserContext(123, 456);

      expect(result).toEqual(mockData);
    });

    it('should throw error on creation failure', async () => {
      const mockSupabase = (dbService as any).supabase;
      mockSupabase.from().insert().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      });

      await expect(dbService.createUserContext(123, 456)).rejects.toThrow(
        'Failed to create user context'
      );
    });
  });

  describe('updateUserContext', () => {
    it('should update user context successfully', async () => {
      const updates = {
        currentState: 'processing' as const,
        conversationHistory: [
          { role: 'user' as const, content: 'Hello', timestamp: '2024-01-01T00:00:00.000Z' },
        ],
      };

      const mockSupabase = (dbService as any).supabase;
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: { userId: 123, chatId: 456, ...updates },
        error: null,
      });

      const result = await dbService.updateUserContext(123, 456, updates);

      expect(result.currentState).toBe('processing');
      expect(result.conversationHistory).toHaveLength(1);
    });

    it('should throw error on update failure', async () => {
      const mockSupabase = (dbService as any).supabase;
      mockSupabase.from().update().eq().select().single.mockResolvedValue({
        data: null,
        error: { message: 'Update failed' },
      });

      await expect(dbService.updateUserContext(123, 456, {})).rejects.toThrow(
        'Failed to update user context'
      );
    });
  });
});
