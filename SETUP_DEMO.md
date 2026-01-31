# Setup Script Demo

## Interactive Setup Wizard (`./setup.sh`)

The setup script provides a fully automated, interactive configuration and deployment experience.

### Features Demonstration

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖  Serverless Telegram Bot Setup Wizard  🤖           ║
║                                                           ║
║   This script will help you configure and deploy         ║
║   your Telegram bot with AI integration                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

ℹ Starting interactive setup process...

═══════════════════════════════════════════════════════
  Checking Prerequisites
═══════════════════════════════════════════════════════

✓ Node.js v20.10.0 is installed
✓ npm 10.2.3 is installed
✓ git is installed
✓ Dependencies already installed

═══════════════════════════════════════════════════════
  Bot Configuration
═══════════════════════════════════════════════════════

ℹ Let's configure your Telegram bot...

ℹ Step 1: Telegram Bot Token
  - Open Telegram and search for @BotFather
  - Send /newbot and follow the instructions
  - Copy the bot token you receive

Enter your Telegram Bot Token: **********************

═══════════════════════════════════════════════════════
  AI Provider Configuration
═══════════════════════════════════════════════════════

ℹ Choose your AI provider:

  1) OpenAI (gpt-3.5-turbo, gpt-4)
  2) OpenRouter (access to multiple models)
  3) Claude (Anthropic)

Enter your choice (1-3) [default: 1]: 1

ℹ OpenAI Configuration
  - Go to platform.openai.com
  - Create an API key in the API section

Enter your OpenAI API Key: **********************
Enter OpenAI model [default: gpt-3.5-turbo]: gpt-4

═══════════════════════════════════════════════════════
  Database Configuration (Supabase)
═══════════════════════════════════════════════════════

ℹ Supabase Setup
  - Go to supabase.com and sign up
  - Create a new project
  - Go to Settings > API to find your credentials
  - Run the SQL from schema.sql in the SQL Editor

Enter your Supabase URL: https://xxxxx.supabase.co
Enter your Supabase Anon Key: **********************

Enable debug mode? (true/false) [default: false]: true

═══════════════════════════════════════════════════════
  Creating Configuration File
═══════════════════════════════════════════════════════

ℹ Writing .env file...
✓ .env file created successfully!

═══════════════════════════════════════════════════════
  Testing Local Configuration
═══════════════════════════════════════════════════════

ℹ Running type check...
✓ Type check passed!
ℹ Running tests...
✓ Tests passed!

═══════════════════════════════════════════════════════
  Deployment Configuration
═══════════════════════════════════════════════════════

ℹ Choose your deployment platform:

  1) Vercel (recommended)
  2) Manual deployment (I'll deploy later)
  3) Local testing only (no deployment)

Enter your choice (1-3) [default: 1]: 1

ℹ Deploying to Vercel...
ℹ Starting Vercel deployment...

Vercel CLI 33.0.1
🔍 Inspect: https://vercel.com/xxx/yyy [1s]
✅ Production: https://your-bot.vercel.app [45s]

✓ Deployment initiated!

ℹ Next steps:
  1. Go to your Vercel dashboard
  2. Add environment variables:
     - TELEGRAM_BOT_TOKEN
     - AI_PROVIDER
     - API keys for your chosen provider
     - SUPABASE_URL
     - SUPABASE_KEY
  3. Get your deployment URL from Vercel
  4. Run the webhook setup command below

Enter your Vercel deployment URL: https://your-bot.vercel.app

ℹ Setting Telegram webhook...
✓ Webhook set successfully!

ℹ Verifying webhook...
{
  "ok": true,
  "result": {
    "url": "https://your-bot.vercel.app/api/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}

═══════════════════════════════════════════════════════
  Creating Deployment Instructions
═══════════════════════════════════════════════════════

✓ Deployment instructions saved to DEPLOYMENT_INSTRUCTIONS.md

═══════════════════════════════════════════════════════
  Setup Complete! 🎉
═══════════════════════════════════════════════════════

╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✓  Your bot is configured and ready!                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

✓ Configuration file created: .env
✓ Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md

ℹ To start your bot locally, run:
  npm run dev

ℹ To deploy to production, see:
  DEPLOYMENT_INSTRUCTIONS.md

ℹ Bot commands:
  /start - Initialize the bot
  /help  - Show help message
  /clear - Clear conversation history

✓ Happy botting! 🤖
```

## Quick Environment Update (`./update-env.sh`)

For updating specific environment variables after initial setup:

```
╔═══════════════════════════════════════╗
║  Environment Variable Quick Update    ║
╚═══════════════════════════════════════╝

ℹ Current configuration:

TELEGRAM_BOT_TOKEN=***
AI_PROVIDER=openai
OPENAI_API_KEY=***
OPENAI_MODEL=gpt-3.5-turbo
SUPABASE_URL=***
SUPABASE_KEY=***
DEBUG=false

ℹ What would you like to update?

  1) Telegram Bot Token
  2) AI Provider
  3) OpenAI API Key
  4) OpenRouter API Key
  5) Claude API Key
  6) Supabase credentials
  7) Debug mode
  8) Exit

Enter your choice: 2
  1) OpenAI
  2) OpenRouter
  3) Claude
Choose provider: 2
✓ AI Provider updated!

ℹ Restart your bot for changes to take effect:
  npm run dev
```

## Key Benefits

1. **Zero Configuration Needed**: Script handles everything
2. **Interactive Prompts**: Clear guidance at each step
3. **Validation**: Tests configuration before proceeding
4. **Automatic Deployment**: Optional one-click Vercel deploy
5. **Error Handling**: Checks prerequisites and validates inputs
6. **Documentation**: Generates custom deployment guide
7. **Quick Updates**: Separate script for changing individual settings

## Time to Deploy

- **Manual Setup**: ~30 minutes
- **With setup.sh**: **< 5 minutes** ⚡

## Usage

```bash
# First time setup
./setup.sh

# Update environment variables
./update-env.sh

# Start bot locally
npm run dev
```

That's it! Your bot is ready to chat. 🤖
