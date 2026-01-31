# Serverless Telegram Bot Boilerplate 🤖

[![CI](https://github.com/dreamquality/serverless-bot-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/dreamquality/serverless-bot-boilerplate/actions/workflows/ci.yml)
[![Code Quality](https://github.com/dreamquality/serverless-bot-boilerplate/actions/workflows/code-quality.yml/badge.svg)](https://github.com/dreamquality/serverless-bot-boilerplate/actions/workflows/code-quality.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)

Advanced Telegram bot boilerplate with TypeScript, XState FSM, AI integration (OpenAI/OpenRouter/Claude), and serverless deployment on **Vercel** or **Supabase Edge Functions**. Supports multi-user contexts with persistent state storage in Supabase.

## 🚀 Automated Setup (Recommended)

**New!** Use our interactive setup script for automatic configuration and deployment:

```bash
./setup.sh
```

The script will:
- ✅ Check prerequisites (Node.js, npm, git)
- ✅ Install dependencies automatically
- ✅ Guide you through API key configuration
- ✅ Set up your .env file
- ✅ Create Supabase database connection
- ✅ Choose and configure AI provider (OpenAI/OpenRouter/Claude)
- ✅ Test your configuration
- ✅ **Deploy to Vercel OR Supabase Edge Functions** (your choice!)
- ✅ Set up Telegram webhook automatically
- ✅ Generate deployment instructions

**Just run `./setup.sh` and follow the prompts!**

---

## ✨ Features

- 🚀 **Serverless Architecture**: Deploy on Vercel with zero infrastructure management
- 🎭 **XState FSM**: State machine-based dialog management (idle → waiting → processing → responded)
- 🤖 **Multi-AI Support**: Easy switching between OpenAI, OpenRouter, and Claude APIs
- 💾 **Persistent Storage**: User state and conversation history in Supabase
- 👥 **Multi-User Support**: Handle multiple users with isolated contexts
- 🔧 **TypeScript**: Full type safety across the entire codebase
- 🧪 **Local Testing**: Easy local development with polling mode
- 📊 **Logging**: Comprehensive logging for debugging FSM and AI requests
- ⚡ **Error Handling**: Robust error handling with fallback states

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│  Telegram   │─────▶│    Vercel    │─────▶│   XState    │
│   Webhook   │      │   Serverless │      │     FSM     │
└─────────────┘      └──────────────┘      └─────────────┘
                             │                     │
                             ▼                     ▼
                     ┌──────────────┐      ┌─────────────┐
                     │  AI Service  │      │  Supabase   │
                     │ (Multi-provider)│    │     DB      │
                     └──────────────┘      └─────────────┘
```

### State Machine Flow

```
┌──────┐  MESSAGE_RECEIVED  ┌─────────┐
│ IDLE │───────────────────▶│ WAITING │
└──────┘                     └─────────┘
   ▲                              │
   │                              │ (immediate)
   │                              ▼
   │                        ┌────────────┐
   │     AI_RESPONSE_       │ PROCESSING │
   │     SUCCESS            └────────────┘
   │    ┌────────────┐            │
   └────│ RESPONDED  │◀───────────┘
        └────────────┘
             │
             │ (immediate)
             ▼
          [IDLE]
```

## 📋 Prerequisites

- Node.js 18+ and npm
- Telegram Bot Token (from [@BotFather](https://t.me/botfather))
- Supabase account (free tier available)
- API key from one of:
  - OpenAI API key
  - OpenRouter API key
  - Anthropic API key (Claude)
- Vercel account (for deployment)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/serverless-bot-boilerplate.git
cd serverless-bot-boilerplate
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor and run the schema from `schema.sql`
3. Get your Supabase URL and anon key from Project Settings → API

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Choose AI Provider (openai, openrouter, or claude)
AI_PROVIDER=openai

# For OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-3.5-turbo

# For OpenRouter (alternative)
# OPENROUTER_API_KEY=your_openrouter_key
# OPENROUTER_MODEL=openai/gpt-3.5-turbo

# For Claude (alternative)
# ANTHROPIC_API_KEY=your_anthropic_key
# CLAUDE_MODEL=claude-3-sonnet-20240229

# Optional
DEBUG=true
```

### 4. Run Locally

```bash
npm run dev
```

The bot will start in polling mode. Send a message to your bot on Telegram to test!

**Available commands:**
- `/start` - Initialize the bot
- `/help` - Show help message
- `/clear` - Clear conversation history

## 📦 Project Structure

```
serverless-bot-boilerplate/
├── api/
│   └── webhook.ts              # Vercel serverless function
├── src/
│   ├── machines/
│   │   └── botMachine.ts       # XState FSM definition
│   ├── services/
│   │   ├── aiService.ts        # AI provider integrations
│   │   ├── botHandler.ts       # Main bot logic
│   │   └── databaseService.ts  # Supabase integration
│   ├── types/
│   │   └── index.ts            # TypeScript types
│   ├── utils/
│   │   ├── config.ts           # Configuration loader
│   │   └── logger.ts           # Logging utility
│   └── local.ts                # Local development server
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── vercel.json                 # Vercel deployment config
└── schema.sql                  # Supabase database schema
```

## 🌐 Deployment Options

### Option 1: Deploy to Vercel

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
vercel
```

Follow the prompts to deploy. On first deployment, Vercel will ask you to link or create a project.

#### 3. Set Environment Variables

In your Vercel dashboard (or via CLI):

```bash
vercel env add TELEGRAM_BOT_TOKEN
vercel env add SUPABASE_URL
vercel env add SUPABASE_KEY
vercel env add AI_PROVIDER
vercel env add OPENAI_API_KEY
vercel env add OPENAI_MODEL
```

#### 4. Set Telegram Webhook

Once deployed, set your bot's webhook to point to your Vercel URL:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-app.vercel.app/api/webhook"}'
```

Or use this format:
```
https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/webhook
```

#### 5. Verify Deployment

Send a message to your bot on Telegram. Check Vercel logs for any issues:

```bash
vercel logs
```

### Option 2: Deploy to Supabase Edge Functions

#### 1. Install Supabase CLI

```bash
npm install -g supabase
```

#### 2. Login to Supabase

```bash
supabase login
```

#### 3. Link Your Project

```bash
supabase link --project-ref <YOUR_PROJECT_REF>
```

Find your project reference in your Supabase URL: `https://<PROJECT_REF>.supabase.co`

#### 4. Deploy Edge Function

```bash
supabase functions deploy telegram-bot --no-verify-jwt
```

#### 5. Set Environment Secrets

```bash
supabase secrets set \
  TELEGRAM_BOT_TOKEN="your_token" \
  AI_PROVIDER="openai" \
  OPENAI_API_KEY="your_key" \
  OPENAI_MODEL="gpt-3.5-turbo" \
  SUPABASE_URL="your_supabase_url" \
  SUPABASE_KEY="your_supabase_key"
```

#### 6. Set Telegram Webhook

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://<PROJECT_REF>.supabase.co/functions/v1/telegram-bot"}'
```

#### 7. Verify Deployment

Check function logs:
```bash
supabase functions logs telegram-bot
```

See `supabase/README.md` for detailed instructions.

## 🔧 Configuration

### Switching AI Providers

The bot supports three AI providers. Switch between them by changing the `AI_PROVIDER` environment variable:

#### OpenAI (Default)
```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-3.5-turbo
```

#### OpenRouter
```env
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_MODEL=openai/gpt-4
```

#### Claude (Anthropic)
```env
AI_PROVIDER=claude
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-sonnet-20240229
```

### Database Schema

The bot uses a single table in Supabase:

**user_states**
- `user_id` (BIGINT) - Telegram user ID
- `chat_id` (BIGINT) - Telegram chat ID
- `username` (TEXT) - Username
- `first_name` (TEXT) - First name
- `last_name` (TEXT) - Last name
- `state` (TEXT) - Current FSM state
- `conversation_history` (JSONB) - Array of conversation messages
- `metadata` (JSONB) - Additional metadata
- `created_at` (TIMESTAMP) - Creation timestamp
- `updated_at` (TIMESTAMP) - Last update timestamp

## 🧪 Testing

### Local Testing with Polling

The easiest way to test locally:

```bash
npm run dev
```

This starts the bot in polling mode. Just message your bot on Telegram!

### Local Testing with Webhook (ngrok)

1. Install [ngrok](https://ngrok.com/):
```bash
npm install -g ngrok
```

2. Start your local server:
```bash
npm run dev
```

3. In another terminal, start ngrok:
```bash
ngrok http 3000
```

4. Set webhook to ngrok URL:
```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-ngrok-id.ngrok.io/api/webhook"}'
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

## 📊 Monitoring and Debugging

### Enable Debug Mode

Set `DEBUG=true` in your `.env` file to see detailed logs:

```env
DEBUG=true
```

### View Logs

**Local:**
- Console output shows all logs

**Vercel:**
```bash
vercel logs
vercel logs --follow  # Live tail
```

### FSM State Visualization

The bot logs state transitions. Look for log entries like:
```
[INFO] Processing message from user 12345: Hello
[DEBUG] FSM State: idle → waiting
[DEBUG] FSM State: waiting → processing
[DEBUG] AI Response: { content: "Hi there!", tokensUsed: 15 }
[DEBUG] FSM State: processing → responded
[DEBUG] FSM State: responded → idle
```

## 🎯 Extending the Bot

### Adding New Dialog States

Edit `src/machines/botMachine.ts` to add new states:

```typescript
export const botMachine = createMachine({
  // ...
  states: {
    idle: { /* ... */ },
    waiting: { /* ... */ },
    processing: { /* ... */ },
    responded: { /* ... */ },
    
    // Add your new state
    customState: {
      on: {
        CUSTOM_EVENT: {
          target: 'anotherState',
          actions: 'customAction',
        },
      },
    },
  },
});
```

### Adding New Commands

Edit `src/services/botHandler.ts`:

```typescript
// In handleMessage method
if (text === '/mycustomcommand') {
  await this.handleCustomCommand(chatId, userId);
  return;
}

// Add your handler
private async handleCustomCommand(chatId: number, userId: number): Promise<void> {
  // Your logic here
  await this.bot.sendMessage(chatId, 'Custom command response');
}
```

### Customizing AI Behavior

Edit the system message in `src/services/aiService.ts`:

```typescript
const messages = [
  {
    role: 'system',
    content: 'Your custom system prompt here!',
  },
  // ...
];
```

### Adding New AI Providers

1. Add provider type to `src/types/index.ts`
2. Implement generation method in `src/services/aiService.ts`
3. Add configuration in `src/utils/config.ts`

## 🚀 Advanced Features

### Rate Limiting

Add rate limiting middleware in `api/webhook.ts`:

```typescript
// Check request rate per user
const userRequestCount = await redis.incr(`user:${userId}:requests`);
if (userRequestCount > 10) {
  return res.status(429).json({ error: 'Rate limit exceeded' });
}
```

### Multi-Channel Support

Extend to support Discord, Slack, etc.:

1. Create new webhook handlers (e.g., `api/discord-webhook.ts`)
2. Adapt message format in handlers
3. Reuse `BotHandler` service with channel-specific adapters

### Analytics and Metrics

Integrate with services like:
- **Sentry** for error tracking
- **Datadog** for metrics
- **LogRocket** for session replay

### Vector Database Integration

Add context-aware AI with vector search:

```typescript
// In aiService.ts
const relevantContext = await vectorDB.search(userMessage);
const enhancedPrompt = `${relevantContext}\n\nUser: ${userMessage}`;
```

## 🧪 Example Test Structure

Create `src/__tests__/botMachine.test.ts`:

```typescript
import { createActor } from 'xstate';
import { botMachine } from '../machines/botMachine';

describe('Bot Machine', () => {
  it('should transition from idle to waiting on MESSAGE_RECEIVED', () => {
    const actor = createActor(botMachine);
    actor.start();
    
    expect(actor.getSnapshot().value).toBe('idle');
    
    actor.send({ type: 'MESSAGE_RECEIVED', message: 'Hello' });
    
    expect(actor.getSnapshot().value).toBe('waiting');
  });
});
```

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | ✅ | Bot token from @BotFather | `123456:ABC-DEF...` |
| `SUPABASE_URL` | ✅ | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_KEY` | ✅ | Supabase anon key | `eyJhbGc...` |
| `AI_PROVIDER` | ✅ | AI provider to use | `openai` / `openrouter` / `claude` |
| `OPENAI_API_KEY` | * | OpenAI API key | `sk-...` |
| `OPENAI_MODEL` | * | OpenAI model name | `gpt-3.5-turbo` |
| `OPENROUTER_API_KEY` | * | OpenRouter API key | `sk-or-...` |
| `OPENROUTER_MODEL` | * | OpenRouter model | `openai/gpt-4` |
| `ANTHROPIC_API_KEY` | * | Anthropic API key | `sk-ant-...` |
| `CLAUDE_MODEL` | * | Claude model name | `claude-3-sonnet-20240229` |
| `WEBHOOK_URL` | ❌ | Production webhook URL | `https://your-app.vercel.app/api/webhook` |
| `DEBUG` | ❌ | Enable debug logging | `true` / `false` |

\* Required based on chosen `AI_PROVIDER`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🔄 CI/CD & Quality Gates

This project includes comprehensive GitHub Actions workflows for continuous integration and quality assurance:

### Automated Quality Checks

- ✅ **Linting** - ESLint checks on all TypeScript files
- ✅ **Type Checking** - TypeScript strict mode validation
- ✅ **Testing** - Jest unit tests with coverage reporting
- ✅ **Coverage Thresholds** - Enforced at 70% statements, 60% branches, 70% functions, 70% lines
- ✅ **Security Scanning** - npm audit for vulnerabilities
- ✅ **Shell Script Validation** - ShellCheck for bash scripts
- ✅ **Build Verification** - TypeScript compilation check
- ✅ **Multi-version Testing** - Tests on Node.js 18.x and 20.x

### Quality Gates for Pull Requests

All PRs must pass:
- Linting without errors
- Type checking without errors
- All tests passing with minimum coverage
- Build succeeds without warnings
- No high/critical security vulnerabilities
- Valid shell script syntax

### Running Checks Locally

Before submitting a PR, run:

```bash
# Run all checks
npm run validate

# Or individually:
npm run lint          # Check code style
npm run type-check    # Check TypeScript types
npm test              # Run tests
npm run test:coverage # Run tests with coverage
npm run build         # Build project
```

See [CI_CD.md](CI_CD.md) for complete documentation on CI/CD pipelines.

## 📄 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Bot doesn't respond locally

1. Check that your `.env` file has correct values
2. Verify `TELEGRAM_BOT_TOKEN` is valid
3. Make sure you've sent `/start` to the bot first
4. Check console logs for errors

### Webhook not working on Vercel

1. Verify webhook is set correctly: `https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Check Vercel logs: `vercel logs`
3. Ensure environment variables are set in Vercel dashboard
4. Test the endpoint directly: `curl https://your-app.vercel.app/api/webhook`

### Database connection errors

1. Verify Supabase URL and key are correct
2. Check that `user_states` table exists (run `schema.sql`)
3. Ensure Supabase project is active (not paused)
4. Check Supabase dashboard for connection logs

### AI provider errors

1. Verify API key is valid and has credits
2. Check API provider status page
3. Try switching to a different model
4. Review rate limits for your API plan

## 🔗 Resources

- [Telegram Bot API Documentation](https://core.telegram.org/bots/api)
- [XState Documentation](https://xstate.js.org/)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenRouter Documentation](https://openrouter.ai/docs)
- [Anthropic Claude Documentation](https://docs.anthropic.com/)

## 💡 Tips

- **Keep conversation history manageable**: Limit history to last 10-20 messages to reduce token costs
- **Use environment-specific configs**: Different settings for dev/staging/prod
- **Monitor costs**: Set up billing alerts in your AI provider dashboard
- **Implement retry logic**: Handle transient failures gracefully
- **Cache responses**: Consider caching common queries
- **Use webhooks in production**: More efficient than polling

---

Built with ❤️ using TypeScript, XState, and modern serverless architecture.