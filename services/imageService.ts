
import { Thumbnail } from '../types';

declare const JSZip: any;

// Aspect ratio preprocessing interfaces and configurations
export interface AspectRatioConfig {
  ratio: string;
  width: number;
  height: number;
}

// Standard aspect ratios with optimized dimensions for AI processing
export const ASPECT_RATIO_CONFIGS: Record<string, AspectRatioConfig> = {
  '16:9': { ratio: '16:9', width: 1920, height: 1080 },
  '9:16': { ratio: '9:16', width: 1080, height: 1920 },
  '1:1': { ratio: '1:1', width: 1080, height: 1080 },
  '4:3': { ratio: '4:3', width: 1440, height: 1080 },
  '3:4': { ratio: '3:4', width: 1080, height: 1440 }
};

/**
 * Converts a File object to a base64 encoded string.
 * @param file - The File object to convert.
 * @returns A promise that resolves with the base64 string (without the data URL prefix).
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Triggers a browser download for a given data URL.
 * @param dataUrl - The full data URL (e.g., "data:image/png;base64,...").
 * @param filename - The desired name for the downloaded file.
 */
export const downloadImage = (dataUrl: string, filename: string) => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copies an image from a data URL to the user's clipboard.
 * @param dataUrl - The full data URL of the image to copy.
 * @returns A promise that resolves to true if successful, false otherwise.
 */
export const copyImageToClipboard = async (dataUrl: string): Promise<boolean> => {
  if (!navigator.clipboard || !navigator.clipboard.write) {
    alert('Clipboard API not available. This feature works only on secure (HTTPS) connections.');
    return false;
  }
  try {
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    return true;
  } catch (error) {
    console.error('Failed to copy image:', error);
    alert('Failed to copy image to clipboard.');
    return false;
  }
};


/**
 * Zips and downloads all generated thumbnails.
 * Requires the JSZip library to be available in the global scope.
 * @param thumbnails - An array of Thumbnail objects to be zipped.
 */
export const downloadAllAsZip = async (thumbnails: Thumbnail[]) => {
  if (typeof JSZip === 'undefined') {
    console.error('JSZip library is not loaded.');
    alert('Could not download zip file. A required library is missing.');
    return;
  }

  const zip = new JSZip();

  for (const thumb of thumbnails) {
    const response = await fetch(thumb.imageDataUrl);
    const blob = await response.blob();
    const filename = `thumbnail-${thumb.aspectRatio.replace('/', 'x')}.png`;
    zip.file(filename, blob);
  }

  zip.generateAsync({ type: 'blob' }).then(content => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'AI-Thumbnails.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  });
};

/**
 * Converts aspect ratio from slash format to colon format
 * @param aspectRatio - Aspect ratio in slash format (e.g., '16/9')
 * @returns Aspect ratio in colon format (e.g., '16:9')
 */
function normalizeAspectRatio(aspectRatio: string): string {
  return aspectRatio.replace('/', ':');
}

/**
 * Converts a File object to a canvas with the specified aspect ratio.
 * The image is scaled to fit within the target dimensions while maintaining its original aspect ratio,
 * then centered on a canvas with the exact target dimensions.
 * 
 * @param file - The image file to process
 * @param targetAspectRatio - The desired aspect ratio (e.g., '16:9', '9:16', '16/9', '9/16')
 * @returns Promise<HTMLCanvasElement> - Canvas with the processed image
 */
export async function convertToAspectRatio(
  file: File, 
  targetAspectRatio: string
): Promise<HTMLCanvasElement> {
  const normalizedRatio = normalizeAspectRatio(targetAspectRatio);
  const config = ASPECT_RATIO_CONFIGS[normalizedRatio];
  if (!config) {
    throw new Error(`Unsupported aspect ratio: ${targetAspectRatio}`);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas to target dimensions
        canvas.width = config.width;
        canvas.height = config.height;

        // Fill with white background (can be customized later)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Calculate scaling to fit image within target dimensions while preserving aspect ratio
        const imgAspectRatio = img.width / img.height;
        const targetAspectRatioNum = config.width / config.height;

        let drawWidth, drawHeight;
        
        if (imgAspectRatio > targetAspectRatioNum) {
          // Image is wider than target ratio - fit by width
          drawWidth = canvas.width;
          drawHeight = canvas.width / imgAspectRatio;
        } else {
          // Image is taller than target ratio - fit by height
          drawHeight = canvas.height;
          drawWidth = canvas.height * imgAspectRatio;
        }

        // Center the image on the canvas
        const offsetX = (canvas.width - drawWidth) / 2;
        const offsetY = (canvas.height - drawHeight) / 2;

        // Draw the image
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        resolve(canvas);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Convert file to object URL
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Converts a canvas to a File object with the specified filename and quality.
 * 
 * @param canvas - The canvas to convert
 * @param filename - The desired filename for the output file
 * @param quality - JPEG quality (0-1, default: 0.9)
 * @returns Promise<File> - The resulting file
 */
export async function canvasToFile(
  canvas: HTMLCanvasElement, 
  filename: string, 
  quality: number = 0.9
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to convert canvas to blob'));
          return;
        }
        
        const file = new File([blob], filename, {
          type: 'image/jpeg',
          lastModified: Date.now()
        });
        
        resolve(file);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Processes an array of image files to match the target aspect ratio.
 * This is the main function used by the application to preprocess images.
 * 
 * @param files - Array of image files to process
 * @param targetAspectRatio - The desired aspect ratio (e.g., '16:9', '9:16', '16/9', '9/16')
 * @returns Promise<File[]> - Array of processed files with correct aspect ratio
 */
export async function processImagesForAspectRatio(
  files: File[], 
  targetAspectRatio: string
): Promise<File[]> {
  const normalizedRatio = normalizeAspectRatio(targetAspectRatio);
  const processedFiles: File[] = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    try {
      // Convert to target aspect ratio
      const canvas = await convertToAspectRatio(file, targetAspectRatio);
      
      // Generate filename with aspect ratio suffix
      const originalName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const newFilename = `${originalName}_${normalizedRatio.replace(':', 'x')}.jpg`;
      
      // Convert back to file
      const processedFile = await canvasToFile(canvas, newFilename);
      processedFiles.push(processedFile);
      
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(canvas.toDataURL());
      
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error);
      throw new Error(`Failed to process image ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  return processedFiles;
}

/**
 * Validates if a given aspect ratio string is supported.
 * 
 * @param aspectRatio - The aspect ratio string to validate (e.g., '16:9', '16/9')
 * @returns boolean - True if supported, false otherwise
 */
export function isSupportedAspectRatio(aspectRatio: string): boolean {
  const normalizedRatio = normalizeAspectRatio(aspectRatio);
  return normalizedRatio in ASPECT_RATIO_CONFIGS;
}

/**
 * Gets the dimensions for a given aspect ratio.
 * 
 * @param aspectRatio - The aspect ratio string (e.g., '16:9', '16/9')
 * @returns AspectRatioConfig | null - Configuration object or null if not supported
 */
export function getAspectRatioConfig(aspectRatio: string): AspectRatioConfig | null {
  const normalizedRatio = normalizeAspectRatio(aspectRatio);
  return ASPECT_RATIO_CONFIGS[normalizedRatio] || null;
}
