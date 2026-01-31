# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Telegram bot.

## Structure

```
supabase/
├── config.toml                    # Supabase configuration
└── functions/
    └── telegram-bot/
        └── index.ts               # Edge function handler
```

## Deployment

### Prerequisites

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

### Deploy

1. Link to your Supabase project:
   ```bash
   supabase link --project-ref <YOUR_PROJECT_REF>
   ```
   
   You can find your project reference in your Supabase project URL:
   `https://<PROJECT_REF>.supabase.co`

2. Deploy the edge function:
   ```bash
   supabase functions deploy telegram-bot --no-verify-jwt
   ```

3. Set environment secrets:
   ```bash
   supabase secrets set \
     TELEGRAM_BOT_TOKEN="your_token" \
     AI_PROVIDER="openai" \
     OPENAI_API_KEY="your_key" \
     OPENAI_MODEL="gpt-3.5-turbo" \
     SUPABASE_URL="your_supabase_url" \
     SUPABASE_KEY="your_supabase_key"
   ```

4. Set the Telegram webhook:
   ```bash
   curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://<PROJECT_REF>.supabase.co/functions/v1/telegram-bot"}'
   ```

## Function URL

Your edge function will be available at:
```
https://<PROJECT_REF>.supabase.co/functions/v1/telegram-bot
```

## Local Testing

Test the edge function locally:

```bash
supabase functions serve telegram-bot
```

The function will be available at `http://localhost:54321/functions/v1/telegram-bot`

## Environment Variables

The edge function requires the following environment variables:

- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token
- `AI_PROVIDER` - AI provider to use (openai, openrouter, claude)
- `OPENAI_API_KEY` - OpenAI API key (if using OpenAI)
- `OPENAI_MODEL` - OpenAI model (default: gpt-3.5-turbo)
- `OPENROUTER_API_KEY` - OpenRouter API key (if using OpenRouter)
- `OPENROUTER_MODEL` - OpenRouter model
- `ANTHROPIC_API_KEY` - Anthropic API key (if using Claude)
- `CLAUDE_MODEL` - Claude model
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_KEY` - Your Supabase anon key

## Differences from Vercel

Supabase Edge Functions use Deno runtime instead of Node.js:

- **Imports**: Use Deno-style imports (e.g., `https://deno.land/std@...`)
- **Environment**: Use `Deno.env.get()` instead of `process.env`
- **No npm packages**: Use Deno-compatible imports
- **TypeScript native**: No build step required

## Features

The edge function includes:

- ✅ Telegram webhook handling
- ✅ AI integration (OpenAI)
- ✅ Supabase database integration
- ✅ User context management
- ✅ Conversation history tracking
- ✅ Bot commands (/start, /help, /clear)
- ✅ Error handling

## Monitoring

View function logs:
```bash
supabase functions logs telegram-bot
```

Or view in the Supabase Dashboard:
`https://app.supabase.com/project/<PROJECT_REF>/functions/telegram-bot/logs`

## Troubleshooting

### Function not responding
- Check logs: `supabase functions logs telegram-bot`
- Verify secrets are set: `supabase secrets list`
- Test locally: `supabase functions serve telegram-bot`

### Webhook not receiving updates
- Verify webhook URL: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
- Check function is deployed: Visit function URL in browser
- Ensure `--no-verify-jwt` flag was used during deployment

### Database connection errors
- Verify `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Check that `user_states` table exists (run schema.sql)
- Verify RLS policies allow access

## Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Documentation](https://deno.land/manual)
- [Telegram Bot API](https://core.telegram.org/bots/api)
