declare module 'recharts' {
  import { FC, ComponentType, ReactElement } from 'react'
  
  // Fix JSX component types for deployment environment
  export interface CartesianChartProps {
    data?: any[]
    accessibilityLayer?: boolean
    barCategoryGap?: number
    barSize?: number
    margin?: {
      top?: number
      right?: number
      left?: number
      bottom?: number
    }
    children?: React.ReactNode
  }
  
  export interface TooltipProps {
    active?: boolean
    payload?: any[]
    label?: string
  }
  
  export const BarChart: ComponentType<CartesianChartProps>
  export const Bar: ComponentType<any>
  export const CartesianGrid: ComponentType<any>
  export const XAxis: ComponentType<any>
  export const YAxis: ComponentType<any>
  export const Tooltip: ComponentType<any>
  export const Legend: ComponentType<any>
  export const ResponsiveContainer: ComponentType<any>
} 