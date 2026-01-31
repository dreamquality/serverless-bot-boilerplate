import { createMachine, assign } from 'xstate';
import { BotMachineContext, BotMachineEvent } from '../types';

/**
 * Dialog State Machine
 * 
 * States:
 * - idle: Waiting for user input
 * - waiting: User message received, preparing to process
 * - processing: Sending message to AI and waiting for response
 * - responded: AI response received, sending back to user
 * 
 * Transitions:
 * idle → waiting (on MESSAGE_RECEIVED)
 * waiting → processing (immediate)
 * processing → responded (on AI_RESPONSE_SUCCESS)
 * processing → idle (on AI_RESPONSE_ERROR)
 * responded → idle (immediate, after sending response)
 */
export const botMachine = createMachine(
  {
    id: 'telegramBot',
    initial: 'idle',
    types: {} as {
      context: BotMachineContext;
      events: BotMachineEvent;
    },
    context: {
      userId: 0,
      chatId: 0,
      message: '',
      aiResponse: undefined,
      error: undefined,
      conversationHistory: [],
    },
    states: {
      idle: {
        on: {
          MESSAGE_RECEIVED: {
            target: 'waiting',
            actions: 'saveMessage',
          },
        },
      },
      waiting: {
        always: {
          target: 'processing',
        },
      },
      processing: {
        on: {
          AI_RESPONSE_SUCCESS: {
            target: 'responded',
            actions: 'saveAIResponse',
          },
          AI_RESPONSE_ERROR: {
            target: 'idle',
            actions: 'saveError',
          },
        },
      },
      responded: {
        always: {
          target: 'idle',
          actions: 'resetContext',
        },
      },
    },
  },
  {
    actions: {
      saveMessage: assign({
        message: ({ event }) => {
          if (event.type === 'MESSAGE_RECEIVED') {
            return event.message;
          }
          return '';
        },
        conversationHistory: ({ context, event }) => {
          if (event.type === 'MESSAGE_RECEIVED') {
            return [
              ...context.conversationHistory,
              {
                role: 'user' as const,
                content: event.message,
                timestamp: new Date(),
              },
            ];
          }
          return context.conversationHistory;
        },
      }),
      saveAIResponse: assign({
        aiResponse: ({ event }) => {
          if (event.type === 'AI_RESPONSE_SUCCESS') {
            return event.response;
          }
          return undefined;
        },
        conversationHistory: ({ context, event }) => {
          if (event.type === 'AI_RESPONSE_SUCCESS') {
            return [
              ...context.conversationHistory,
              {
                role: 'assistant' as const,
                content: event.response,
                timestamp: new Date(),
              },
            ];
          }
          return context.conversationHistory;
        },
      }),
      saveError: assign({
        error: ({ event }) => {
          if (event.type === 'AI_RESPONSE_ERROR') {
            return event.error;
          }
          return undefined;
        },
      }),
      resetContext: assign({
        message: '',
        aiResponse: undefined,
        error: undefined,
      }),
    },
  }
);

/**
 * Create a new bot machine instance with initial context
 */
export function createBotMachineInstance(
  userId: number,
  chatId: number,
  conversationHistory: any[] = []
) {
  return botMachine.provide({
    actions: {
      ...botMachine.implementations.actions,
    },
  });
}
