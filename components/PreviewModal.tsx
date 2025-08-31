import React from 'react';
import { CloseIcon } from './Icons';

interface PreviewModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ imageUrl, onClose }) => {
  // Use a keydown listener to close on 'Escape'
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
      <div
        className="relative bg-background p-2 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh]"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image/modal content
      >
        <img src={imageUrl} alt="Thumbnail Preview" className="w-full h-full object-contain rounded" />
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-secondary/80 hover:bg-accent rounded-full p-2 text-foreground transition-colors"
          aria-label="Close preview"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
};