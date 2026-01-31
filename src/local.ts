import express, { Request, Response } from 'express';
import { BotHandler } from './services/botHandler';
import { loadConfig } from './utils/config';
import { logger } from './utils/logger';

/**
 * Local development server for testing the bot
 * 
 * This server runs the bot in polling mode for local development
 * and also provides a simple webhook endpoint for testing.
 */
async function startLocalServer() {
  try {
    logger.info('Starting local development server...');

    // Load configuration
    const config = loadConfig();

    // Create bot handler
    const botHandler = new BotHandler(config);

    // Get the bot instance
    const bot = botHandler.getBot();

    // Start polling mode for local development
    bot.startPolling({
      polling: true,
    });

    logger.info('Bot started in polling mode');

    // Listen for messages
    bot.on('message', async (message: any) => {
      try {
        await botHandler.handleMessage(message);
      } catch (error) {
        logger.error('Error handling message:', error);
      }
    });

    // Listen for polling errors
    bot.on('polling_error', (error: any) => {
      logger.error('Polling error:', error);
    });

    // Create Express server for webhook simulation (optional)
    const app = express();
    app.use(express.json());

    // Health check endpoint
    app.get('/health', (req: Request, res: Response) => {
      void req; // Explicitly mark as intentionally unused
      res.json({ status: 'ok', mode: 'polling' });
    });

    // Webhook endpoint for testing
    app.post('/api/webhook', async (req: Request, res: Response) => {
      try {
        const message = req.body.message;
        if (message) {
          await botHandler.handleMessage(message);
        }
        res.json({ ok: true });
      } catch (error) {
        logger.error('Webhook error:', error);
        res.json({ ok: false, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      logger.info(`Local server listening on port ${PORT}`);
      logger.info(`Webhook endpoint: http://localhost:${PORT}/api/webhook`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });

    logger.info('Bot is ready! Send messages in Telegram to test.');
  } catch (error) {
    logger.error('Failed to start local server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
});

// Start the server
startLocalServer();
