#!/bin/bash
# Promotes an existing user to ADMIN in the production (Postgres) database.
#
# Usage: npm run admin:promote:prod -- someone@example.com
#
# The user must already have registered. Connection details are read from .env.production
# (DATABASE_DATABASE_URL), which you can fetch with:
#   vercel env pull .env.production --environment=production
# Set ENV_FILE to use a different file.
set -euo pipefail

EMAIL="${1:-}"
ENV_FILE="${ENV_FILE:-.env.production}"

if [ -z "$EMAIL" ]; then
  echo "Usage: npm run admin:promote:prod -- <email>" >&2
  exit 1
fi

# Rejecting quotes, whitespace and % keeps the email safe to embed in the SQL below
if [[ ! "$EMAIL" =~ ^[^[:space:]\'\"\\%]+@[^[:space:]\'\"\\%]+$ ]]; then
  echo "Invalid email: $EMAIL" >&2
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "$ENV_FILE not found. Run: vercel env pull .env.production --environment=production" >&2
  exit 1
fi

# prisma db execute does not return rows, so raise an error if nobody matched
SQL=$(cat <<SQL
DO \$\$
BEGIN
  UPDATE "User" SET role = 'ADMIN' WHERE email = '${EMAIL}';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No user with email ${EMAIL}. They must register first.';
  END IF;
END
\$\$;
SQL
)

echo "$SQL" | npx dotenv -e "$ENV_FILE" -- npx prisma db execute --schema prisma/schema.production.prisma --stdin
echo "$EMAIL is now an ADMIN. They need to sign in again to see the Admin menu."
