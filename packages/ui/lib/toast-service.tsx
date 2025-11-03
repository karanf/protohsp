import React, { createContext, useContext, useCallback } from 'react';
import { toast } from 'sonner';
import { Info, AlertTriangle, CircleAlert, CheckCircle, X } from 'lucide-react';

// Define toast variant types
export type ToastVariant = 'info' | 'warning' | 'error' | 'success';

// Interface for toast options
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  id?: string;
}

// Define context value interface
interface ToastContextValue {
  showToast: (options: ToastOptions) => void;
}

// Create the context
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Custom styled toast variants based on Alert component
const createCustomToast = (options: ToastOptions) => {
  const { title, description, variant = 'info', duration = 5000, action, id } = options;

  // Map variant to icon components
  const iconMap = {
    error: <CircleAlert className="h-5 w-5 text-[var(--alert-error-icon-color)]" />,
    warning: <AlertTriangle className="h-5 w-5 text-[var(--alert-warning-icon-color)]" />,
    info: <Info className="h-5 w-5 text-[var(--alert-info-icon-color)]" />,
    success: <CheckCircle className="h-5 w-5 text-[var(--alert-success-icon-color)]" />
  };

  // Map variant to background and text colors
  const styleMap = {
    error: {
      backgroundColor: 'var(--alert-error-bg)',
      borderColor: 'var(--alert-error-border)',
      color: 'var(--alert-error-text)'
    },
    warning: {
      backgroundColor: 'var(--alert-warning-bg)',
      borderColor: 'var(--alert-warning-border)',
      color: 'var(--alert-warning-text)'
    },
    info: {
      backgroundColor: 'var(--alert-info-bg)',
      borderColor: 'var(--alert-info-border)',
      color: 'var(--alert-info-text)'
    },
    success: {
      backgroundColor: 'var(--alert-success-bg)',
      borderColor: 'var(--alert-success-border)',
      color: 'var(--alert-success-text)'
    }
  };

  // Return toast with custom styling
  toast.custom(
    () => (
      <div 
        style={{
          backgroundColor: styleMap[variant].backgroundColor,
          borderColor: styleMap[variant].borderColor,
          color: styleMap[variant].color,
          border: `1px solid ${styleMap[variant].borderColor}`,
          borderRadius: '0.5rem'
        }}
        className="max-w-md w-full shadow-lg pointer-events-auto flex p-4"
      >
        <div className="flex items-start gap-3 w-full">
          <div className="flex-shrink-0">
            {iconMap[variant]}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium" style={{ color: styleMap[variant].color }}>
              {title}
            </p>
            {description && (
              <p className="mt-1 text-sm" style={{ opacity: 0.9, color: styleMap[variant].color }}>
                {description}
              </p>
            )}
          </div>
          {action ? (
            <button
              onClick={action.onClick}
              className="ml-4 text-sm font-medium underline opacity-90 hover:opacity-100"
              style={{ color: styleMap[variant].color }}
            >
              {action.label}
            </button>
          ) : (
            <button
              onClick={() => toast.dismiss(id)}
              className="ml-4 flex-shrink-0 h-5 w-5 flex items-center justify-center opacity-50 hover:opacity-100 focus:outline-none"
              style={{ color: styleMap[variant].color }}
            >
              <X size={15} />
            </button>
          )}
        </div>
      </div>
    ),
    {
      id: id || `toast-${Date.now()}`,
      duration,
      position: 'bottom-right'
    }
  );
};

// Toast Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showToast = useCallback((options: ToastOptions) => {
    createCustomToast(options);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast service
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Example usage in components:
 * 
 * 1. Basic success toast:
 * 
 * ```tsx
 * import { useToast } from '@repo/ui/lib/toast-service';
 * 
 * function MyComponent() {
 *   const { showToast } = useToast();
 * 
 *   const handleSuccess = () => {
 *     showToast({
 *       title: 'Success!',
 *       description: 'Your changes have been saved.',
 *       variant: 'success'
 *     });
 *   };
 * 
 *   return <button onClick={handleSuccess}>Save Changes</button>;
 * }
 * ```
 * 
 * 2. Error toast with custom action:
 * 
 * ```tsx
 * import { useToast } from '@repo/ui/lib/toast-service';
 * 
 * function MyComponent() {
 *   const { showToast } = useToast();
 * 
 *   const handleError = () => {
 *     showToast({
 *       title: 'Error',
 *       description: 'Failed to save your changes. Please try again.',
 *       variant: 'error',
 *       action: {
 *         label: 'Retry',
 *         onClick: () => {
 *           // Retry logic here
 *           console.log('Retrying...');
 *         }
 *       }
 *     });
 *   };
 * 
 *   return <button onClick={handleError}>Trigger Error</button>;
 * }
 * ```
 * 
 * 3. Persistent notification (system-wide message):
 * 
 * ```tsx
 * import { useToast } from '@repo/ui/lib/toast-service';
 * 
 * function SystemNotifications() {
 *   const { showToast } = useToast();
 * 
 *   useEffect(() => {
 *     // Show an important system message that doesn't auto-dismiss
 *     showToast({
 *       title: 'System Maintenance',
 *       description: 'Scheduled maintenance will begin at 10:00 PM. Please save your work.',
 *       variant: 'warning',
 *       duration: Infinity, // Never auto-dismiss
 *       id: 'system-maintenance', // Use a fixed ID to prevent duplicates
 *     });
 *   }, []);
 * 
 *   return null; // This could be a hidden component that just manages notifications
 * }
 * ```
 */ 