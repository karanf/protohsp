# `@repo/eslint-config`

Collection of internal ESLint configurations for the monorepo.

## Configurations

### `base.js`
Base ESLint configuration with TypeScript support, Prettier integration, and Turbo plugin.

### `next.js` 
Next.js specific configuration that extends the base config with:
- React and React Hooks support
- Next.js plugin rules
- React 19 compatibility fixes

### `react-19-fixes.js`
Specialized configuration to handle React 19 + TypeScript compatibility issues, specifically:
- Suppresses known compatibility warnings with libraries like Lucide React
- Disables TypeScript rules that conflict with React 19 JSX changes
- Maintains type safety while allowing modern React patterns

## Usage

```js
// For Next.js apps
import { nextJsConfig } from "@repo/eslint-config/next-js";
export default nextJsConfig;

// For React libraries
import { config } from "@repo/eslint-config/base";
export default config;
```

## React 19 Compatibility

This configuration automatically handles React 19 compatibility issues, including:
- Lucide React icon component type compatibility
- ForwardRef component type resolution  
- JSX element type compatibility warnings

No additional configuration needed - these fixes are automatically applied when using the Next.js config.
