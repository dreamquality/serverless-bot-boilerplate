# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-01-31

### Added
- **Interactive setup script** (`setup.sh`) for automated configuration
  - Automatic prerequisite checking (Node.js, npm, git)
  - Interactive prompts for API keys and credentials
  - AI provider selection wizard (OpenAI/OpenRouter/Claude)
  - Automatic .env file generation
  - Built-in configuration testing
  - Optional Vercel deployment automation
  - Automatic Telegram webhook setup
  - Generates deployment instructions file
- **Environment update script** (`update-env.sh`) for quick credential updates
- Updated README and QUICKSTART with automated setup instructions

### Improved
- Simplified onboarding process from manual to fully automated
- Enhanced documentation with setup wizard information
- Better developer experience with guided configuration

## [1.0.0] - 2024-01-31

### Added
- Initial release of serverless Telegram bot boilerplate
- XState-based FSM for dialog management (idle → waiting → processing → responded)
- Multi-AI provider support (OpenAI, OpenRouter, Claude)
- Supabase integration for user state persistence
- Multi-user context support
- Vercel serverless deployment configuration
- Local development server with polling mode
- Comprehensive TypeScript types
- Error handling and logging
- Example tests with Jest
- Complete documentation and setup guide
- Database schema for Supabase
- Environment variable configuration
- ESLint and TypeScript configuration
- Bot commands: /start, /clear, /help

### Features
- Serverless architecture ready for Vercel
- Persistent conversation history
- Easy AI provider switching
- Full type safety with TypeScript
- Local testing with hot reload
- Webhook and polling mode support
- Robust error handling with fallback states

### Documentation
- Comprehensive README with setup instructions
- Architecture diagrams
- API provider configuration guide
- Deployment guide for Vercel
- Troubleshooting section
- Extension examples
- Contributing guidelines
