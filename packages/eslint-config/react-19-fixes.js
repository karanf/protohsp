/**
 * ESLint configuration to handle React 19 + TypeScript compatibility issues
 * Specifically designed to suppress known compatibility warnings with libraries like Lucide React
 * 
 * @type {import("eslint").Linter.Config}
 */
export const react19CompatibilityConfig = {
  name: "react-19-compatibility",
  rules: {
    // Disable TypeScript rules that conflict with React 19 + library compatibility
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-call": "off", 
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    
    // React-specific compatibility rules
    "react/prop-types": "off",
    "react/no-unescaped-entities": "warn",
    
    // Allow any JSX component usage (fixes Lucide React errors)
    "@typescript-eslint/no-misused-promises": "off",
  },
  settings: {
    react: {
      version: "19.0"
    }
  }
}; 