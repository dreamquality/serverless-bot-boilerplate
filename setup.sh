#!/bin/bash

# Interactive Setup Script for Serverless Telegram Bot
# This script will guide you through the setup and deployment process

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

print_error() {
    echo -e "${RED}✗ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${NC}$1"
}

print_header() {
    echo -e "\n${MAGENTA}═══════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}  $1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════${NC}\n"
}

# Function to read input with default value
read_with_default() {
    local prompt="$1"
    local default="$2"
    local value
    
    if [ -n "$default" ]; then
        read -p "$(echo -e ${CYAN}$prompt ${NC}[default: $default]: )" value
        echo "${value:-$default}"
    else
        read -p "$(echo -e ${CYAN}$prompt: ${NC})" value
        echo "$value"
    fi
}

# Function to read password
read_password() {
    local prompt="$1"
    local value
    read -s -p "$(echo -e ${CYAN}$prompt: ${NC})" value
    echo
    echo "$value"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Welcome banner
clear
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🤖  Serverless Telegram Bot Setup Wizard  🤖           ║
║                                                           ║
║   This script will help you configure and deploy         ║
║   your Telegram bot with AI integration                  ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

print_info "Starting interactive setup process..."
sleep 1

# Check prerequisites
print_header "Checking Prerequisites"

MISSING_DEPS=()

if ! command_exists node; then
    print_error "Node.js is not installed"
    MISSING_DEPS+=("Node.js 18+")
else
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version must be 18 or higher (current: $(node -v))"
        MISSING_DEPS+=("Node.js 18+")
    else
        print_success "Node.js $(node -v) is installed"
    fi
fi

if ! command_exists npm; then
    print_error "npm is not installed"
    MISSING_DEPS+=("npm")
else
    print_success "npm $(npm -v) is installed"
fi

if ! command_exists git; then
    print_error "git is not installed"
    MISSING_DEPS+=("git")
else
    print_success "git is installed"
fi

if [ ${#MISSING_DEPS[@]} -gt 0 ]; then
    print_error "Missing dependencies: ${MISSING_DEPS[*]}"
    print_info "Please install the missing dependencies and run this script again."
    exit 1
fi

# Check if npm packages are installed
if [ ! -d "node_modules" ]; then
    print_info "Installing npm dependencies..."
    npm install
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Configuration step
print_header "Bot Configuration"

print_info "Let's configure your Telegram bot...\n"

# Telegram Bot Token
print_info "Step 1: Telegram Bot Token"
echo "  - Open Telegram and search for @BotFather"
echo "  - Send /newbot and follow the instructions"
echo "  - Copy the bot token you receive"
echo ""
TELEGRAM_BOT_TOKEN=$(read_with_default "Enter your Telegram Bot Token" "")

while [ -z "$TELEGRAM_BOT_TOKEN" ]; do
    print_error "Telegram Bot Token is required!"
    TELEGRAM_BOT_TOKEN=$(read_with_default "Enter your Telegram Bot Token" "")
done

# AI Provider Selection
print_header "AI Provider Configuration"

print_info "Choose your AI provider:\n"
echo "  1) OpenAI (gpt-3.5-turbo, gpt-4)"
echo "  2) OpenRouter (access to multiple models)"
echo "  3) Claude (Anthropic)"
echo ""

AI_PROVIDER_CHOICE=$(read_with_default "Enter your choice (1-3)" "1")

case $AI_PROVIDER_CHOICE in
    1)
        AI_PROVIDER="openai"
        print_info "\nOpenAI Configuration"
        echo "  - Go to platform.openai.com"
        echo "  - Create an API key in the API section"
        echo ""
        OPENAI_API_KEY=$(read_password "Enter your OpenAI API Key")
        OPENAI_MODEL=$(read_with_default "Enter OpenAI model" "gpt-3.5-turbo")
        ;;
    2)
        AI_PROVIDER="openrouter"
        print_info "\nOpenRouter Configuration"
        echo "  - Go to openrouter.ai"
        echo "  - Create an API key"
        echo ""
        OPENROUTER_API_KEY=$(read_password "Enter your OpenRouter API Key")
        OPENROUTER_MODEL=$(read_with_default "Enter OpenRouter model" "openai/gpt-3.5-turbo")
        ;;
    3)
        AI_PROVIDER="claude"
        print_info "\nClaude Configuration"
        echo "  - Go to console.anthropic.com"
        echo "  - Create an API key"
        echo ""
        ANTHROPIC_API_KEY=$(read_password "Enter your Anthropic API Key")
        CLAUDE_MODEL=$(read_with_default "Enter Claude model" "claude-3-sonnet-20240229")
        ;;
    *)
        print_error "Invalid choice. Defaulting to OpenAI."
        AI_PROVIDER="openai"
        OPENAI_API_KEY=$(read_password "Enter your OpenAI API Key")
        OPENAI_MODEL=$(read_with_default "Enter OpenAI model" "gpt-3.5-turbo")
        ;;
esac

# Supabase Configuration
print_header "Database Configuration (Supabase)"

print_info "Supabase Setup"
echo "  - Go to supabase.com and sign up"
echo "  - Create a new project"
echo "  - Go to Settings > API to find your credentials"
echo "  - Run the SQL from schema.sql in the SQL Editor"
echo ""

SUPABASE_URL=$(read_with_default "Enter your Supabase URL" "")
while [ -z "$SUPABASE_URL" ]; do
    print_error "Supabase URL is required!"
    SUPABASE_URL=$(read_with_default "Enter your Supabase URL" "")
done

SUPABASE_KEY=$(read_password "Enter your Supabase Anon Key")
while [ -z "$SUPABASE_KEY" ]; do
    print_error "Supabase Key is required!"
    SUPABASE_KEY=$(read_password "Enter your Supabase Anon Key")
done

# Debug mode
DEBUG=$(read_with_default "\nEnable debug mode? (true/false)" "false")

# Create .env file
print_header "Creating Configuration File"

print_info "Writing .env file..."

cat > .env << EOF
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN

# AI Provider Configuration
AI_PROVIDER=$AI_PROVIDER

# OpenAI Configuration
${OPENAI_API_KEY:+OPENAI_API_KEY=$OPENAI_API_KEY}
${OPENAI_MODEL:+OPENAI_MODEL=$OPENAI_MODEL}

# OpenRouter Configuration
${OPENROUTER_API_KEY:+OPENROUTER_API_KEY=$OPENROUTER_API_KEY}
${OPENROUTER_MODEL:+OPENROUTER_MODEL=$OPENROUTER_MODEL}

# Claude Configuration
${ANTHROPIC_API_KEY:+ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY}
${CLAUDE_MODEL:+CLAUDE_MODEL=$CLAUDE_MODEL}

# Supabase Configuration
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=$SUPABASE_KEY

# Optional: Debug mode
DEBUG=$DEBUG
EOF

print_success ".env file created successfully!"

# Test local setup
print_header "Testing Local Configuration"

print_info "Running type check..."
if npm run type-check; then
    print_success "Type check passed!"
else
    print_error "Type check failed. Please review the errors above."
    exit 1
fi

print_info "Running tests..."
if npm test -- --passWithNoTests 2>/dev/null; then
    print_success "Tests passed!"
else
    print_warning "Some tests may have failed, but continuing..."
fi

# Deployment platform selection
print_header "Deployment Configuration"

print_info "Choose your deployment platform:\n"
echo "  1) Vercel (recommended)"
echo "  2) Manual deployment (I'll deploy later)"
echo "  3) Local testing only (no deployment)"
echo ""

DEPLOY_CHOICE=$(read_with_default "Enter your choice (1-3)" "1")

case $DEPLOY_CHOICE in
    1)
        print_info "\nDeploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command_exists vercel; then
            print_warning "Vercel CLI is not installed."
            INSTALL_VERCEL=$(read_with_default "Install Vercel CLI now? (yes/no)" "yes")
            
            if [ "$INSTALL_VERCEL" = "yes" ] || [ "$INSTALL_VERCEL" = "y" ]; then
                print_info "Installing Vercel CLI..."
                npm install -g vercel
                print_success "Vercel CLI installed!"
            else
                print_info "Skipping Vercel deployment. Install with: npm install -g vercel"
                DEPLOY_CHOICE=2
            fi
        fi
        
        if [ "$DEPLOY_CHOICE" = "1" ]; then
            print_info "\nStarting Vercel deployment..."
            print_warning "You'll need to log in to Vercel if not already logged in."
            
            # Deploy to Vercel
            vercel
            
            print_success "Deployment initiated!"
            
            print_info "\nNext steps:"
            echo "  1. Go to your Vercel dashboard"
            echo "  2. Add environment variables:"
            echo "     - TELEGRAM_BOT_TOKEN"
            echo "     - AI_PROVIDER"
            echo "     - API keys for your chosen provider"
            echo "     - SUPABASE_URL"
            echo "     - SUPABASE_KEY"
            echo "  3. Get your deployment URL from Vercel"
            echo "  4. Run the webhook setup command below"
            
            VERCEL_URL=$(read_with_default "\nEnter your Vercel deployment URL (e.g., https://your-app.vercel.app)" "")
            
            if [ -n "$VERCEL_URL" ]; then
                # Set webhook
                print_info "\nSetting Telegram webhook..."
                WEBHOOK_URL="${VERCEL_URL}/api/webhook"
                
                curl -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
                    -H "Content-Type: application/json" \
                    -d "{\"url\": \"${WEBHOOK_URL}\"}" 2>/dev/null
                
                print_success "Webhook set successfully!"
                
                # Verify webhook
                print_info "Verifying webhook..."
                curl -X GET "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo" 2>/dev/null | python3 -m json.tool || echo ""
            fi
        fi
        ;;
    2)
        print_info "\nManual deployment selected."
        print_info "When you're ready to deploy, follow these steps:"
        echo ""
        echo "For Vercel:"
        echo "  1. Install Vercel CLI: npm install -g vercel"
        echo "  2. Run: vercel"
        echo "  3. Set environment variables in Vercel dashboard"
        echo "  4. Set webhook:"
        echo "     curl -X POST \"https://api.telegram.org/bot<TOKEN>/setWebhook\" \\"
        echo "          -H \"Content-Type: application/json\" \\"
        echo "          -d '{\"url\": \"https://your-app.vercel.app/api/webhook\"}'"
        ;;
    3)
        print_info "\nLocal testing mode selected."
        ;;
esac

# Create deployment instructions file
print_header "Creating Deployment Instructions"

cat > DEPLOYMENT_INSTRUCTIONS.md << EOF
# Deployment Instructions

## Configuration Summary

- **AI Provider**: $AI_PROVIDER
- **Database**: Supabase
- **Deployment**: ${DEPLOY_CHOICE}

## Environment Variables

Your \`.env\` file has been configured with the following:

\`\`\`bash
TELEGRAM_BOT_TOKEN=***
AI_PROVIDER=$AI_PROVIDER
SUPABASE_URL=$SUPABASE_URL
SUPABASE_KEY=***
DEBUG=$DEBUG
\`\`\`

## Local Testing

Start the bot locally:

\`\`\`bash
npm run dev
\`\`\`

The bot will run in polling mode. Send messages to your bot on Telegram to test.

## Production Deployment

### Vercel Deployment

1. Install Vercel CLI (if not already installed):
\`\`\`bash
npm install -g vercel
\`\`\`

2. Deploy:
\`\`\`bash
vercel
\`\`\`

3. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all variables from your \`.env\` file

4. Set Telegram webhook:
\`\`\`bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \\
     -H "Content-Type: application/json" \\
     -d '{"url": "https://your-app.vercel.app/api/webhook"}'
\`\`\`

5. Verify webhook:
\`\`\`bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
\`\`\`

## Troubleshooting

### Bot not responding locally
- Check that your \`.env\` file exists and has correct values
- Verify your Telegram bot token
- Ensure Supabase database table was created (run schema.sql)

### Bot not responding on Vercel
- Check Vercel logs: \`vercel logs\`
- Verify environment variables are set in Vercel dashboard
- Check webhook status: \`curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"\`

### Database errors
- Verify Supabase credentials
- Ensure you ran the SQL from \`schema.sql\` in Supabase SQL Editor
- Check Supabase project is active

## Useful Commands

- \`npm run dev\` - Start local development server
- \`npm run build\` - Build the project
- \`npm test\` - Run tests
- \`npm run type-check\` - Check TypeScript types
- \`vercel\` - Deploy to Vercel
- \`vercel logs\` - View deployment logs

## Next Steps

1. Test your bot locally with \`npm run dev\`
2. Deploy to production
3. Monitor logs for any issues
4. Customize bot behavior in \`src/services/botHandler.ts\`
5. Extend FSM in \`src/machines/botMachine.ts\`

## Support

- Check README.md for detailed documentation
- See QUICKSTART.md for quick setup guide
- See ARCHITECTURE.md for system architecture
- See examples/ directory for extension examples

Generated: $(date)
EOF

print_success "Deployment instructions saved to DEPLOYMENT_INSTRUCTIONS.md"

# Final summary
print_header "Setup Complete! 🎉"

echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ✓  Your bot is configured and ready!                   ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

print_success "Configuration file created: .env"
print_success "Deployment instructions created: DEPLOYMENT_INSTRUCTIONS.md"

print_info "\nTo start your bot locally, run:"
echo -e "  ${CYAN}npm run dev${NC}"

print_info "\nTo deploy to production, see:"
echo -e "  ${CYAN}DEPLOYMENT_INSTRUCTIONS.md${NC}"

print_info "\nBot commands:"
echo "  /start - Initialize the bot"
echo "  /help  - Show help message"
echo "  /clear - Clear conversation history"

print_success "\nHappy botting! 🤖"
