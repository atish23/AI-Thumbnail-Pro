import React from 'react';
import { CloseIcon, SparklesIcon } from './Icons';

interface PromptEnhanceModalProps {
  isLoading: boolean;
  prompts: string[];
  onSelect: (prompt: string) => void;
  onClose: () => void;
}

export const PromptEnhanceModal: React.FC<PromptEnhanceModalProps> = ({ isLoading, prompts, onSelect, onClose }) => {
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
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
      <div
        className="relative bg-card p-6 rounded-lg shadow-2xl max-w-lg w-full border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
            <SparklesIcon />
            <span>AI Prompt Suggestions</span>
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Close suggestions"
          >
            <CloseIcon />
          </button>
        </div>
        
        <div className="max-h-[60vh] overflow-y-auto pr-2">
            {isLoading && (
              <div className="text-center p-8">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-muted-foreground">Generating creative ideas...</p>
              </div>
            )}

            {!isLoading && prompts.length > 0 && (
              <div className="space-y-3">
                <p className="text-muted-foreground text-sm">Choose an enhanced prompt to use:</p>
                {prompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => onSelect(prompt)}
                    className="w-full text-left bg-muted hover:bg-accent p-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <p className="text-foreground whitespace-pre-line">{prompt}</p>
                  </button>
                ))}
              </div>
            )}
            
            {!isLoading && prompts.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">
                    <p>Could not generate suggestions.</p>
                    <p className="text-sm">Please try again or adjust your prompt.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};