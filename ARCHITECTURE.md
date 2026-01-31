# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         User sends message in Telegram                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Telegram Webhook     │
                    │  (api.telegram.org)    │
                    └────────────┬───────────┘
                                 │
                                 │ POST /api/webhook
                                 ▼
                    ┌────────────────────────┐
                    │   Vercel Serverless    │
                    │   (api/webhook.ts)     │
                    └────────────┬───────────┘
                                 │
                                 │ Parse & Route
                                 ▼
                    ┌────────────────────────┐
                    │      BotHandler        │
                    │ (src/services/)        │
                    └───┬─────────────┬──────┘
                        │             │
        ┌───────────────┴─────┐       │
        │                     │       │
        ▼                     ▼       ▼
┌───────────────┐   ┌────────────────┐   ┌─────────────┐
│   XState FSM  │   │  AI Service    │   │  Database   │
│   (Dialog     │   │  (Multi-       │   │  Service    │
│   Management) │   │   provider)    │   │  (Supabase) │
└───────────────┘   └────────────────┘   └─────────────┘
        │                     │                   │
        │                     │                   │
        ▼                     ▼                   ▼
    State                 OpenAI/              User State
    Transitions           OpenRouter/          & History
    (idle→waiting→        Claude API           Storage
    processing→
    responded)
```

## State Machine Flow

```
Initial State: IDLE
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────┐                                                     │
│  │  IDLE   │  <── User is inactive, waiting for input           │
│  └────┬────┘                                                     │
│       │                                                          │
│       │ Event: MESSAGE_RECEIVED                                 │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────┐                                                    │
│  │ WAITING  │  <── Message received, preparing to process       │
│  └────┬─────┘                                                    │
│       │                                                          │
│       │ (immediate transition)                                  │
│       │                                                          │
│       ▼                                                          │
│  ┌────────────┐                                                 │
│  │ PROCESSING │  <── Sending to AI and waiting for response     │
│  └─┬────────┬─┘                                                 │
│    │        │                                                    │
│    │        │ Event: AI_RESPONSE_ERROR                          │
│    │        └──────────────┐                                    │
│    │                       │                                    │
│    │ Event: AI_RESPONSE_SUCCESS                                │
│    │                       │                                    │
│    ▼                       ▼                                    │
│  ┌───────────┐        ┌────────┐                               │
│  │ RESPONDED │        │ (Back  │                               │
│  └─────┬─────┘        │  to    │                               │
│        │              │ IDLE)  │                               │
│        │              └────────┘                               │
│        │ (immediate transition)                                │
│        │                                                        │
│        └────────────────────────────────────────────────────┐  │
│                                                             │  │
│                                                             ▼  │
│                                                         ┌──────┴┐
│                                                         │ IDLE  │
└─────────────────────────────────────────────────────────┴───────┘
```

## Data Flow

```
1. Incoming Message
   ┌──────────────────────────────────────────┐
   │ {                                        │
   │   "message": {                           │
   │     "from": { "id": 123, ... },          │
   │     "chat": { "id": 123 },               │
   │     "text": "Hello bot!"                 │
   │   }                                      │
   │ }                                        │
   └──────────────┬───────────────────────────┘
                  │
                  ▼
2. Database Lookup
   ┌──────────────────────────────────────────┐
   │ SELECT * FROM user_states                │
   │ WHERE user_id = 123                      │
   │ AND chat_id = 123                        │
   └──────────────┬───────────────────────────┘
                  │
                  ▼
3. Get Conversation History
   ┌──────────────────────────────────────────┐
   │ [                                        │
   │   { role: "user", content: "Hi" },       │
   │   { role: "assistant", content: "..." }  │
   │ ]                                        │
   └──────────────┬───────────────────────────┘
                  │
                  ▼
4. Send to AI Provider
   ┌──────────────────────────────────────────┐
   │ POST https://api.openai.com/v1/chat/... │
   │ {                                        │
   │   "model": "gpt-3.5-turbo",              │
   │   "messages": [...]                      │
   │ }                                        │
   └──────────────┬───────────────────────────┘
                  │
                  ▼
5. Receive AI Response
   ┌──────────────────────────────────────────┐
   │ {                                        │
   │   "content": "Hello! How can I help?",   │
   │   "tokensUsed": 25                       │
   │ }                                        │
   └──────────────┬───────────────────────────┘
                  │
                  ▼
6. Update Database
   ┌──────────────────────────────────────────┐
   │ UPDATE user_states                       │
   │ SET conversation_history = [...],        │
   │     state = 'idle',                      │
   │     updated_at = NOW()                   │
   │ WHERE user_id = 123                      │
   └──────────────┬───────────────────────────┘
                  │
                  ▼
7. Send Response to User
   ┌──────────────────────────────────────────┐
   │ POST https://api.telegram.org/bot.../   │
   │      sendMessage                         │
   │ {                                        │
   │   "chat_id": 123,                        │
   │   "text": "Hello! How can I help?"       │
   │ }                                        │
   └──────────────────────────────────────────┘
```

## File Structure & Responsibilities

```
serverless-bot-boilerplate/
│
├── api/
│   └── webhook.ts              ➜ Vercel serverless entry point
│                                  - Receives Telegram webhooks
│                                  - Delegates to BotHandler
│
├── src/
│   ├── machines/
│   │   └── botMachine.ts       ➜ XState FSM definition
│   │                              - Defines states and transitions
│   │                              - Manages context and actions
│   │
│   ├── services/
│   │   ├── botHandler.ts       ➜ Main orchestration logic
│   │   │                          - Coordinates FSM, AI, and DB
│   │   │                          - Handles Telegram commands
│   │   │
│   │   ├── aiService.ts        ➜ AI provider abstraction
│   │   │                          - OpenAI integration
│   │   │                          - OpenRouter integration
│   │   │                          - Claude integration
│   │   │
│   │   └── databaseService.ts  ➜ Supabase operations
│   │                              - CRUD for user states
│   │                              - Conversation history
│   │
│   ├── types/
│   │   └── index.ts            ➜ TypeScript definitions
│   │                              - Interfaces and types
│   │
│   ├── utils/
│   │   ├── config.ts           ➜ Configuration loader
│   │   │                          - Environment variables
│   │   │                          - Provider selection
│   │   │
│   │   └── logger.ts           ➜ Logging utility
│   │                              - Console logging
│   │                              - Debug mode support
│   │
│   └── local.ts                ➜ Local development server
│                                  - Polling mode
│                                  - Express server
│
├── examples/                   ➜ Extension examples
│   ├── extendedFormMachine.ts     - Multi-step form FSM
│   ├── alternativeAIProviders.ts  - Additional AI providers
│   └── multiChannelSupport.ts     - Discord/Slack support
│
└── Configuration Files
    ├── package.json            ➜ Dependencies
    ├── tsconfig.json           ➜ TypeScript config
    ├── vercel.json             ➜ Vercel deployment
    ├── .eslintrc.json          ➜ ESLint rules
    └── jest.config.js          ➜ Jest testing config
```

## Deployment Architecture

### Local Development
```
Developer Machine
├── Node.js Process (polling mode)
│   └── src/local.ts
└── Connects to:
    ├── Telegram API (long polling)
    ├── Supabase (direct connection)
    └── AI Provider (direct connection)
```

### Production (Vercel)
```
Telegram → Webhook → Vercel Function → Services
                        ↓
                    Cold Start (~1-2s) or
                    Warm Start (~100-200ms)
                        ↓
                    Execute Handler
                        ↓
                    Return Response
                        ↓
                    Auto-scale as needed
```

## Security & Best Practices

```
🔒 Environment Variables
   ├── Never commit .env files
   ├── Use Vercel secrets for production
   └── Rotate keys regularly

🔐 API Keys
   ├── Store in environment variables
   ├── Use read-only keys where possible
   └── Monitor usage and set limits

🛡️ Input Validation
   ├── Validate all user inputs
   ├── Sanitize before processing
   └── Handle edge cases gracefully

⚡ Performance
   ├── Limit conversation history (10-20 messages)
   ├── Use connection pooling for database
   └── Implement request timeouts

📊 Monitoring
   ├── Log all errors with context
   ├── Track API usage and costs
   └── Set up alerts for failures
```

## Scalability

The architecture is designed to scale:

- **Horizontal Scaling**: Vercel auto-scales serverless functions
- **Stateless**: Each request is independent (state in database)
- **Multi-User**: Isolated contexts per user in database
- **Cost-Effective**: Pay only for actual usage
- **Global**: Vercel edge network for low latency

## Extension Points

```
1. Add New Commands
   └─ Modify: src/services/botHandler.ts
   
2. Add New AI Providers
   └─ Modify: src/services/aiService.ts
   
3. Add New Dialog States
   └─ Modify: src/machines/botMachine.ts
   
4. Add Multi-Channel Support
   └─ Create: new adapters in src/services/
   
5. Add Middleware
   └─ Create: new middleware in src/middleware/
```
