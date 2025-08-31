import React from 'react';

const Step: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="flex flex-col items-center text-center">
    <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-primary/20 text-primary">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-bold text-foreground">{title}</h3>
    <p className="text-muted-foreground">{children}</p>
  </div>
);

const UploadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);
const DescribeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
);
const GenerateIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
);


export const HowToUse: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto mt-16 p-8 bg-card rounded-2xl">
      <h2 className="text-3xl font-bold text-center text-foreground mb-8">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Step icon={<UploadIcon/>} title="1. Upload Image">
          Upload one or more images. The AI can even merge multiple photos to create a unique thumbnail!
        </Step>
        <Step icon={<DescribeIcon/>} title="2. Describe & Style">
          Tell the AI about your video. Choose a style, placement for your subject, and add any text you want to appear.
        </Step>
        <Step icon={<GenerateIcon/>} title="3. Generate & Refine">
          Hit generate for multiple options! Use the chat to ask for changes like "make the background blue."
        </Step>
      </div>

      <div className="mt-12 border-t border-border pt-8">
        <h3 className="text-2xl font-bold text-center text-foreground mb-4">Pro-Tips for Writing Great Prompts</h3>
        <p className="text-center text-muted-foreground mb-6">
          To get the best results in Pro Mode, write detailed prompts. Think like a director and describe the scene. Combine these key elements for amazing results:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-muted-foreground text-left">
          <div><strong className="text-foreground block">Subject & Action:</strong> What is the main focus and what is it doing? (e.g., "A cat wearing a wizard hat, casting a spell")</div>
          <div><strong className="text-foreground block">Setting / Background:</strong> Where is the scene taking place? (e.g., "in a mystical library filled with glowing books")</div>
          <div><strong className="text-foreground block">Style / Medium:</strong> What is the artistic style? (e.g., "digital painting, fantasy art, hyper-detailed")</div>
          <div><strong className="text-foreground block">Composition:</strong> How is it framed? (e.g., "close-up shot, from a low angle, cinematic")</div>
          <div><strong className="text-foreground block">Lighting & Colors:</strong> Describe the mood and look. (e.g., "dramatic cinematic lighting, with vibrant purple and gold colors")</div>
        </div>
      </div>
      
      <div className="mt-12 border-t border-border pt-8">
          <h3 className="text-2xl font-bold text-center text-foreground mb-4">Example Prompts</h3>
          <div className="text-center text-muted-foreground space-y-2">
              <p><strong className="text-foreground">For Chat:</strong> "Change the text font to be more playful."</p>
              <p><strong className="text-foreground">For Chat:</strong> "Can you add a subtle zoom blur effect to the background?"</p>
              <p><strong className="text-foreground">For Pro Mode:</strong> "A neon glow outline around the person. The background is a retro 80s grid pattern with cinematic, purple lighting."</p>
          </div>
      </div>
    </div>
  );
};