#!/bin/bash

# Script to run all migrations on Render PostgreSQL database
# Usage: ./run-render-migrations.sh

# Render Database URL (External connection)
RENDER_DB_URL="postgresql://admin123:EGLGmwBkfN34SnCZXqA5YDLbXTYYP69w@dpg-cpu1nn1u0jms73eht15g-a.oregon-postgres.render.com/multi_product_db?sslmode=require&sslrootcert=system"

echo "=========================================="
echo "Running migrations on Render PostgreSQL"
echo "=========================================="
echo ""

# Check if psql is installed
if ! command -v psql &> /dev/null
then
    echo "❌ psql command not found!"
    echo "Please install PostgreSQL client:"
    echo "  macOS: brew install postgresql"
    exit 1
fi

# Change to migrations directory
cd "$(dirname "$0")/migrations" || exit 1

# Run each migration file in order
for migration in *.sql; do
  echo "📄 Running $migration..."

  if psql "$RENDER_DB_URL" -f "$migration"; then
    echo "✅ $migration completed successfully"
  else
    echo "❌ $migration failed!"
    exit 1
  fi

  echo ""
done

echo "=========================================="
echo "✅ All migrations completed successfully!"
echo "=========================================="
echo ""

# Verify tables were created
echo "Verifying tables..."
psql "$RENDER_DB_URL" -c "SELECT COUNT(*) as table_count FROM pg_tables WHERE tablename LIKE 'datifyy_v2_%';"

echo ""
echo "Verifying seed data..."
psql "$RENDER_DB_URL" -c "SELECT COUNT(*) as user_count FROM datifyy_v2_users;"
psql "$RENDER_DB_URL" -c "SELECT COUNT(*) as admin_count FROM datifyy_v2_admin_users;"

echo ""
echo "🎉 Migration complete! Your Render database is ready."
