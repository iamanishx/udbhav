#!/bin/bash

# 🔄 Quick restart script for Udbhav (Dev Mode)

echo "🔄 Restarting Udbhav services..."

# Restart both backend and frontend
pm2 restart udbhav-backend
pm2 restart udbhav-frontend

# Reload Caddy
sudo systemctl reload caddy

echo "✅ Services restarted!"
pm2 status
