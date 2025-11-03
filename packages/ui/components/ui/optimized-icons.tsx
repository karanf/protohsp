// Optimized icon imports for better tree shaking
// This helps reduce bundle size by ensuring only needed icons are imported

import { LucideIcon } from 'lucide-react'
import { ComponentType } from 'react'

// Common icon groups for better code splitting
export const NavigationIcons = {
  ChevronDown: () => import('lucide-react').then(mod => ({ default: mod.ChevronDown })),
  ChevronLeft: () => import('lucide-react').then(mod => ({ default: mod.ChevronLeft })),
  ChevronRight: () => import('lucide-react').then(mod => ({ default: mod.ChevronRight })),
  Menu: () => import('lucide-react').then(mod => ({ default: mod.Menu })),
  X: () => import('lucide-react').then(mod => ({ default: mod.X })),
}

export const UserIcons = {
  Users: () => import('lucide-react').then(mod => ({ default: mod.Users })),
  UserCircle: () => import('lucide-react').then(mod => ({ default: mod.UserCircle })),
  UserCheck: () => import('lucide-react').then(mod => ({ default: mod.UserCheck })),
  UserX: () => import('lucide-react').then(mod => ({ default: mod.UserX })),
}

export const FileIcons = {
  FileText: () => import('lucide-react').then(mod => ({ default: mod.FileText })),
  FileCheck: () => import('lucide-react').then(mod => ({ default: mod.FileCheck })),
  FileEdit: () => import('lucide-react').then(mod => ({ default: mod.FileEdit })),
  FileBarChart: () => import('lucide-react').then(mod => ({ default: mod.FileBarChart })),
  FileUp: () => import('lucide-react').then(mod => ({ default: mod.FileUp })),
  FileDown: () => import('lucide-react').then(mod => ({ default: mod.FileDown })),
  FileX: () => import('lucide-react').then(mod => ({ default: mod.FileX })),
  FileQuestion: () => import('lucide-react').then(mod => ({ default: mod.FileQuestion })),
}

export const StatusIcons = {
  CheckCircle: () => import('lucide-react').then(mod => ({ default: mod.CheckCircle })),
  XCircle: () => import('lucide-react').then(mod => ({ default: mod.XCircle })),
  AlertTriangle: () => import('lucide-react').then(mod => ({ default: mod.AlertTriangle })),
  Clock: () => import('lucide-react').then(mod => ({ default: mod.Clock })),
  Database: () => import('lucide-react').then(mod => ({ default: mod.Database })),
}

export const ActionIcons = {
  Upload: () => import('lucide-react').then(mod => ({ default: mod.Upload })),
  Send: () => import('lucide-react').then(mod => ({ default: mod.Send })),
  Edit: () => import('lucide-react').then(mod => ({ default: mod.Edit })),
  Tag: () => import('lucide-react').then(mod => ({ default: mod.Tag })),
  Search: () => import('lucide-react').then(mod => ({ default: mod.Search })),
  RefreshCw: () => import('lucide-react').then(mod => ({ default: mod.RefreshCw })),
}

// Helper function for dynamic icon loading
export const loadIcon = async (iconLoader: () => Promise<{ default: ComponentType<any> }>): Promise<ComponentType<any>> => {
  const { default: Icon } = await iconLoader()
  return Icon
}

// Frequently used icons that can be statically imported for immediate use
export { 
  // Keep the most common ones as static imports
  ChevronDown,
  Users,
  FileText,
  CheckCircle,
  Clock
} from 'lucide-react' 