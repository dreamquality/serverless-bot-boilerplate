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
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        'Test info message'
      );
    });

    it('should log info with data object', () => {
      logger.info('Test with data', { key: 'value' });
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO'),
        'Test with data',
        { key: 'value' }
      );
    });
  });

  describe('error', () => {
    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        'Test error message'
      );
    });

    it('should log error with data', () => {
      logger.error('Test error', { error: 'details' });
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR'),
        'Test error',
        { error: 'details' }
      );
    });
  });

  describe('warn', () => {
    it('should log warning messages', () => {
      logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARN'),
        'Test warning'
      );
    });
  });

  describe('debug', () => {
    it('should log debug messages when DEBUG is true', () => {
      process.env.DEBUG = 'true';
      logger.debug('Test debug');
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('DEBUG'),
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
