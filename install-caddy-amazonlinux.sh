#!/bin/bash

# 🔧 Install Caddy on Amazon Linux 2/2023

echo "📦 Installing Caddy on Amazon Linux..."

# Download Caddy binary
echo "Downloading Caddy..."
sudo curl -L "https://github.com/caddyserver/caddy/releases/download/v2.8.4/caddy_2.8.4_linux_amd64.tar.gz" -o /tmp/caddy.tar.gz

# Extract Caddy
echo "Extracting Caddy..."
cd /tmp
tar -xzf caddy.tar.gz

# Move Caddy to system path
echo "Installing Caddy..."
sudo mv caddy /usr/bin/
sudo chmod +x /usr/bin/caddy

# Create Caddy user and group
sudo groupadd --system caddy 2>/dev/null || true
sudo useradd --system --gid caddy --create-home --home-dir /var/lib/caddy --shell /usr/sbin/nologin caddy 2>/dev/null || true

# Create necessary directories
sudo mkdir -p /etc/caddy
sudo mkdir -p /var/log/caddy
sudo chown -R caddy:caddy /var/log/caddy

# Create systemd service file
sudo tee /etc/systemd/system/caddy.service > /dev/null <<'EOF'
[Unit]
Description=Caddy web server
Documentation=https://caddyserver.com/docs/
After=network.target network-online.target
Requires=network-online.target

[Service]
Type=notify
User=caddy
Group=caddy
ExecStart=/usr/bin/caddy run --environ --config /etc/caddy/Caddyfile
ExecReload=/usr/bin/caddy reload --config /etc/caddy/Caddyfile --force
TimeoutStopSec=5s
LimitNOFILE=1048576
PrivateTmp=true
ProtectSystem=full
AmbientCapabilities=CAP_NET_ADMIN CAP_NET_BIND_SERVICE

[Install]
WantedBy=multi-user.target
EOF

# Create default Caddyfile
sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
# Default Caddyfile
# Will be replaced by deployment script
:80 {
    respond "Caddy is working!"
}
EOF

sudo chown caddy:caddy /etc/caddy/Caddyfile

# Reload systemd
sudo systemctl daemon-reload

# Enable and start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy

echo ""
echo "✅ Caddy installed successfully!"
caddy version
echo ""
echo "Service status:"
sudo systemctl status caddy --no-pager | head -n 5
