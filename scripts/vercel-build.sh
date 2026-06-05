#!/bin/bash
# Vercel 构建脚本：切换 SQLite→PostgreSQL，生成客户端，部署

set -e

echo "=== Switching to PostgreSQL for Vercel ==="
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "=== Generating Prisma Client (PostgreSQL) ==="
npx prisma generate

echo "=== Pushing schema to database ==="
npx prisma db push --skip-generate

echo "=== Building Next.js ==="
next build
