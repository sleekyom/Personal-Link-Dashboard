#!/bin/bash

# Personal Link Dashboard Deployment Script
# This script deploys the application to a Hetzner server

set -e

echo "🚀 Starting deployment of Personal Link Dashboard..."

# Check if required environment variables are set
if [ -z "$SERVER_HOST" ]; then
    echo "❌ Error: SERVER_HOST environment variable is not set"
    echo "Please set it to your Hetzner server IP address"
    exit 1
fi

if [ -z "$SERVER_USER" ]; then
    echo "❌ Error: SERVER_USER environment variable is not set"
    echo "Please set it to your server username (usually 'root')"
    exit 1
fi

echo "📦 Building Docker image..."
docker build -t personal-link-dashboard .

echo "🏷️ Tagging image for deployment..."
docker tag personal-link-dashboard $SERVER_HOST:5000/personal-link-dashboard

echo "📤 Pushing image to server..."
docker save personal-link-dashboard | ssh $SERVER_USER@$SERVER_HOST "docker load"

echo "🔧 Setting up SSL certificates (if not already done)..."
ssh $SERVER_USER@$SERVER_HOST "mkdir -p ssl"

echo "📋 Copying configuration files..."
scp docker-compose.yml $SERVER_USER@$SERVER_HOST:/opt/personal-link-dashboard/
scp nginx.conf $SERVER_USER@$SERVER_HOST:/opt/personal-link-dashboard/

echo "🚀 Starting services..."
ssh $SERVER_USER@$SERVER_HOST "cd /opt/personal-link-dashboard && docker-compose up -d"

echo "✅ Deployment completed!"
echo "🌐 Your application should be available at https://$SERVER_HOST"
echo ""
echo "📝 Next steps:"
echo "1. Set up SSL certificates in /opt/personal-link-dashboard/ssl/"
echo "2. Update NEXTAUTH_URL in docker-compose.yml to your domain"
echo "3. Set up a proper database (PostgreSQL recommended for production)"
echo "4. Configure your domain to point to $SERVER_HOST"
