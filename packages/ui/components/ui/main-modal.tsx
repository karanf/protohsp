'use client'

import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "./button";

interface MainModalAction {
  text: string;
  onClick: () => void;
  disabled?: boolean;
}

interface MainModalProps {
  isOpen: boolean;
  onClose: () => void;
  icon?: React.ReactNode;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  maxWidth?: string;
  // Structured footer props
  cancelAction?: MainModalAction;
  primaryAction?: MainModalAction;
  secondaryActions?: MainModalAction[];
}

/**
 * MainModal - A reusable modal component that renders within the main content area
 * 
 * Features:
 * - Positions below header (97px top margin)
 * - Centers vertically and horizontally within backdrop
 * - Scrollable content area with fixed header/footer
 * - White blurred backdrop
 * - Click outside to close
 * - Escape key to close
 * - Structured footer with cancel (left) and action buttons (right)
 * - Flexible action buttons - only displays the ones provided
 * - Optional icon in header alongside title
 */
export function MainModal({ 
  isOpen, 
  onClose, 
  icon,
  title, 
  children, 
  footer,
  className,
  maxWidth = "w-[600px]",
  cancelAction,
  primaryAction,
  secondaryActions = []
}: MainModalProps) {
  const [mainElement, setMainElement] = React.useState<HTMLElement | null>(null);

  // Find the main element on mount
  React.useEffect(() => {
    const main = document.querySelector('main');
    setMainElement(main as HTMLElement);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Render structured footer
  const renderStructuredFooter = () => {
    if (!cancelAction && !primaryAction && secondaryActions.length === 0) {
      return null;
    }

    return (
      <div className="border-t pt-4 px-6 pb-6 flex items-center justify-between">
        {/* Left side - Cancel button */}
        <div>
          {cancelAction && (
            <Button 
              variant="tertiary" 
              onClick={cancelAction.onClick}
              disabled={cancelAction.disabled}
            >
              {cancelAction.text}
            </Button>
          )}
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center gap-3">
          {/* Secondary actions */}
          {secondaryActions.slice(0, 2).map((action, index) => (
            <Button 
              key={index}
              variant="secondary" 
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.text}
            </Button>
          ))}
          
          {/* Primary action */}
          {primaryAction && (
            <Button 
              variant="default" 
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
            >
              {primaryAction.text}
            </Button>
          )}
        </div>
      </div>
    );
  };

  if (!isOpen || !mainElement) return null;

  return createPortal(
    <div className="fixed top-[97px] left-0 right-0 bottom-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/80 backdrop-blur-sm" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-h-[calc(100vh-145px)] bg-white border shadow-lg rounded-lg overflow-hidden z-10 flex flex-col",
          maxWidth,
          className
        )}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(icon || title) && (
          <div className="border-b h-36 px-6 py-6 overflow-hidden">
            <div className="flex items-center gap-4 h-full">
              {icon && (
                <div className="relative flex-shrink-0">
                  {/* Concentric stroke rings - 24px radius increments from icon circle */}
                  <div className="absolute -inset-6 rounded-full border border-gray-200"></div>
                  <div className="absolute -inset-12 rounded-full border border-gray-100"></div>
                  <div className="absolute -inset-[72px] rounded-full border border-gray-50"></div>
                  <div className="absolute -inset-24 rounded-full border border-gray-50/50"></div>
                  
                  {/* Icon container */}
                  <div className="relative w-16 h-16 rounded-full bg-[var(--primary-shadow-color-2)] flex items-center justify-center">
                    <div className="text-[var(--button-default-bg)] [&>svg]:w-8 [&>svg]:h-8">
                      {icon}
                    </div>
                  </div>
                </div>
              )}
              {title && (
                <div className="flex-1 relative z-10">
                  {typeof title === 'string' ? (
                    <h2 className="text-2xl font-semibold text-gray-900 leading-tight">{title}</h2>
                  ) : (
                    title
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>
        
        {/* Footer - Use structured footer if provided, otherwise use legacy footer prop */}
        {renderStructuredFooter() || (footer && (
          <div className="border-t pt-4 px-6 pb-6">
            {footer}
          </div>
        ))}
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </div>
    </div>,
    mainElement
  );
} 