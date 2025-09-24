/**
 * Image processing utilities for thermal printer
 */

export const processImageForPrinting = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create image element
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      try {
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
        resolve(dataUrl);

        // Clean up
        URL.revokeObjectURL(img.src);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
};

export const isValidImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};