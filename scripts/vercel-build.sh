#!/bin/bash
# Vercel 构建脚本：将 SQLite schema 切换为 PostgreSQL 并生成 Prisma Client

set -e

echo "=== Vercel Build: Setting up PostgreSQL schema ==="

# 备份原始 schema
cp prisma/schema.prisma prisma/schema.prisma.bak

# 替换 provider 为 postgresql
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma 2>/dev/null || \
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

# 生成 Prisma Client（PostgreSQL 版本）
npx prisma generate

# Push schema 到数据库
npx prisma db push --skip-generate

# 运行 seed
npx tsx prisma/seed.ts || echo "Seed skipped (data may already exist)"

# 构建 Next.js
next build
