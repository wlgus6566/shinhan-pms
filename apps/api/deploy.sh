#!/bin/bash
set -e

echo "🔄 Pulling latest code..."
cd /home/ec2-user/pms
git pull origin main

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🗄️ Syncing database schema..."
cd apps/api
npx prisma db push --skip-generate
npx prisma generate

echo "🔨 Building API..."
pnpm build

echo "🚀 Restarting API server..."
pm2 restart pms-api

echo "✅ Deploy complete!"
pm2 logs pms-api --lines 3 --nostream
