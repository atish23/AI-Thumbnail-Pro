
import React from 'react';

const messages = [
  "Warming up the AI's creative circuits...",
  "Teaching pixels to be brilliant...",
  "Generating eye-catching visuals...",
  "Analyzing styles and moods...",
  "This is worth the wait!",
  "Crafting the perfect clickbait (the good kind)..."
];

export const Loader: React.FC = () => {
    const [message, setMessage] = React.useState(messages[0]);

    React.useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage(messages[Math.floor(Math.random() * messages.length)]);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-foreground font-semibold">Generating...</p>
      <p className="text-muted-foreground text-sm mt-1">{message}</p>
    </div>
  );
};