import React, { useState, useCallback, useRef } from 'react';

interface FileUploadProps {
  onFileChange: (files: File[]) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileNames, setFileNames] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback((files: File[]) => {
    if (files.length === 0) {
      setPreviews([]);
      setFileNames([]);
      onFileChange([]);
      return;
    }

    setFileNames(files.map(f => f.name));

    const previewPromises = files.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(previewPromises)
      .then(newPreviews => setPreviews(newPreviews))
      .catch(console.error);

    onFileChange(files);
  }, [onFileChange]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    processFiles(files);
    // Clear the input value to allow re-uploading the same file(s)
    if (event.target) {
        event.target.value = '';
    }
  }, [processFiles]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files ? Array.from(event.dataTransfer.files) : [];
    if (files.length > 0) {
      processFiles(files);
    }
  };

  return (
    <div>
      <label
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center w-full min-h-48 border-2 border-border border-dashed rounded-lg cursor-pointer bg-background hover:bg-muted transition-colors p-4"
      >
        {previews.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {previews.map((src, index) => (
              <img key={index} src={src} alt={`Preview ${index + 1}`} className="w-full h-20 object-cover rounded-md" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center">
            <svg className="w-8 h-8 mb-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
            </svg>
            <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold text-foreground">Click to upload</span> or drag and drop</p>
            <p className="text-xs text-muted-foreground/80">PNG, JPG, WEBP (MAX. 10MB)</p>
          </div>
        )}
        <input ref={fileInputRef} id="dropzone-file" type="file" className="hidden" accept="image/png, image/jpeg, image/webp" multiple onChange={handleFileChange} />
      </label>
      {fileNames.length > 0 && 
        <p className="text-sm text-muted-foreground mt-2 text-center truncate">
          Source: <span className="font-medium text-foreground">{fileNames[0]}</span> {fileNames.length > 1 ? `(+${fileNames.length - 1} more)` : ''}
        </p>
      }
    </div>
  );
};