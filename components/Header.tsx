
import React, { useState, useEffect, useRef } from 'react';
import { SunIcon, MoonIcon } from './Icons';

interface HeaderProps {
    isAuthenticated: boolean;
    userEmail: string;
    onLogout: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
}

const UserIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ isAuthenticated, userEmail, onLogout, theme, setTheme }) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleTheme = () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              AI Thumbnail <span className="text-primary">Pro</span>
            </h1>
        </div>
        
        {isAuthenticated && (
             <div className="flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary hover:bg-accent text-foreground transition-colors"
                    aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <MoonIcon /> : <SunIcon />}
                </button>
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-2 text-foreground bg-secondary hover:bg-accent px-3 py-2 rounded-lg transition-colors">
                        <UserIcon />
                        <span className="hidden md:inline">{userEmail}</span>
                    </button>
                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-popover rounded-md shadow-lg py-1 z-20 border border-border">
                            <button onClick={() => { onLogout(); setIsDropdownOpen(false); }} className="w-full text-left block px-4 py-2 text-sm text-popover-foreground hover:bg-accent">
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>
    </header>
  );
};
