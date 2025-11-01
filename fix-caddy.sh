#!/bin/bash

# Quick fix script for Caddy issues

echo "🔍 Diagnosing Caddy issues..."
echo ""

echo "1️⃣ Checking Caddy configuration..."
sudo caddy validate --config /etc/caddy/Caddyfile
echo ""

echo "2️⃣ Checking Caddy logs..."
sudo journalctl -u caddy -n 20 --no-pager
echo ""

echo "3️⃣ Testing Caddyfile syntax..."
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
echo ""

echo "4️⃣ Checking permissions..."
ls -la /etc/caddy/Caddyfile
ls -ld /var/log/caddy
echo ""

echo "5️⃣ Attempting to start Caddy..."
sudo systemctl start caddy
echo ""

echo "6️⃣ Caddy status:"
sudo systemctl status caddy --no-pager
