declare module '@radix-ui/react-icons' {
  import * as React from 'react';
  
  export interface IconProps extends React.SVGAttributes<SVGElement> {
    size?: number | string;
    color?: string;
  }
  
  export const MagnifyingGlassIcon: React.FC<IconProps>;
  // Add other icons as needed
} 