
import React from 'react';
import { Thumbnail } from '../types';
import { downloadImage } from '../services/imageService';
import { DownloadIcon, ShareIcon, PreviewIcon } from './Icons';

interface ThumbnailCardProps {
  thumbnail: Thumbnail;
  onPreview: (imageUrl: string) => void;
  isActive: boolean;
  onSetActive: () => void;
  isUpdating?: boolean;
}

export const ThumbnailCard: React.FC<ThumbnailCardProps> = ({ thumbnail, onPreview, isActive, onSetActive, isUpdating }) => {

  const handleShare = async () => {
    if (navigator.share) {
        try {
            const response = await fetch(thumbnail.imageDataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'thumbnail.png', { type: 'image/png' });
            await navigator.share({
                title: 'AI Thumbnail',
                text: 'Check out this thumbnail I generated with AI!',
                files: [file]
            });
        } catch (error) {
            console.error('Error sharing', error);
        }
    } else {
        alert('Web Share API is not supported in your browser.');
    }
  };

  return (
    <div 
      className={`bg-muted/50 p-4 rounded-lg shadow-md cursor-pointer transition-all ${isActive ? 'ring-2 ring-primary' : 'ring-2 ring-transparent hover:ring-border'}`}
      onClick={onSetActive}
      >
      <h3 className="font-semibold mb-3 text-center text-muted-foreground truncate">{thumbnail.format}</h3>
      <div className={`relative w-full bg-black rounded-md overflow-hidden aspect-[${thumbnail.aspectRatio.replace(':', '/')}]`}>
        <img src={thumbnail.imageDataUrl} alt={thumbnail.format} className="w-full h-full object-cover" />
        {isUpdating && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      <div className="flex items-stretch justify-center gap-2 mt-4">
        <button onClick={(e) => { e.stopPropagation(); downloadImage(thumbnail.imageDataUrl, `thumbnail-${thumbnail.format.replace(/[\s/():]/g, '_')}.png`); }} className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-secondary hover:bg-accent text-secondary-foreground font-medium py-2 px-2 rounded-md transition-colors">
          <DownloadIcon />
          Download
        </button>
        <button onClick={(e) => { e.stopPropagation(); onPreview(thumbnail.imageDataUrl); }} className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-secondary hover:bg-accent text-secondary-foreground font-medium py-2 px-2 rounded-md transition-colors">
          <PreviewIcon />
          Preview
        </button>
        <button onClick={(e) => { e.stopPropagation(); handleShare(); }} className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-secondary hover:bg-accent text-secondary-foreground font-medium py-2 px-2 rounded-md transition-colors">
          <ShareIcon />
          Share
        </button>
      </div>
    </div>
  );
};
