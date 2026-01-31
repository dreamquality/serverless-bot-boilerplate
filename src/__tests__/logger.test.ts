import { logger } from '../utils/logger';

describe('Logger', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('info', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[INFO]',
        expect.any(String),
        'Test info message'
      );
    });

    it('should log info with data object', () => {
      logger.info('Test with data', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[INFO]',
        expect.any(String),
        'Test with data',
        { key: 'value' }
      );
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]',
        expect.any(String),
        'Test error message'
      );
    });

    it('should log error with data', () => {
      logger.error('Test error', { error: 'details' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ERROR]',
        expect.any(String),
        'Test error',
        { error: 'details' }
      );
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[WARN]',
        expect.any(String),
        'Test warning'
      );
    });
  });

  describe('debug', () => {
    it('should log debug messages when DEBUG is true', () => {
      process.env.DEBUG = 'true';
      logger.debug('Test debug');
      expect(consoleLogSpy).toHaveBeenCalled();
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[DEBUG]',
        expect.any(String),
        'Test debug'
      );
    });

    it('should not log debug messages when DEBUG is false', () => {
      delete process.env.DEBUG;
      logger.debug('Test debug');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });
});
