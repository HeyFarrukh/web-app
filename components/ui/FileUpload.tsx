'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number;
  selectedFile: File | null;
  isProcessing: boolean;
  error?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  onFileRemove,
  acceptedFileTypes = ['application/pdf'],
  maxFileSize = 5 * 1024 * 1024, // 5MB default
  selectedFile,
  isProcessing,
  error
}) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        if (file.size > maxFileSize) {
          // Handle file too large error
          return;
        }
        onFileSelect(file);
      }
    },
    [maxFileSize, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    maxSize: maxFileSize,
    multiple: false,
    disabled: !!selectedFile || isProcessing
  });

  React.useEffect(() => {
    setDragActive(isDragActive);
  }, [isDragActive]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 ${
            dragActive
              ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-orange-400 dark:hover:border-orange-500/50'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent rounded-lg" />
          <input {...getInputProps()} />
          <div className="relative py-6">
            <Upload
              className={`w-10 h-10 mx-auto mb-2 ${
                dragActive ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'
              }`}
            />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Drag & drop your CV PDF here
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              or click to browse files
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
              Max file size: {formatFileSize(maxFileSize)}
            </p>
          </div>
        </div>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3"
          >
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-orange-500 mr-3 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFileRemove();
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  disabled={isProcessing}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-2 flex items-start text-red-500 text-xs"
        >
          <AlertCircle className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </div>
  );
};
