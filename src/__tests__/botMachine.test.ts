import { createActor } from 'xstate';
import { botMachine } from '../machines/botMachine';

describe('Bot State Machine', () => {
  describe('State Transitions', () => {
    it('should start in idle state', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      expect(actor.getSnapshot().value).toBe('idle');
      
      actor.stop();
    });

    it('should transition from idle to waiting when MESSAGE_RECEIVED', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      actor.send({ type: 'MESSAGE_RECEIVED', message: 'Hello' });
      
      // Should be in processing after transitioning through waiting
      const snapshot = actor.getSnapshot();
      expect(['waiting', 'processing']).toContain(snapshot.value);
      
      actor.stop();
    });

    it('should save message in context on MESSAGE_RECEIVED', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      const testMessage = 'Test message';
      actor.send({ type: 'MESSAGE_RECEIVED', message: testMessage });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.message).toBe(testMessage);
      
      actor.stop();
    });

    it('should add user message to conversation history', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      const testMessage = 'Hello bot';
      actor.send({ type: 'MESSAGE_RECEIVED', message: testMessage });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.conversationHistory).toHaveLength(1);
      expect(snapshot.context.conversationHistory[0]).toMatchObject({
        role: 'user',
        content: testMessage,
      });
      
      actor.stop();
    });

    it('should transition to responded on AI_RESPONSE_SUCCESS', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      // First send a message to get to processing state
      actor.send({ type: 'MESSAGE_RECEIVED', message: 'Hello' });
      
      // Then send AI response
      actor.send({ type: 'AI_RESPONSE_SUCCESS', response: 'Hi there!' });
      
      // Should be back in idle after transitioning through responded
      const snapshot = actor.getSnapshot();
      expect(['responded', 'idle']).toContain(snapshot.value);
      
      actor.stop();
    });

    it('should save AI response in context', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      actor.send({ type: 'MESSAGE_RECEIVED', message: 'Hello' });
      
      const aiResponse = 'Hello! How can I help you?';
      actor.send({ type: 'AI_RESPONSE_SUCCESS', response: aiResponse });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.conversationHistory).toHaveLength(2);
      expect(snapshot.context.conversationHistory[1]).toMatchObject({
        role: 'assistant',
        content: aiResponse,
      });
      
      actor.stop();
    });

    it('should handle AI_RESPONSE_ERROR and return to idle', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      actor.send({ type: 'MESSAGE_RECEIVED', message: 'Hello' });
      actor.send({ type: 'AI_RESPONSE_ERROR', error: 'API Error' });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.value).toBe('idle');
      expect(snapshot.context.error).toBe('API Error');
      
      actor.stop();
    });

    it('should maintain conversation history across multiple messages', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      // First exchange
      actor.send({ type: 'MESSAGE_RECEIVED', message: 'Hello' });
      actor.send({ type: 'AI_RESPONSE_SUCCESS', response: 'Hi!' });
      
      // Second exchange
      actor.send({ type: 'MESSAGE_RECEIVED', message: 'How are you?' });
      actor.send({ type: 'AI_RESPONSE_SUCCESS', response: 'I am fine!' });
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.conversationHistory).toHaveLength(4);
      
      actor.stop();
    });
  });

  describe('Context Management', () => {
    it('should initialize with empty context', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      const snapshot = actor.getSnapshot();
      expect(snapshot.context.message).toBe('');
      expect(snapshot.context.conversationHistory).toEqual([]);
      expect(snapshot.context.aiResponse).toBeUndefined();
      expect(snapshot.context.error).toBeUndefined();
      
      actor.stop();
    });

    it('should reset message and aiResponse after responded state', () => {
      const actor = createActor(botMachine);
      actor.start();
      
      actor.send({ type: 'MESSAGE_RECEIVED', message: 'Test' });
      actor.send({ type: 'AI_RESPONSE_SUCCESS', response: 'Response' });
      
      const snapshot = actor.getSnapshot();
      // After transitioning through responded, message and aiResponse should be reset
      expect(snapshot.value).toBe('idle');
      expect(snapshot.context.message).toBe('');
      expect(snapshot.context.aiResponse).toBeUndefined();
      
      actor.stop();
    });
  });
});
