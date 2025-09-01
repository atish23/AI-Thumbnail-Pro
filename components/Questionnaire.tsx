
import React, { useState, useEffect, useMemo } from 'react';
import { VIDEO_TYPES, THUMBNAIL_STYLES, PLACEMENT_OPTIONS, ASPECT_RATIOS } from '../constants';
import { GenerateIcon, SparklesIcon } from './Icons';
import { QuestionnaireData } from '../types';
import { enhancePrompt } from '../services/promptService';
import { PromptEnhanceModal } from './PromptEnhanceModal';

interface QuestionnaireProps {
  onSubmit: (data: QuestionnaireData) => void;
  disabled: boolean;
  numUploadedFiles: number;
}

export const Questionnaire: React.FC<QuestionnaireProps> = ({ onSubmit, disabled, numUploadedFiles }) => {
  const [proMode, setProMode] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [promptSuggestions, setPromptSuggestions] = useState<string[]>([]);
  const [enhancedPrompts, setEnhancedPrompts] = useState<string[] | null>(null);
  const [isEnhanceModalOpen, setIsEnhanceModalOpen] = useState(false);
  const [enhancedFromData, setEnhancedFromData] = useState<QuestionnaireData | null>(null);
  const [isCustomPromptManuallyEdited, setIsCustomPromptManuallyEdited] = useState(false);

  const [formData, setFormData] = useState<QuestionnaireData>({
    videoType: VIDEO_TYPES[0],
    style: THUMBNAIL_STYLES[0],
    placement: PLACEMENT_OPTIONS[1],
    customText: '',
    aspectRatios: [ASPECT_RATIOS[0].value],
    customPrompt: '',
    proMode: false,
  });
  
  useEffect(() => {
    setFormData(prev => ({ ...prev, proMode }));
  }, [proMode]);

  useEffect(() => {
    // Auto-populate prompt only in pro mode and if not manually edited
    if (!proMode || isCustomPromptManuallyEdited) return;

    const parts = [];
    if (formData.videoType) parts.push(`A thumbnail for a "${formData.videoType}" video.`);
    if (formData.style) parts.push(`The style should be "${formData.style}".`);
    if (formData.placement) parts.push(`The main subject is on the ${formData.placement} side.`);
    if (formData.customText) parts.push(`It includes the text: "${formData.customText}".`);
    
    const newPrompt = parts.join(' ');
    
    if (newPrompt !== formData.customPrompt) {
        setFormData(prev => ({ ...prev, customPrompt: newPrompt }));
    }
  }, [
      proMode,
      isCustomPromptManuallyEdited,
      formData.videoType,
      formData.style,
      formData.placement,
      formData.customText
  ]);

  const isPromptStale = useMemo(() => {
    if (!enhancedFromData) return false;
    // Check if key fields that influence the prompt have changed since enhancement
    return (
      enhancedFromData.videoType !== formData.videoType ||
      enhancedFromData.style !== formData.style ||
      enhancedFromData.placement !== formData.placement ||
      enhancedFromData.customText !== formData.customText
    );
  }, [formData, enhancedFromData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'customPrompt') {
      setEnhancedFromData(null);
      setEnhancedPrompts(null);
      if (!isCustomPromptManuallyEdited) {
        setIsCustomPromptManuallyEdited(true); // Stop auto-population on first manual edit
      }
    }

    setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };
  
  const handleStyleChange = (style: string) => {
    setFormData(prev => ({...prev, style}));
  }

  const handlePlacementChange = (placement: string) => {
    setFormData(prev => ({...prev, placement}));
  }
  
  const handleAspectRatioChange = (value: string) => {
    setFormData(prev => ({ ...prev, aspectRatios: [value] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPromptStale) {
        if (!window.confirm("Your settings have changed since enhancing the prompt. The AI might ignore your new settings. Generate anyway?")) {
            return;
        }
    }
    onSubmit({ ...formData, enhancedPrompts });
  };

  const toggleProMode = () => {
    setProMode(!proMode);
  };
  
  const handleEnhancePrompt = async () => {
    if (!formData.customPrompt || isEnhancing) return;
    setIsEnhancing(true);
    setPromptSuggestions([]);
    setEnhancedPrompts(null);
    setIsEnhanceModalOpen(true);
    setEnhancedFromData(null); // Reset on new enhancement attempt
    try {
      const enhancedOptions = await enhancePrompt(formData, numUploadedFiles);
      setPromptSuggestions(enhancedOptions);
      setEnhancedPrompts(enhancedOptions);
    } catch (error) {
      console.error("Failed to enhance prompt", error);
      alert("Could not enhance prompt. Please try again.");
      setIsEnhanceModalOpen(false);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setFormData(prev => ({ ...prev, customPrompt: prompt }));
    
    // Reorder enhanced prompts to have selected one first
    if(promptSuggestions.length > 0) {
        const reordered = [prompt, ...promptSuggestions.filter(p => p !== prompt)];
        setEnhancedPrompts(reordered);
    }

    setEnhancedFromData(formData); // Store snapshot of form data when prompt was selected
    setIsCustomPromptManuallyEdited(true); // Selecting a prompt is a manual action
    setIsEnhanceModalOpen(false);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="videoType" className="block text-sm font-medium text-muted-foreground mb-2">Video Type</label>
          <select id="videoType" name="videoType" value={formData.videoType} onChange={handleChange} className="w-full bg-muted border-border text-foreground rounded-lg p-2.5 focus:ring-ring focus:border-ring">
            {VIDEO_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Style / Mood</label>
          <div className="grid grid-cols-2 gap-2">
            {THUMBNAIL_STYLES.map(style => (
              <button type="button" key={style} onClick={() => handleStyleChange(style)} className={`p-2 rounded-lg text-sm transition-colors ${formData.style === style ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted hover:bg-accent'}`}>
                {style}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Main Subject Placement</label>
          <div className="flex items-center justify-center bg-muted p-1 rounded-lg">
            {PLACEMENT_OPTIONS.map(placement => (
              <button type="button" key={placement} onClick={() => handlePlacementChange(placement)} className={`w-full p-2 rounded-md text-sm transition-colors ${formData.placement === placement ? 'bg-primary text-primary-foreground font-semibold' : 'hover:bg-accent'}`}>
                {placement}
              </button>
            ))}
          </div>
        </div>

        <div>
            <label htmlFor="customText" className="block text-sm font-medium text-muted-foreground mb-2">Custom Text Overlay (Optional)</label>
            <input type="text" id="customText" name="customText" value={formData.customText} onChange={handleChange} placeholder="e.g., 'INSANE New Gadget!'" className="w-full bg-muted border-border text-foreground rounded-lg p-2.5 focus:ring-ring focus:border-ring" />
        </div>

        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Aspect Ratio</label>
          <div className="grid grid-cols-2 gap-2">
            {ASPECT_RATIOS.map(ratio => (
              <button 
                type="button" 
                key={ratio.value} 
                onClick={() => handleAspectRatioChange(ratio.value)} 
                className={`p-2 rounded-lg text-sm transition-colors ${formData.aspectRatios.includes(ratio.value) ? 'bg-primary text-primary-foreground font-semibold' : 'bg-muted hover:bg-accent'}`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Choose one aspect ratio for your thumbnail</p>
        </div>
        
        <div className="border-t border-border pt-4">
          <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="pro-mode-toggle">Pro Mode</label>
              <button
                  type="button"
                  id="pro-mode-toggle"
                  onClick={toggleProMode}
                  className={`${proMode ? 'bg-primary' : 'bg-accent'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
              >
                  <span className={`${proMode ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
              </button>
          </div>
        </div>

        {proMode && (
          <div className="space-y-4 border-t border-primary/20 pt-4">
            <div>
              <label htmlFor="customPrompt" className="block text-sm font-medium text-muted-foreground">Custom AI Prompt (Optional)</label>
              <textarea id="customPrompt" name="customPrompt" value={formData.customPrompt} onChange={handleChange} rows={3} placeholder="e.g., A futuristic robot on Mars, cyberpunk style, cinematic lighting..." className="w-full bg-muted border-border text-foreground rounded-lg p-2.5 focus:ring-ring focus:border-ring" />
            </div>
            <button type="button" onClick={handleEnhancePrompt} disabled={isEnhancing || !formData.customPrompt.trim()} className="w-full flex items-center justify-center gap-2 bg-secondary hover:bg-accent text-secondary-foreground font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
              <SparklesIcon/>
              {isEnhancing ? 'Enhancing...' : 'Enhance Prompt with AI'}
            </button>
          </div>
        )}
        
        {isPromptStale && (
            <div className="p-3 bg-yellow-400/20 text-yellow-500 dark:text-yellow-300 text-xs rounded-lg text-center">
                Settings have changed. Consider enhancing your prompt again for best results.
            </div>
        )}

        <button type="submit" disabled={disabled} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
          <GenerateIcon />
          {disabled ? 'Generating...' : 'Generate Thumbnails'}
        </button>
      </form>
      
      {isEnhanceModalOpen && (
        <PromptEnhanceModal 
          isLoading={isEnhancing}
          prompts={promptSuggestions}
          onSelect={handlePromptSelect}
          onClose={() => setIsEnhanceModalOpen(false)}
        />
      )}
    </>
  );
};
