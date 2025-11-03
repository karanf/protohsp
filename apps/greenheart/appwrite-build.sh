#!/bin/bash
set -e

echo "Starting Appwrite build for monorepo..."

# Ensure we're in the right directory
cd /usr/local/build || cd $(pwd)

echo "Current directory: $(pwd)"
echo "Listing root files:"
ls -la

# Check if we're in the monorepo root or app directory
if [ -f "pnpm-workspace.yaml" ]; then
    echo "Detected monorepo root"
    WORKSPACE_ROOT=$(pwd)
    APP_DIR="$WORKSPACE_ROOT/apps/greenheart"
elif [ -f "../../pnpm-workspace.yaml" ]; then
    echo "Detected app directory, moving to monorepo root"
    WORKSPACE_ROOT=$(cd ../.. && pwd)
    APP_DIR="$WORKSPACE_ROOT/apps/greenheart"
else
    echo "Using current directory as app root"
    WORKSPACE_ROOT=$(pwd)
    APP_DIR=$(pwd)
fi

echo "Workspace root: $WORKSPACE_ROOT"
echo "App directory: $APP_DIR"

# Install pnpm if not available
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    corepack enable
    corepack prepare pnpm@latest --activate
fi

# Install dependencies from workspace root
cd "$WORKSPACE_ROOT"
echo "Installing dependencies from workspace root..."
pnpm install --frozen-lockfile

# Build the application
cd "$APP_DIR"
echo "Building Next.js application..."
pnpm build

echo "Build completed successfully!"

