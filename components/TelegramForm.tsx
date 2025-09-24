'use client';

import { printTelegram } from '@/lib/telegram';
import { useActionState, useState, useRef, useCallback } from 'react';
import { TelegramPreview } from './TelegramPreview';

interface TelegramFormProps {
  enablePicture?: boolean;
}

export function TelegramForm({ enablePicture = false }: TelegramFormProps) {
  const [state, formAction] = useActionState(printTelegram, { body: '', name: '' });
  const [previewName, setPreviewName] = useState('');
  const [previewMessage, setPreviewMessage] = useState('');

  // Conditional image state and refs
  const fileInputRef = enablePicture ? useRef<HTMLInputElement>(null) : null;
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Conditional image handlers
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!enablePicture || !files || files.length === 0) return;
    
    // Dynamic import of image processing functions
    const { processImageForPrinting, isValidImageFile } = await import('@/lib/imageProcessing');
    
    const file = files[0];
    if (!isValidImageFile(file)) {
      alert('Please select an image file');
      return;
    }

    setIsProcessingImage(true);
    try {
      const processedImage = await processImageForPrinting(file);
      setSelectedImage(processedImage);
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image');
    } finally {
      setIsProcessingImage(false);
    }
  }, [enablePicture]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (!enablePicture) return;
    e.preventDefault();
    setIsDragOver(true);
  }, [enablePicture]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!enablePicture) return;
    e.preventDefault();
    setIsDragOver(false);
  }, [enablePicture]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (!enablePicture) return;
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [enablePicture, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!enablePicture) return;
    handleFileSelect(e.target.files);
  }, [enablePicture, handleFileSelect]);

  const handleImageAreaClick = useCallback(() => {
    if (!enablePicture || !fileInputRef?.current || isProcessingImage) return;
    fileInputRef.current.click();
  }, [enablePicture, isProcessingImage]);

  const removeImage = useCallback(() => {
    if (!enablePicture) return;
    setSelectedImage(null);
  }, [enablePicture]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-3">
          <form action={formAction} className="space-y-3">
            <input
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Name"
              type="text"
              name="name"
              required
              maxLength={25}
              defaultValue={(state.name as string) || ''}
              onChange={(e) => setPreviewName(e.target.value)}
            />
            <textarea
              className="w-full p-2 border border-gray-300 rounded resize-none"
              placeholder="Message. Be nice, AI will judge"
              name="message"
              id="message"
              rows={5}
              maxLength={500}
              defaultValue=""
              onChange={(e) => setPreviewMessage(e.target.value)}
            />
            
            {enablePicture && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Optional Image
                </label>
                <div
                  className={`
                    border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                    transition-all duration-200 ease-in-out
                    ${isDragOver 
                      ? 'border-blue-400 bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                    }
                    ${isProcessingImage ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleImageAreaClick}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInputChange}
                    className="hidden"
                    disabled={isProcessingImage}
                  />
                  
                  {isProcessingImage ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-600">Processing image...</div>
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : selectedImage ? (
                    <div className="space-y-2">
                      <img
                        src={selectedImage}
                        alt="Selected image"
                        className="max-w-full h-auto mx-auto rounded"
                        style={{ maxHeight: '120px' }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove image
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <svg
                        className="w-6 h-6 mx-auto text-gray-400"
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
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </div>
                      <div className="text-xs text-gray-500">
                        Optional image (PNG, JPG, GIF, etc.)
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Hidden input to pass image data to form */}
                {selectedImage && (
                  <input
                    type="hidden"
                    name="image"
                    value={selectedImage}
                  />
                )}
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Send
            </button>
          </form>
          
          {state.body && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded text-green-800">
              {state.body}
            </div>
          )}
        </div>
        
        <div className="flex justify-center md:justify-start">
          <TelegramPreview 
            name={previewName} 
            message={previewMessage}
            {...(enablePicture && selectedImage ? { image: selectedImage } : {})}
          />
        </div>
      </div>
    </div>
  );
}
