#!/bin/bash
set -e

echo "================================"
echo "Appwrite Monorepo Build Script"
echo "================================"

# Appwrite starts us in /usr/local/build (monorepo root)
WORKSPACE_ROOT=$(pwd)
APP_DIR="$WORKSPACE_ROOT/apps/greenheart"

echo "Workspace root: $WORKSPACE_ROOT"
echo "App directory: $APP_DIR"

# Verify monorepo structure
if [ ! -f "$WORKSPACE_ROOT/pnpm-workspace.yaml" ]; then
    echo "❌ ERROR: Not in monorepo root (pnpm-workspace.yaml not found)"
    echo "Current directory: $(pwd)"
    ls -la
    exit 1
fi

if [ ! -f "$APP_DIR/next.config.js" ]; then
    echo "❌ ERROR: Next.js app not found at $APP_DIR"
    exit 1
fi

echo "✓ Monorepo structure verified"

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    corepack enable
    corepack prepare pnpm@latest --activate
fi

echo "✓ pnpm version: $(pnpm --version)"

# Install dependencies from workspace root
echo ""
echo "Installing workspace dependencies..."
pnpm install --no-frozen-lockfile

echo "✓ Dependencies installed"

# Build the Next.js application
echo ""
echo "Building Next.js application..."
cd "$APP_DIR"
pnpm build

echo "✓ Build completed successfully!"

# CRITICAL: Move files to root where Appwrite's bundler expects them
echo ""
echo "Preparing deployment structure for Appwrite bundler..."
cd "$WORKSPACE_ROOT"

# Copy Next.js config to root
echo "  → Copying next.config.js to root..."
cp "$APP_DIR/next.config.js" "$WORKSPACE_ROOT/next.config.js"

# Move .next directory to root
echo "  → Moving .next directory to root..."
if [ -d "$WORKSPACE_ROOT/.next" ]; then
    rm -rf "$WORKSPACE_ROOT/.next"
fi
mv "$APP_DIR/.next" "$WORKSPACE_ROOT/.next"

# Copy package.json to root (for runtime)
echo "  → Copying package.json to root..."
cp "$APP_DIR/package.json" "$WORKSPACE_ROOT/package.json"

# Copy public assets if they exist
if [ -d "$APP_DIR/public" ]; then
    echo "  → Copying public directory to root..."
    cp -r "$APP_DIR/public" "$WORKSPACE_ROOT/public"
fi

echo ""
echo "✓ Deployment structure ready!"
echo "✓ Appwrite bundler will find:"
echo "  - next.config.js at /usr/local/build/next.config.js"
echo "  - .next at /usr/local/build/.next"
echo ""
echo "================================"
echo "Build Complete!"
echo "================================"

