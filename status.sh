#!/bin/bash

# 📊 Status check script for Udbhav

echo "📊 Udbhav Service Status"
echo "========================="
echo ""

# Check PM2
echo "🔧 Backend Status (PM2):"
pm2 status
echo ""

# Check Caddy
echo "🌐 Caddy Status:"
sudo systemctl status caddy --no-pager | head -n 5
echo ""

# Check if ports are listening
echo "🔌 Port Status:"
if sudo lsof -i :3000 > /dev/null 2>&1; then
    echo "  ✓ Port 3000 (Backend): LISTENING"
else
    echo "  ✗ Port 3000 (Backend): NOT LISTENING"
fi

if sudo lsof -i :80 > /dev/null 2>&1; then
    echo "  ✓ Port 80 (HTTP): LISTENING"
else
    echo "  ✗ Port 80 (HTTP): NOT LISTENING"
fi

if sudo lsof -i :443 > /dev/null 2>&1; then
    echo "  ✓ Port 443 (HTTPS): LISTENING"
else
    echo "  ✗ Port 443 (HTTPS): NOT LISTENING"
fi
echo ""

# Check disk space
echo "💾 Disk Usage:"
df -h / | tail -n 1
echo ""

# Check memory
echo "🧠 Memory Usage:"
free -h | grep Mem
echo ""

# Check recent logs
echo "📝 Recent Backend Logs (last 5 lines):"
pm2 logs udbhav-server --lines 5 --nostream 2>/dev/null || echo "No logs available"
echo ""

# Test health endpoint
echo "🏥 Health Check:"
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/health | grep -q "200"; then
    echo "  ✓ Backend health check: PASSED"
else
    echo "  ✗ Backend health check: FAILED"
fi
echo ""

echo "🌍 Public URL: https://bancodeweb.techsoc-iiitbbsr.com"
