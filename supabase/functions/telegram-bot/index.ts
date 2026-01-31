// Supabase Edge Function for Telegram Bot Webhook
// Import the handler logic from shared code

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Note: This is a Deno edge function. It uses Deno's runtime.
// The actual bot logic should be adapted from src/services/botHandler.ts

serve(async (req) => {
  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse the webhook request
    const update = await req.json()
    
    console.log('Webhook received:', update)

    // Check if there's a message
    if (!update.message) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const message = update.message
    const userId = message.from?.id
    const chatId = message.chat.id
    const text = message.text

    if (!userId || !text) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get environment variables
    const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
    const AI_PROVIDER = Deno.env.get('AI_PROVIDER') || 'openai'
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
    const SUPABASE_KEY = Deno.env.get('SUPABASE_KEY')

    if (!TELEGRAM_BOT_TOKEN || !SUPABASE_URL || !SUPABASE_KEY) {
      throw new Error('Missing required environment variables')
    }

    // Handle special commands
    if (text === '/start') {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
        'Welcome to the AI Bot! 🤖\n\nSend me a message and I\'ll respond using AI.\n\nCommands:\n/start - Start\n/help - Help\n/clear - Clear history')
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (text === '/help') {
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
        'Available commands:\n/start - Start\n/help - Help\n/clear - Clear history\n\nJust send me any message!')
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get or create user context from Supabase
    const supabaseClient = createSupabaseClient(SUPABASE_URL, SUPABASE_KEY)
    
    let userContext = await getUserContext(supabaseClient, userId, chatId)
    
    if (!userContext) {
      userContext = await createUserContext(supabaseClient, {
        userId,
        chatId,
        username: message.from?.username,
        firstName: message.from?.first_name,
        lastName: message.from?.last_name,
      })
    }

    // Get AI response
    let aiResponse
    try {
      aiResponse = await getAIResponse(
        AI_PROVIDER,
        OPENAI_API_KEY || '',
        userContext.conversation_history || [],
        text
      )
    } catch (error) {
      console.error('AI Error:', error)
      await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, 
        'Sorry, I encountered an error. Please try again.')
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Update conversation history
    const newHistory = [
      ...(userContext.conversation_history || []),
      { role: 'user', content: text, timestamp: new Date().toISOString() },
      { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() },
    ]

    await updateUserContext(supabaseClient, userId, chatId, {
      conversation_history: newHistory,
      state: 'idle',
    })

    // Send response to user
    await sendTelegramMessage(TELEGRAM_BOT_TOKEN, chatId, aiResponse)

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error processing webhook:', error)
    
    // Return 200 to prevent Telegram from retrying
    return new Response(JSON.stringify({ 
      ok: false, 
      error: error.message 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

// Helper functions

function createSupabaseClient(url: string, key: string) {
  // Simplified Supabase client for edge functions
  return {
    url,
    key,
  }
}

async function getUserContext(client: any, userId: number, chatId: number) {
  const response = await fetch(
    `${client.url}/rest/v1/user_states?user_id=eq.${userId}&chat_id=eq.${chatId}`,
    {
      headers: {
        'apikey': client.key,
        'Authorization': `Bearer ${client.key}`,
      },
    }
  )
  
  const data = await response.json()
  return data[0] || null
}

async function createUserContext(client: any, context: any) {
  const response = await fetch(
    `${client.url}/rest/v1/user_states`,
    {
      method: 'POST',
      headers: {
        'apikey': client.key,
        'Authorization': `Bearer ${client.key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        user_id: context.userId,
        chat_id: context.chatId,
        username: context.username,
        first_name: context.firstName,
        last_name: context.lastName,
        state: 'idle',
        conversation_history: [],
      }),
    }
  )
  
  const data = await response.json()
  return data[0]
}

async function updateUserContext(client: any, userId: number, chatId: number, updates: any) {
  await fetch(
    `${client.url}/rest/v1/user_states?user_id=eq.${userId}&chat_id=eq.${chatId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': client.key,
        'Authorization': `Bearer ${client.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...updates,
        updated_at: new Date().toISOString(),
      }),
    }
  )
}

async function getAIResponse(
  provider: string,
  apiKey: string,
  history: any[],
  message: string
): Promise<string> {
  if (provider === 'openai') {
    const messages = [
      { role: 'system', content: 'You are a helpful assistant. Be concise and friendly.' },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('OPENAI_MODEL') || 'gpt-3.5-turbo',
        messages,
      }),
    })

    const data = await response.json()
    return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
  }

  return 'AI provider not supported in edge function yet.'
}

async function sendTelegramMessage(token: string, chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      chat_id: chatId,
      text,
    }),
  })
}
