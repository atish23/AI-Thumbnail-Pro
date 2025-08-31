import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check against environment variables
    const adminEmail = (import.meta as any).env.VITE_ADMIN_EMAIL;
    const adminPassword = (import.meta as any).env.VITE_ADMIN_PASSWORD;
    
    if (email === adminEmail && password === adminPassword) {
      setError('');
      onLoginSuccess();
    } else {
      setError('Invalid email or password.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-center text-card-foreground">AI Thumbnail <span className="text-primary">Pro</span></h1>
            <p className="text-center text-muted-foreground mt-1">Please log in to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full bg-muted border-border text-foreground rounded-lg p-2.5 focus:ring-ring focus:border-ring"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full bg-muted border-border text-foreground rounded-lg p-2.5 focus:ring-ring focus:border-ring"
              placeholder="Enter your password"
            />
          </div>
          {error && <p className="text-sm text-primary text-center bg-primary/10 py-2 rounded-md">{error}</p>}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-primary-foreground font-bold py-3 px-4 rounded-lg transition-colors duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};