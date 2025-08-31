
import { Thumbnail } from '../types';

declare const JSZip: any;

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
