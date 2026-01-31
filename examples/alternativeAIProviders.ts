/**
 * Example: Alternative AI Provider Integration
 * 
 * This example shows how to add a custom AI provider
 * to the AI service.
 */

import axios from 'axios';
import { AIResponse, ConversationMessage } from '../src/types';

/**
 * Example: Groq AI Integration
 */
export async function generateGroqResponse(
  apiKey: string,
  model: string,
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
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: model || 'mixtral-8x7b-32768',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    content: response.data.choices[0].message.content || 'Sorry, I could not generate a response.',
    tokensUsed: response.data.usage?.total_tokens,
    model: response.data.model,
  };
}

/**
 * Example: Cohere AI Integration
 */
export async function generateCohereResponse(
  apiKey: string,
  model: string,
  conversationHistory: ConversationMessage[],
  newMessage: string
): Promise<AIResponse> {
  // Build chat history for Cohere
  const chatHistory = conversationHistory.map((msg) => ({
    role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
    message: msg.content,
  }));

  const response = await axios.post(
    'https://api.cohere.ai/v1/chat',
    {
      model: model || 'command',
      message: newMessage,
      chat_history: chatHistory,
      preamble: 'You are a helpful assistant in a Telegram bot. Be concise and friendly.',
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    content: response.data.text || 'Sorry, I could not generate a response.',
    model: response.data.meta?.model,
  };
}

/**
 * Example: Hugging Face Integration
 */
export async function generateHuggingFaceResponse(
  apiKey: string,
  model: string,
  conversationHistory: ConversationMessage[],
  newMessage: string
): Promise<AIResponse> {
  // Build conversation text
  let conversationText = '';
  conversationHistory.forEach((msg) => {
    conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
  });
  conversationText += `User: ${newMessage}\nAssistant:`;

  const response = await axios.post(
    `https://api-inference.huggingface.co/models/${model || 'meta-llama/Llama-2-7b-chat-hf'}`,
    {
      inputs: conversationText,
      parameters: {
        max_new_tokens: 256,
        temperature: 0.7,
        return_full_text: false,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return {
    content: response.data[0]?.generated_text || 'Sorry, I could not generate a response.',
    model,
  };
}

/**
 * To integrate these providers into the main AI service:
 * 
 * 1. Add provider type to src/types/index.ts:
 *    export type AIProvider = 'openai' | 'openrouter' | 'claude' | 'groq' | 'cohere' | 'huggingface';
 * 
 * 2. Add provider case in src/services/aiService.ts:
 *    case 'groq':
 *      return await this.generateGroqResponse(conversationHistory, newMessage);
 * 
 * 3. Add private method in AIService class:
 *    private async generateGroqResponse(
 *      conversationHistory: ConversationMessage[],
 *      newMessage: string
 *    ): Promise<AIResponse> {
 *      return generateGroqResponse(
 *        this.config.apiKey,
 *        this.config.model,
 *        conversationHistory,
 *        newMessage
 *      );
 *    }
 * 
 * 4. Add configuration in src/utils/config.ts:
 *    case 'groq':
 *      apiKey = process.env.GROQ_API_KEY || '';
 *      model = process.env.GROQ_MODEL || 'mixtral-8x7b-32768';
 *      break;
 * 
 * 5. Add environment variables to .env:
 *    GROQ_API_KEY=your_groq_api_key
 *    GROQ_MODEL=mixtral-8x7b-32768
 */
