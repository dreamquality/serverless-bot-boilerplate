import { createMachine, assign } from 'xstate';

/**
 * Example: Extended Bot Machine with Multi-Step Form
 * 
 * This example shows how to extend the base bot machine
 * with a multi-step form flow for collecting user information.
 * 
 * States:
 * - idle: Waiting for user to start form
 * - askingName: Waiting for user's name
 * - askingEmail: Waiting for user's email
 * - askingPreference: Waiting for user's preference
 * - formComplete: Form data collected
 */

interface FormContext {
  userId: number;
  chatId: number;
  name?: string;
  email?: string;
  preference?: string;
  error?: string;
}

type FormEvent =
  | { type: 'START_FORM' }
  | { type: 'SUBMIT_NAME'; name: string }
  | { type: 'SUBMIT_EMAIL'; email: string }
  | { type: 'SUBMIT_PREFERENCE'; preference: string }
  | { type: 'VALIDATION_ERROR'; error: string }
  | { type: 'RESET' };

export const formMachine = createMachine(
  {
    id: 'formBot',
    initial: 'idle',
    types: {} as {
      context: FormContext;
      events: FormEvent;
    },
    context: {
      userId: 0,
      chatId: 0,
      name: undefined,
      email: undefined,
      preference: undefined,
      error: undefined,
    },
    states: {
      idle: {
        on: {
          START_FORM: 'askingName',
        },
      },
      askingName: {
        on: {
          SUBMIT_NAME: {
            target: 'askingEmail',
            actions: 'saveName',
          },
        },
      },
      askingEmail: {
        on: {
          SUBMIT_EMAIL: [
            {
              target: 'askingPreference',
              guard: 'isValidEmail',
              actions: 'saveEmail',
            },
            {
              target: 'askingEmail',
              actions: 'saveError',
            },
          ],
          RESET: 'idle',
        },
      },
      askingPreference: {
        on: {
          SUBMIT_PREFERENCE: {
            target: 'formComplete',
            actions: 'savePreference',
          },
          RESET: 'idle',
        },
      },
      formComplete: {
        on: {
          RESET: 'idle',
        },
      },
    },
  },
  {
    actions: {
      saveName: assign({
        name: ({ event }) => {
          if (event.type === 'SUBMIT_NAME') {
            return event.name;
          }
          return undefined;
        },
      }),
      saveEmail: assign({
        email: ({ event }) => {
          if (event.type === 'SUBMIT_EMAIL') {
            return event.email;
          }
          return undefined;
        },
      }),
      savePreference: assign({
        preference: ({ event }) => {
          if (event.type === 'SUBMIT_PREFERENCE') {
            return event.preference;
          }
          return undefined;
        },
      }),
      saveError: assign({
        error: ({ event }) => {
          if (event.type === 'VALIDATION_ERROR') {
            return event.error;
          }
          return 'Invalid input';
        },
      }),
    },
    guards: {
      isValidEmail: ({ event }) => {
        if (event.type === 'SUBMIT_EMAIL') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(event.email);
        }
        return false;
      },
    },
  }
);

/**
 * Usage example in bot handler:
 * 
 * if (text === '/form') {
 *   const actor = createActor(formMachine);
 *   actor.start();
 *   actor.send({ type: 'START_FORM' });
 *   await bot.sendMessage(chatId, 'Please enter your name:');
 *   // Store actor reference for this user
 *   userActors.set(userId, actor);
 * }
 * 
 * // When user sends response:
 * const actor = userActors.get(userId);
 * const state = actor.getSnapshot().value;
 * 
 * if (state === 'askingName') {
 *   actor.send({ type: 'SUBMIT_NAME', name: text });
 *   await bot.sendMessage(chatId, 'Great! Now enter your email:');
 * } else if (state === 'askingEmail') {
 *   actor.send({ type: 'SUBMIT_EMAIL', email: text });
 *   const snapshot = actor.getSnapshot();
 *   if (snapshot.value === 'askingPreference') {
 *     await bot.sendMessage(chatId, 'What is your preference? (A/B/C)');
 *   } else {
 *     await bot.sendMessage(chatId, 'Invalid email. Please try again:');
 *   }
 * }
 * // ... and so on
 */
