import { VercelRequest, VercelResponse } from '@vercel/node';
import { Message } from 'node-telegram-bot-api';
import { BotHandler } from '../src/services/botHandler';
import { loadConfig } from '../src/utils/config';
import { logger } from '../src/utils/logger';

/**
 * Vercel Serverless Function for Telegram Webhook
 * 
 * This function handles incoming webhook requests from Telegram
 * and processes them using the BotHandler service.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    logger.info('Webhook received');
    logger.debug('Request body:', req.body);

    // Parse Telegram update
    const update = req.body;
    
    if (!update.message) {
      logger.warn('No message in update');
      return res.status(200).json({ ok: true });
    }

    const message: Message = update.message;

    // Load configuration
    const config = loadConfig();

    // Create bot handler
    const botHandler = new BotHandler(config);

    // Handle the message
    await botHandler.handleMessage(message);

    logger.info('Message processed successfully');

    return res.status(200).json({ ok: true });
  } catch (error) {
    logger.error('Error processing webhook:', error);
    
    // Return 200 to prevent Telegram from retrying
    // We log the error but acknowledge receipt
    return res.status(200).json({ 
      ok: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
