#!/bin/bash

# 🚀 Udbhav One-Click Deployment Script for EC2 (Dev Mode)
# This script deploys frontend and backend in development mode

set -e  # Exit on error

echo "🎯 Starting Udbhav deployment (Dev Mode)..."
echo "============================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Function to print colored output
print_step() {
    echo -e "${BLUE}==>${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running as correct user
if [ "$EUID" -eq 0 ]; then 
    print_error "Please don't run as root/sudo"
    exit 1
fi

# Step 1: Check prerequisites
print_step "Checking prerequisites..."

if ! command -v bun &> /dev/null; then
    print_error "Bun is not installed. Installing..."
    curl -fsSL https://bun.sh/install | bash
    source ~/.bashrc
fi
print_success "Bun is installed"

if ! command -v caddy &> /dev/null; then
    print_error "Caddy is not installed."
    echo ""
    echo "To install Caddy on Amazon Linux, run:"
    echo "  bash install-caddy-amazonlinux.sh"
    echo ""
    exit 1
fi
print_success "Caddy is installed"

# Step 3: Install dependencies
print_step "Installing dependencies..."
bun install
print_success "Dependencies installed"

# Step 4: Check environment variables
print_step "Checking environment variables..."

if [ ! -f ".env" ]; then
    print_error ".env file not found. Creating from .env.example..."
    if [ -f "apps/server/.env.example" ]; then
        cp apps/server/.env.example .env
        print_error "⚠️  Please edit .env file with your credentials and run again"
        exit 1
    fi
else
    print_success "Environment file found"
fi

# Step 5: Update Vite config to allow external access
print_step "Configuring Vite for production..."
cat > apps/web/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'bancodeweb.techsoc-iiitbbsr.com',
      'localhost',
      '127.0.0.1',
      '.techsoc-iiitbbsr.com'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    }
  }
})
EOF
print_success "Vite configured"

# Step 6: Setup PM2 for process management
print_step "Setting up PM2..."

if ! command -v pm2 &> /dev/null; then
    print_step "Installing PM2..."
    bun add -g pm2
fi

# Create PM2 ecosystem file for dev mode (CommonJS format)
cat > ecosystem.config.cjs << EOF
module.exports = {
  apps: [
    {
      name: 'udbhav-backend',
      script: 'bun',
      args: 'run dev:server',
      cwd: '$SCRIPT_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    },
    {
      name: 'udbhav-frontend',
      script: 'bun',
      args: 'run dev:web',
      cwd: '$SCRIPT_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development'
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '500M'
    }
  ]
}
EOF
print_success "PM2 configured"

# Step 7: Create logs directory
mkdir -p logs
print_success "Logs directory created"

# Step 8: Stop existing processes
print_step "Stopping existing processes..."
pm2 stop udbhav-backend 2>/dev/null || true
pm2 delete udbhav-backend 2>/dev/null || true
pm2 stop udbhav-frontend 2>/dev/null || true
pm2 delete udbhav-frontend 2>/dev/null || true
print_success "Old processes stopped"

# Step 9: Start services with PM2
print_step "Starting backend and frontend servers..."
pm2 start ecosystem.config.cjs
pm2 save
print_success "Services started with PM2"

# Step 10: Setup Caddy
print_step "Configuring Caddy..."

# Ensure log directory exists
sudo mkdir -p /var/log/caddy
sudo chown -R caddy:caddy /var/log/caddy 2>/dev/null || sudo chown -R root:root /var/log/caddy

# Copy Caddyfile to Caddy config location
sudo cp Caddyfile /etc/caddy/Caddyfile

# Validate Caddyfile
print_step "Validating Caddyfile..."
if sudo caddy validate --config /etc/caddy/Caddyfile; then
    print_success "Caddyfile is valid"
else
    print_error "Caddyfile validation failed!"
    exit 1
fi

# Check if Caddy is running, if not start it, otherwise reload
if sudo systemctl is-active --quiet caddy; then
    print_step "Reloading Caddy..."
    if sudo systemctl reload caddy; then
        print_success "Caddy reloaded"
    else
        print_error "Caddy reload failed, trying restart..."
        sudo systemctl restart caddy
        print_success "Caddy restarted"
    fi
else
    print_step "Starting Caddy..."
    if sudo systemctl start caddy; then
        print_success "Caddy started"
    else
        print_error "Caddy failed to start!"
        echo ""
        echo "Checking logs:"
        sudo journalctl -u caddy -n 10 --no-pager
        echo ""
        echo "Run 'bash fix-caddy.sh' to diagnose the issue"
        exit 1
    fi
fi

# Verify Caddy is running
if sudo systemctl is-active --quiet caddy; then
    print_success "Caddy is running"
else
    print_error "Caddy is not running!"
    exit 1
fi

# Step 11: Display status
echo ""
echo "================================="
echo -e "${GREEN}🎉 Deployment Complete! (Dev Mode)${NC}"
echo "================================="
echo ""
echo "📊 Service Status:"
echo "----------------"
pm2 status
echo ""
echo "🌐 Application URLs:"
echo "  - Full App: https://bancodeweb.techsoc-iiitbbsr.com"
echo "  - Backend API: https://bancodeweb.techsoc-iiitbbsr.com/api"
echo "  - Health Check: https://bancodeweb.techsoc-iiitbbsr.com/health"
echo ""
echo "� Direct Access (for debugging):"
echo "  - Backend: http://localhost:3000"
echo "  - Frontend: http://localhost:5173"
echo ""
echo "�📝 Logs:"
echo "  - Backend: pm2 logs udbhav-backend"
echo "  - Frontend: pm2 logs udbhav-frontend"
echo "  - Caddy: sudo tail -f /var/log/caddy/udbhav.log"
echo ""
echo "🔧 Useful Commands:"
echo "  - Restart All: pm2 restart all"
echo "  - Restart Backend: pm2 restart udbhav-backend"
echo "  - Restart Frontend: pm2 restart udbhav-frontend"
echo "  - View Logs: pm2 logs"
echo "  - Stop All: pm2 stop all"
echo ""
echo "✅ Your app is now live at: https://bancodeweb.techsoc-iiitbbsr.com"
echo "♨️  Hot reload enabled for development!"
