#!/bin/bash
set -e

# Check if we're in production (Vercel)
if [ "$VERCEL_ENV" = "production" ]; then
  echo "Running production build..."

  # Copy production schema
  cp prisma/schema.production.prisma prisma/schema.prisma

  # Run Prisma migrations and generate client
  npx prisma migrate deploy

  # Build Next.js
  next build
else
  echo "Running development build..."

  # Use default schema (SQLite)
  npx prisma generate
  next build
fi