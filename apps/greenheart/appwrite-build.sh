#!/bin/bash
set -e

echo "Starting Appwrite build from app directory with workspace access..."

# Appwrite will start us in /usr/local/build (which is now apps/greenheart)
APP_DIR=$(pwd)
echo "App directory: $APP_DIR"

# Navigate to workspace root (two levels up)
WORKSPACE_ROOT=$(cd ../.. && pwd)
echo "Workspace root: $WORKSPACE_ROOT"

# Verify we found the workspace
if [ ! -f "$WORKSPACE_ROOT/pnpm-workspace.yaml" ]; then
    echo "ERROR: Could not find pnpm-workspace.yaml at $WORKSPACE_ROOT"
    echo "Listing parent directories:"
    ls -la "$WORKSPACE_ROOT"
    exit 1
fi

echo "✓ Found workspace configuration"

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    corepack enable
    corepack prepare pnpm@latest --activate
fi

echo "pnpm version: $(pnpm --version)"

# Install dependencies from workspace root to ensure workspace links work
cd "$WORKSPACE_ROOT"
echo "Installing workspace dependencies..."
pnpm install --frozen-lockfile

echo "✓ Dependencies installed"

# Build the application from app directory
cd "$APP_DIR"
echo "Building Next.js application..."
pnpm build

echo "✓ Build completed successfully!"
echo "Build output location: $APP_DIR/.next"

