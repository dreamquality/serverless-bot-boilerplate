# Quick Start Guide

Get your Telegram bot up and running in 5 minutes!

## 🎯 Automated Setup (Easiest Way)

**Skip manual setup!** Run our interactive wizard:

```bash
./setup.sh
```

The script will automatically:
- Install dependencies
- Collect all API keys
- Configure environment
- Test configuration
- Deploy to Vercel (optional)
- Set up webhooks

**Done in under 5 minutes!** ✨

---

## 📋 Manual Setup (Alternative)

If you prefer manual configuration, follow these steps:

## Prerequisites

- Node.js 18+ installed
- Telegram account
- Free Supabase account
- OpenAI API key (or alternative AI provider)

## Step-by-Step Setup

### 1. Get Your Telegram Bot Token (2 minutes)

1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` command
3. Follow the prompts to name your bot
4. Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Set Up Supabase (3 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in project details and click "Create new project"
4. Wait for project to initialize (~2 minutes)
5. Go to **SQL Editor** → Click "New Query"
6. Copy and paste the contents of `schema.sql` from this repo
7. Click "Run" to create the database table
8. Go to **Settings** → **API** → Copy:
   - Project URL
   - Anon/public key

### 3. Get Your AI API Key (1 minute)

Choose one option:

**Option A: OpenAI (Recommended)**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

**Option B: OpenRouter (Alternative)**
1. Go to [openrouter.ai](https://openrouter.ai)
2. Sign up / Log in
3. Go to Keys section
4. Create a new API key
5. Copy the key

### 4. Install and Configure (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/serverless-bot-boilerplate.git
cd serverless-bot-boilerplate

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
nano .env  # or use your favorite editor
```

In the `.env` file, replace:
```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
OPENAI_API_KEY=your_openai_key_here
```

### 5. Start the Bot (1 minute)

```bash
npm run dev
```

You should see:
```
[INFO] Bot started in polling mode
[INFO] Bot is ready! Send messages in Telegram to test.
```

### 6. Test It! (1 minute)

1. Open Telegram
2. Find your bot (search for the username you created)
3. Send `/start`
4. Send any message like "Hello!"
5. Watch your bot respond with AI-powered answers! 🎉

## Next Steps

### Deploy to Production (10 minutes)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add environment variables in Vercel dashboard

4. Set webhook:
   ```bash
   curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-app.vercel.app/api/webhook"
   ```

### Common Commands

- `/start` - Initialize the bot
- `/help` - Show help message
- `/clear` - Clear conversation history

## Troubleshooting

**Bot not responding?**
- Check that your `.env` file has all required values
- Verify your bot token is correct
- Make sure the Supabase table was created successfully

**Database errors?**
- Verify you ran the `schema.sql` in Supabase SQL Editor
- Check your Supabase URL and key are correct

**AI errors?**
- Verify your OpenAI API key is valid
- Check you have credits in your OpenAI account
- Try switching to a different model (e.g., `gpt-3.5-turbo`)

## What You Get

✅ Fully functional AI-powered Telegram bot  
✅ Multi-user support with persistent conversations  
✅ State machine-based dialog management  
✅ Easy to extend with new features  
✅ Production-ready for serverless deployment  

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- See [examples/](examples/) for extension examples
- Open an issue on GitHub

Happy botting! 🤖
