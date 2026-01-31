# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2024-01-31

### Added
- **GitHub Actions CI/CD pipelines** for comprehensive quality gates
  - Main CI workflow with multi-version Node.js testing (18.x, 20.x)
  - Code quality workflow with coverage reporting
  - PR validation workflow with size and conflict checks
  - Security scanning with npm audit
  - Shell script validation with ShellCheck
  - Documentation validation
  - Deployment readiness checks
  - Automated release workflow
- **Code coverage reporting** with Codecov integration
- **Status badges** in README for CI, code quality, and license
- **Markdown linting** configuration (`.markdownlint.json`)
- Coverage thresholds enforcement (70% statements, 60% branches, 70% functions, 70% lines)

### Improved
- Enhanced README with CI/CD badges
- Better quality assurance with automated testing
- Continuous integration for all pull requests
- Security vulnerability scanning

## [1.2.2] - 2024-01-31

### Fixed
- **Edge case handling** for improved robustness
  - Added message length validation (4000 character limit)
  - Added conversation history limits (20 messages) to prevent unbounded growth
  - Added API response structure validation for all AI providers
  - Added response status validation for all database operations
  - Added max_tokens limit (500) for OpenAI to control costs
  - Added error logging for failed Telegram message sends

### Improved
- Better error handling in edge functions
- Validation for empty messages and invalid inputs
- Cost control measures for AI API usage
- Silent failure prevention across all services

## [1.2.1] - 2024-01-31

### Fixed
- **Type consistency** improvements
  - Changed `ConversationMessage.timestamp` from `Date` to `string` (ISO 8601)
  - Fixed FSM context initialization to use `withContext()`
  - Fixed `createBotMachineInstance` to properly use parameters
  - Fixed unused parameter warnings

### Improved
- Error handling with response validation in database operations
- AI provider validation at edge function startup
- Portable shell script with proper sed usage and value escaping
- All timestamps now use ISO 8601 strings consistently

## [1.2.0] - 2024-01-31

### Added
- **Supabase Edge Functions support** as alternative deployment platform
  - Deno-based edge function handler (`supabase/functions/telegram-bot/index.ts`)
  - Automated deployment via setup script
  - Supabase CLI integration
  - Environment secrets management
  - Complete documentation in `supabase/README.md`
- Updated setup script with Supabase Edge Functions deployment option
- Automatic webhook configuration for Supabase deployments
- Edge function local testing support

### Improved
- Deployment flexibility: Choose between Vercel or Supabase Edge Functions
- Enhanced documentation with both deployment options
- Updated README with Supabase deployment instructions

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
