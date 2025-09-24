'use client';

import { useRef, useState, useCallback } from 'react';
import { printImage } from '@/actions/print';
import NextImage from 'next/image';

export function ImageUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const processImageForPrinting = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Create image element
      const img = new Image();
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Load the image
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
      });

      // Calculate dimensions (thermal printer optimal width is around 384-576 pixels)
      const maxWidth = 600;
      const aspectRatio = img.height / img.width;
      const width = Math.min(img.width, maxWidth);
      const height = Math.floor(width * aspectRatio / 8) * 8; // Ensure height is divisible by 8

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw image onto canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to grayscale for better thermal printing
      const imageData = ctx.getImageData(0, 0, width, height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        imageData.data[i] = gray;
        imageData.data[i + 1] = gray;
        imageData.data[i + 2] = gray;
      }
      ctx.putImageData(imageData, 0, 0);

      // Get base64 data URL
      const dataUrl = canvas.toDataURL('image/png');
      setSelectedImage(dataUrl);

      // Send to printer
      await printImage(dataUrl);
      
      // Clean up
      URL.revokeObjectURL(img.src);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    processImageForPrinting(file);
  }, [processImageForPrinting]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-4 md:p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isProcessing ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          disabled={isProcessing}
        />
        
        {isProcessing ? (
          <div className="space-y-2">
            <div className="text-sm md:text-base text-gray-600">Processing image...</div>
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="w-8 h-8 md:w-12 md:h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <div className="text-sm md:text-base text-gray-600">
              <span className="font-medium">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs md:text-sm text-gray-500">
              Any image type (PNG, JPG, GIF, etc.)
            </div>
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="mt-4 text-center">
          <div className="text-sm text-green-600 mb-2">✅ Image sent to printer!</div>
          <NextImage
            src={selectedImage}
            alt="Processed for printing"
            className="max-w-full h-auto mx-auto rounded border"
            style={{ maxHeight: '200px' }}
          />
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}