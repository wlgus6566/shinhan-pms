#!/bin/bash
set -e

echo "🔄 Pulling latest code..."
cd /home/ec2-user/pms
git pull origin main

echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

echo "🗄️ Running pre-deploy SQL..."
cd apps/api
for sqlfile in /home/ec2-user/pms/scripts/pre-deploy-sql/*.sql; do
  if [ -f "$sqlfile" ]; then
    echo "Executing: $sqlfile"
    npx prisma db execute --file "$sqlfile" --schema prisma/schema.prisma
    echo "Done: $sqlfile"
  fi
done

echo "🗄️ Syncing database schema..."
npx prisma db push --skip-generate
npx prisma generate

echo "🔨 Building API..."
pnpm build

echo "🚀 Restarting API server..."
pm2 restart pms-api

echo "✅ Deploy complete!"
pm2 logs pms-api --lines 3 --nostream
