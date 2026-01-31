#!/bin/bash

# Quick Environment Update Script
# Use this to quickly update specific environment variables

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✓ ${NC}$1"
}

echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════╗
║  Environment Variable Quick Update    ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}\n"

if [ ! -f ".env" ]; then
    print_info "No .env file found. Run ./setup.sh first."
    exit 1
fi

print_info "Current configuration:"
echo ""
grep -E "^[^#]" .env | sed 's/=.*/=***/' || true
echo ""

print_info "What would you like to update?\n"
echo "  1) Telegram Bot Token"
echo "  2) AI Provider"
echo "  3) OpenAI API Key"
echo "  4) OpenRouter API Key"
echo "  5) Claude API Key"
echo "  6) Supabase credentials"
echo "  7) Debug mode"
echo "  8) Exit"
echo ""

read -p "$(echo -e ${CYAN}Enter your choice: ${NC})" choice

update_env_var() {
    local key=$1
    local value=$2
    
    if grep -q "^${key}=" .env; then
        # Update existing
        sed -i "s|^${key}=.*|${key}=${value}|" .env
    else
        # Add new
        echo "${key}=${value}" >> .env
    fi
}

case $choice in
    1)
        read -p "$(echo -e ${CYAN}Enter new Telegram Bot Token: ${NC})" token
        update_env_var "TELEGRAM_BOT_TOKEN" "$token"
        print_success "Telegram Bot Token updated!"
        ;;
    2)
        echo "  1) OpenAI"
        echo "  2) OpenRouter"
        echo "  3) Claude"
        read -p "$(echo -e ${CYAN}Choose provider: ${NC})" provider_choice
        
        case $provider_choice in
            1) update_env_var "AI_PROVIDER" "openai" ;;
            2) update_env_var "AI_PROVIDER" "openrouter" ;;
            3) update_env_var "AI_PROVIDER" "claude" ;;
        esac
        print_success "AI Provider updated!"
        ;;
    3)
        read -sp "$(echo -e ${CYAN}Enter OpenAI API Key: ${NC})" key
        echo
        update_env_var "OPENAI_API_KEY" "$key"
        read -p "$(echo -e ${CYAN}Enter OpenAI Model [gpt-3.5-turbo]: ${NC})" model
        update_env_var "OPENAI_MODEL" "${model:-gpt-3.5-turbo}"
        print_success "OpenAI configuration updated!"
        ;;
    4)
        read -sp "$(echo -e ${CYAN}Enter OpenRouter API Key: ${NC})" key
        echo
        update_env_var "OPENROUTER_API_KEY" "$key"
        read -p "$(echo -e ${CYAN}Enter OpenRouter Model [openai/gpt-3.5-turbo]: ${NC})" model
        update_env_var "OPENROUTER_MODEL" "${model:-openai/gpt-3.5-turbo}"
        print_success "OpenRouter configuration updated!"
        ;;
    5)
        read -sp "$(echo -e ${CYAN}Enter Anthropic API Key: ${NC})" key
        echo
        update_env_var "ANTHROPIC_API_KEY" "$key"
        read -p "$(echo -e ${CYAN}Enter Claude Model [claude-3-sonnet-20240229]: ${NC})" model
        update_env_var "CLAUDE_MODEL" "${model:-claude-3-sonnet-20240229}"
        print_success "Claude configuration updated!"
        ;;
    6)
        read -p "$(echo -e ${CYAN}Enter Supabase URL: ${NC})" url
        update_env_var "SUPABASE_URL" "$url"
        read -sp "$(echo -e ${CYAN}Enter Supabase Key: ${NC})" key
        echo
        update_env_var "SUPABASE_KEY" "$key"
        print_success "Supabase configuration updated!"
        ;;
    7)
        read -p "$(echo -e ${CYAN}Enable debug mode? (true/false): ${NC})" debug
        update_env_var "DEBUG" "$debug"
        print_success "Debug mode updated!"
        ;;
    8)
        exit 0
        ;;
    *)
        print_info "Invalid choice"
        exit 1
        ;;
esac

print_info "\nRestart your bot for changes to take effect:"
echo "  npm run dev"
