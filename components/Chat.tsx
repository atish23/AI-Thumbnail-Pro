import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';

interface ChatProps {
    messages: ChatMessage[];
    onSendMessage: (message: string) => void;
    disabled: boolean;
}

export const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, disabled }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !disabled) {
            onSendMessage(input.trim());
            setInput('');
        }
    };

    return (
        <div className="mt-6 border-t border-border pt-4 flex flex-col h-96 bg-muted/50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-foreground mb-2">Refine with Chat</h3>
            <div className="flex-grow overflow-y-auto pr-2 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                            msg.sender === 'user' 
                                ? 'bg-primary text-primary-foreground rounded-br-none' 
                                : 'bg-secondary text-secondary-foreground rounded-bl-none'
                        }`}>
                            <p className="text-sm break-words">{msg.text}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={disabled ? "Please wait..." : "e.g., 'Make the text bigger'"}
                    disabled={disabled}
                    className="flex-grow bg-background border-border text-foreground rounded-lg p-2.5 focus:ring-ring focus:border-ring disabled:opacity-50"
                />
                <button type="submit" disabled={disabled || !input.trim()} className="bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                    Send
                </button>
            </form>
        </div>
    );
};