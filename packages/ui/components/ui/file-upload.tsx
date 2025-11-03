'use client'

import * as React from "react";
import { Upload, Eye, Trash2, Image } from "lucide-react";
import { Button } from "./button";
import { cn } from "@repo/ui/lib/utils";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in bytes
  placeholder?: string;
  formats?: string;
  onFileSelect?: (file: File | null) => void;
  onFilesSelect?: (files: File[]) => void; // New prop for multiple files
  className?: string;
  disabled?: boolean;
  hasError?: boolean; // for error state styling
  errorMessage?: string;
  previewPosition?: 'bottom' | 'right'; // New prop to control preview position
  multiple?: boolean; // New prop to enable multiple file selection
}

/**
 * FileUpload - A reusable file upload component
 * 
 * Features:
 * - Drag and drop or click to upload
 * - Shows upload area when no file selected
 * - Shows uploaded file info with view/delete actions when file selected
 * - Customizable file types and size limits
 * - Configurable preview position (bottom or right)
 * - Support for single or multiple file uploads
 */
export function FileUpload({
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif",
  maxSize = 10 * 1024 * 1024, // 10MB default
  placeholder = "Click to upload or drag and drop",
  formats = "PDF, DOC, DOCX, JPG, PNG or GIF (max. 10MB)",
  onFileSelect,
  onFilesSelect,
  className,
  disabled = false,
  hasError = false,
  errorMessage,
  previewPosition = 'bottom',
  multiple = false
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isDragOver, setIsDragOver] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
  };

  const handleFilesSelect = (files: File[]) => {
    setSelectedFiles(files);
    if (multiple) {
      onFilesSelect?.(files);
    } else {
      // For single file mode, call the original callback
      onFileSelect?.(files[0] || null);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      // Validate file sizes
      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
          return false;
        }
        return true;
      });

      if (multiple) {
        handleFilesSelect([...selectedFiles, ...validFiles]);
      } else {
        handleFilesSelect(validFiles.slice(0, 1)); // Only take first file for single mode
      }
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length > 0) {
      // Validate file sizes
      const validFiles = files.filter(file => {
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
          return false;
        }
        return true;
      });

      if (multiple) {
        handleFilesSelect([...selectedFiles, ...validFiles]);
      } else {
        handleFilesSelect(validFiles.slice(0, 1)); // Only take first file for single mode
      }
    }
  };

  const handleUploadClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const handleDeleteFile = (fileToDelete: File) => {
    const updatedFiles = selectedFiles.filter(file => file !== fileToDelete);
    handleFilesSelect(updatedFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Render upload area component
  const uploadArea = (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        multiple={multiple}
      />
      
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragOver ? "border-green-400 bg-green-50" : "border-gray-300 bg-gray-50",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleUploadClick}
      >
        {/* Upload icon */}
        <div className="w-6 h-6 mx-auto mb-4" style={{ color: 'var(--button-default-bg)' }}>
          <Upload className="w-full h-full" />
        </div>
        
        {/* Upload text */}
        <div className="text-base mb-2">
          <span className="font-medium hover:underline" style={{ color: 'var(--button-default-bg)' }}>Click to upload</span>
          <span className="text-gray-600"> or drag and drop</span>
        </div>
        
        {/* Format info */}
        <p className="text-sm text-gray-500">
          {formats}
        </p>
      </div>
    </div>
  );

  // Render file preview component
  const filePreview = selectedFiles.length > 0 && (
    <div className="space-y-3">
      {selectedFiles.map((file, index) => (
        <div key={index} className="space-y-2">
          {/* File container with status-based styling */}
          <div className={cn(
            "relative border-2 rounded-lg p-4",
            hasError 
              ? "border-red-200 bg-white" 
              : "border-green-200 bg-white"
          )}>
            {/* Status icon in top-right corner */}
            <div className={cn(
              "absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center",
              hasError ? "bg-red-500" : "bg-green-500"
            )}>
              {hasError ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            
            <div className="flex items-start gap-3">
              {/* File icon */}
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0",
                hasError ? "bg-red-100" : "bg-green-100"
              )}>
                <Image className={cn(
                  "h-6 w-6",
                  hasError ? "text-red-600" : "text-green-600"
                )} />
              </div>
              
              {/* File info */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">
                  {file.name}
                </div>
                <div className="text-sm text-gray-500">
                  {hasError && errorMessage ? errorMessage : `Uploaded - ${formatFileSize(file.size)}`}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons below the file container */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewFile(file)}
              className="flex items-center gap-1.5"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDeleteFile(file)}
              className="flex items-center gap-1.5 text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={cn(className)}>
      {previewPosition === 'right' ? (
        // Right layout: always use 2-column grid with gap-8
        <div className="grid grid-cols-2 gap-8">
          <div>
            {uploadArea}
          </div>
          <div>
            {filePreview}
          </div>
        </div>
      ) : (
        // Bottom layout: upload area on top, file preview below
        <div className="space-y-3">
          {uploadArea}
          {filePreview}
        </div>
      )}
    </div>
  );
} 