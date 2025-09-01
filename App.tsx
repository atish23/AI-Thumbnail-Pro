
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { Questionnaire } from './components/Questionnaire';
import { ThumbnailCard } from './components/ThumbnailCard';
import { Loader } from './components/Loader';
import { Thumbnail, QuestionnaireData, ChatMessage } from './types';
import { fileToBase64, downloadAllAsZip, processImagesForAspectRatio } from './services/imageService';
import { rewritePrompt } from './services/promptService';
import { editImage } from './services/geminiService';
import { DownloadIcon } from './components/Icons';
import { PreviewModal } from './components/PreviewModal';
import { Chat } from './components/Chat';
import { Login } from './components/Login';
import { HowToUse } from './components/HowToUse';
import { THUMBNAIL_STYLES } from './constants';

type Theme = 'light' | 'dark';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatedThumbnails, setGeneratedThumbnails] = useState<Thumbnail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [activeThumbnailIndex, setActiveThumbnailIndex] = useState<number>(0);
  const [sessionKey, setSessionKey] = useState<string | null>(null);
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (storedPrefs === 'light' || storedPrefs === 'dark') {
        return storedPrefs;
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    return 'dark'; // default to dark
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);


  useEffect(() => {
    if (sessionKey) {
      const savedChatHistory = localStorage.getItem(sessionKey);
      if (savedChatHistory) {
        try {
          const parsedHistory = JSON.parse(savedChatHistory);
          setChatHistory(parsedHistory);
        } catch (e) {
          console.error("Failed to parse chat history from localStorage", e);
          setChatHistory([]);
        }
      } else {
         const welcomeMessage = "Here are your generated thumbnails! Click one to select it, then use the chat to refine it.";
         setChatHistory([{ sender: 'ai', text: welcomeMessage }]);
      }
    }
  }, [sessionKey]);

  useEffect(() => {
    if (sessionKey && chatHistory.length > 0) {
      // Don't save the initial welcome message if it's the only one
      if (chatHistory.length === 1 && chatHistory[0].text.startsWith("Here are your generated thumbnails!")) {
        return;
      }
      localStorage.setItem(sessionKey, JSON.stringify(chatHistory));
    }
  }, [chatHistory, sessionKey]);


  const handleFileChange = useCallback((files: File[]) => {
    setUploadedFiles(files);
    setGeneratedThumbnails([]);
    setChatHistory([]);
    setError(null);
    if (files.length > 0) {
      // Sort files to ensure consistent key generation for the session
      const sortedFiles = [...files].sort((a, b) => a.name.localeCompare(b.name));
      const key = `chatHistory-${sortedFiles.map(f => `${f.name}-${f.size}`).join('-')}`;
      setSessionKey(key);
    } else {
      setSessionKey(null);
    }
  }, []);

  const handleFormSubmit = useCallback(async (data: QuestionnaireData) => {
    if (uploadedFiles.length === 0) {
      setError('Please upload an image first.');
      return;
    }
    if (data.aspectRatios.length === 0) {
        setError('Please select an aspect ratio.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedThumbnails([]);
    setActiveThumbnailIndex(0);
    
    const welcomeMessage = "Here are your generated thumbnails! Click one to select it, then use the chat to refine it.";
    setChatHistory([{ sender: 'ai', text: welcomeMessage }]);

    const sourceFiles = uploadedFiles;

    try {
      // Get the selected aspect ratio (only one now)
      const selectedAspectRatio = data.aspectRatios[0];
      console.log(`Processing images for ${selectedAspectRatio} aspect ratio...`);
      
      // Preprocess images to the selected aspect ratio
      const processedFiles = await processImagesForAspectRatio(sourceFiles, selectedAspectRatio);
      
      const imageDatas = await Promise.all(
        processedFiles.map(async (file) => ({
          data: await fileToBase64(file),
          mimeType: file.type,
        }))
      );
      const fileNames = processedFiles.map(f => f.name);

      const generationTasks: Promise<{ imageBase64: string; style: string; aspectRatio: string; }>[] = [];
      const useEnhancedPrompts = data.proMode && data.enhancedPrompts && data.enhancedPrompts.length > 0;

      if (useEnhancedPrompts) {
        const prompts = data.enhancedPrompts!;
        // Generate up to 3 variations with enhanced prompts
        prompts.slice(0, 3).forEach((customPrompt, index) => {
          const task = (async () => {
            const taskData = { ...data, customPrompt, aspectRatio: selectedAspectRatio };
            const promptPayload = rewritePrompt(taskData, fileNames);
            const imageBase64 = await editImage(imageDatas, promptPayload);
            return { imageBase64, style: `AI Idea ${index + 1}`, aspectRatio: selectedAspectRatio };
          })();
          generationTasks.push(task);
        });
      } else {
        // Generate with different styles
        const userStyle = data.style;
        const otherStyles = THUMBNAIL_STYLES.filter(s => s !== userStyle);
        const shuffledOtherStyles = otherStyles.sort(() => 0.5 - Math.random());
        const stylesToGenerate = [userStyle, ...shuffledOtherStyles.slice(0, 2)];

        stylesToGenerate.forEach(style => {
          const task = (async () => {
            const taskData = { ...data, style, aspectRatio: selectedAspectRatio };
            const prompt = rewritePrompt(taskData, fileNames);
            const imageBase64 = await editImage(imageDatas, prompt);
            return { imageBase64, style, aspectRatio: selectedAspectRatio };
          })();
          generationTasks.push(task);
        });
      }
      
      const results = await Promise.all(generationTasks);
      
      const allGenerated = results.map((result, index) => {
        return {
          id: `thumb-${result.style.replace(/\s/g, '')}-${result.aspectRatio.replace('/',':')}-${Date.now()}-${index}`,
          imageDataUrl: `data:image/png;base64,${result.imageBase64}`,
          format: `${result.style} (${result.aspectRatio})`,
          aspectRatio: result.aspectRatio as '16/9' | '9/16' | '1/1' | '4/3' | '3/4',
        };
      });
      
      setGeneratedThumbnails(allGenerated);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [uploadedFiles, sessionKey]);
  
  const handleSendMessage = async (message: string) => {
    if (!generatedThumbnails.length || isLoading) return;

    setIsLoading(true);
    setError(null);
    setChatHistory(prev => [...prev, { sender: 'user', text: message }]);

    try {
        const currentImage = generatedThumbnails[activeThumbnailIndex];
        const base64Image = currentImage.imageDataUrl.split(',')[1];
        
        const followUpPrompt = `Taking the provided image as the new starting point, apply this follow-up change: "${message}". The goal is to refine this image into an even more viral, click-worthy YouTube thumbnail. Maintain the original aspect ratio of ${currentImage.aspectRatio}. Preserve other elements as much as possible unless specified otherwise.`;
        
        console.log("Follow-up Prompt:", followUpPrompt);
        
        const editedImageBase64 = await editImage(
          [{ data: base64Image, mimeType: 'image/png' }], 
          followUpPrompt
        );

        const newThumbnail: Thumbnail = {
            ...currentImage,
            id: `thumb-chat-${Date.now()}`,
            imageDataUrl: `data:image/png;base64,${editedImageBase64}`,
        };

        const updatedThumbnails = generatedThumbnails.map((thumb, index) => 
            index === activeThumbnailIndex ? newThumbnail : thumb
        );

        setGeneratedThumbnails(updatedThumbnails);
        setChatHistory(prev => [...prev, { sender: 'ai', text: "Here's the updated version. What else would you like to change?" }]);

    } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during image editing.';
        setError(errorMessage);
        setChatHistory(prev => [...prev, { sender: 'ai', text: `Sorry, I couldn't make that change. Error: ${errorMessage}` }]);
    } finally {
        setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUploadedFiles([]);
    setGeneratedThumbnails([]);
    setChatHistory([]);
    setError(null);
    setSessionKey(null);
  };
  
  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Header 
        isAuthenticated={isAuthenticated}
        userEmail={(import.meta as any).env.VITE_ADMIN_EMAIL || "user@example.com"}
        onLogout={handleLogout}
        theme={theme}
        setTheme={setTheme}
      />
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-lg flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold text-card-foreground mb-1">1. Upload Your Image(s)</h2>
              <p className="text-muted-foreground">Upload one or more photos. The AI will use all images as creative sources.</p>
            </div>
            <FileUpload onFileChange={handleFileChange} />
            {uploadedFiles.length > 0 && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-card-foreground mb-1">2. Describe Your Thumbnail</h2>
                  <p className="text-muted-foreground">Tell the AI what you need. Be creative!</p>
                </div>
                <Questionnaire key={sessionKey} onSubmit={handleFormSubmit} disabled={isLoading} numUploadedFiles={uploadedFiles.length} />
              </>
            )}
          </div>

          <div className="bg-card p-6 md:p-8 rounded-2xl shadow-lg min-h-[300px] flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-card-foreground">3. Your AI Thumbnails</h2>
                {generatedThumbnails.length > 0 && !isLoading && (
                    <button 
                      onClick={() => downloadAllAsZip(generatedThumbnails)}
                      className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <DownloadIcon />
                      <span>Download (.zip)</span>
                    </button>
                )}
            </div>

            {isLoading && generatedThumbnails.length === 0 && <Loader />}
            
            {error && <div className="text-primary bg-primary/10 p-4 rounded-lg text-center">{error}</div>}

            {!isLoading && !error && generatedThumbnails.length === 0 && (
              <div className="flex-grow flex flex-col items-center justify-center text-center text-muted-foreground border-2 border-dashed border-border rounded-lg p-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="font-semibold text-foreground">Your generated thumbnails will appear here.</p>
                <p className="text-sm">Complete the steps on the left to begin.</p>
              </div>
            )}
            
            {generatedThumbnails.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {generatedThumbnails.map((thumb, index) => (
                  <ThumbnailCard 
                    key={thumb.id} 
                    thumbnail={thumb} 
                    onPreview={setPreviewImage} 
                    isActive={index === activeThumbnailIndex}
                    onSetActive={() => setActiveThumbnailIndex(index)}
                    isUpdating={isLoading && index === activeThumbnailIndex}
                  />
                ))}
              </div>
            )}
            
            {generatedThumbnails.length > 0 && (
              <Chat messages={chatHistory} onSendMessage={handleSendMessage} disabled={isLoading} />
            )}
          </div>
        </div>
        <HowToUse />
      </main>
      {previewImage && <PreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />}
    </div>
  );
}
