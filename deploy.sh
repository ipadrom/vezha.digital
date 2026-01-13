#!/bin/bash
set -e

echo "🚀 VEZHA Digital Deployment Script"
echo "=================================="

# Check if .env.prod exists
if [ ! -f .env.prod ]; then
    echo "❌ .env.prod not found! Create it first:"
    echo ""
    echo "cat > .env.prod << 'EOF'"
    echo "POSTGRES_PASSWORD=your_secure_password_here"
    echo "EOF"
    exit 1
fi

# Load environment
export $(cat .env.prod | xargs)

# Build and start containers
echo "🔨 Building containers..."
docker compose -f docker-compose.prod.yml build

echo "🚀 Starting services..."
docker compose -f docker-compose.prod.yml up -d

# Wait for DB
echo "⏳ Waiting for database..."
sleep 10

# Run migrations
echo "📊 Running migrations..."
docker compose -f docker-compose.prod.yml exec vezha-backend alembic upgrade head

echo ""
echo "✅ Containers started!"
echo ""
echo "📋 Теперь добавь в nginx конфиг (nginx/vezha.conf):"
echo "   sudo nano /etc/nginx/sites-available/n1x9s.site"
echo ""
echo "🔄 И перезапусти nginx:"
echo "   sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "🌐 Сайт будет доступен: https://n1x9s.site/vezha/"
