# Appwrite Deployment Configuration

This document explains the Appwrite deployment configuration for the Greenheart SEVIS Portal monorepo.

## Problem Solved

The original deployment error occurred because Appwrite's build system couldn't find `next.config.*` files in the expected location. This happened because:

1. The project uses a **pnpm monorepo structure** with the Next.js app at `apps/greenheart/`
2. Appwrite's default build process expected a standalone Next.js app at the root
3. Workspace dependencies (`@repo/ui`, `@repo/database`, etc.) needed proper resolution
4. Setting source to monorepo root caused Appwrite's bundler to look for config at wrong location
5. Setting source to app directory broke workspace package access

## Solution: Hybrid Approach

We set the **source directory** to `./apps/greenheart` (where Next.js expects to find its config) while the **build script** navigates up to the workspace root to install all dependencies. This gives us:
- ✅ Next.js structure that Appwrite's bundler expects
- ✅ Access to workspace packages during build
- ✅ Proper deployment archive creation

## Configuration Files Created

### 1. `/appwrite.json` (Root Configuration)
Main Appwrite configuration that tells the platform:
- **Runtime**: Node.js 18.0
- **Source**: Project root (to include entire monorepo)
- **Build Command**: Custom script that handles monorepo structure
- **Start Command**: Starts Next.js from the correct directory
- **Environment Variables**: InstantDB and other required variables

### 2. `/apps/greenheart/appwrite-build.sh` (Build Script)
Custom build script that:
- Detects whether build is running from monorepo root or app directory
- Installs pnpm if not available
- Runs `pnpm install` from workspace root (preserves workspace links)
- Builds the Next.js app with access to all workspace packages
- Provides clear logging for debugging

### 3. `/apps/greenheart/.appwriterc` (App-Specific Config)
App-level configuration for additional customization.

### 4. `/.appwrite/appwrite.json` (Alternative Config)
Backup configuration format for different Appwrite deployment methods.

## Environment Variables Required

Set these in your Appwrite project dashboard:

```bash
NEXT_PUBLIC_INSTANT_APP_ID=your_instant_app_id
INSTANT_ADMIN_TOKEN=your_instant_admin_token
```

## Deployment Steps

1. **Commit all configuration files**:
   ```bash
   git add appwrite.json apps/greenheart/appwrite-build.sh apps/greenheart/.appwriterc .appwrite/
   git commit -m "Add Appwrite deployment configuration"
   git push
   ```

2. **Connect your repository to Appwrite**:
   - Go to your Appwrite console
   - Create a new project or select existing one
   - Connect your Git repository

3. **Configure deployment**:
   - Appwrite should auto-detect the `appwrite.json` configuration
   - Verify that environment variables are set
   - Trigger a new deployment

4. **Monitor the build**:
   - Watch the build logs to ensure the custom build script runs correctly
   - The script will show which directory it's building from
   - Successful build will output "Build completed successfully!"

## How It Works

1. **Source Copy**: Appwrite copies `apps/greenheart/` directory to `/usr/local/build/`
   - This includes `next.config.js`, `package.json`, app source code, and `appwrite-build.sh`
2. **Install**: Runs `corepack enable` to set up pnpm
3. **Build**: Executes `appwrite-build.sh` which:
   - Starts from the app directory (`/usr/local/build`)
   - Navigates up to find the workspace root (`../../`)
   - Installs all workspace dependencies from the root
   - Builds the Next.js app from the app directory
4. **Bundle**: Appwrite's bundler finds `next.config.js` and `.next/` in the expected locations
5. **Start**: Runs `next start` from the app directory on the specified port

## Monorepo Structure Handled

The configuration properly handles:
- ✅ pnpm workspace dependencies
- ✅ Workspace package transpilation (`@repo/ui`, `@repo/database`, `@repo/designsystem`)
- ✅ Shared configurations across packages
- ✅ Next.js build optimization with workspace packages

## Troubleshooting

### Build fails with "command not found: pnpm"
- The install command should handle this, but verify `corepack` is available in the runtime

### Build fails with "workspace package not found"
- Check that the build script successfully navigates to workspace root
- Verify the error checking for `pnpm-workspace.yaml` doesn't fail
- Check build logs to confirm "✓ Found workspace configuration" message appears

### Application starts but pages don't load
- Check that all environment variables are set correctly
- Verify the start command uses the correct port: `$PORT`
- Check that workspace packages were properly bundled during build

### Build takes too long or times out
- Consider pre-building workspace packages
- Optimize dependencies in `package.json`
- Check Appwrite build timeout settings

## Alternative Deployment Options

If this configuration doesn't work with your Appwrite setup:

1. **Static Export**: Configure Next.js for static export (`output: 'export'`) and deploy to Appwrite Storage
2. **Docker**: Create a custom Dockerfile with full control over the build process
3. **Pre-build**: Build locally and deploy only the `.next` directory with dependencies

## Support

For issues specific to:
- **Appwrite**: Check [Appwrite Documentation](https://appwrite.io/docs)
- **Next.js on Appwrite**: See [Appwrite + Next.js Guide](https://appwrite.io/docs/products/frameworks/nextjs)
- **This Project**: Refer to project documentation in `/docs/`

