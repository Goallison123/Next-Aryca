import React, { useState, useEffect } from 'react';
import { supabase } from './utils/supabase/client';
import { projectId } from './utils/supabase/info';
import { Landing } from './components/Landing';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { SolverDashboard } from './components/SolverDashboard';
import { PosterDashboard } from './components/PosterDashboard';
import { CreateChallenge } from './components/CreateChallenge';
import { ChallengeDetails } from './components/ChallengeDetails';
import { LiveRoom } from './components/LiveRoom';
import { Profile } from './components/Profile';
import { Wallet } from './components/Wallet';

export type User = {
  id: string;
  email: string;
  name: string;
  role: 'solver' | 'poster' | 'both';
  skills: string[];
  timezone: string;
  location: string;
  rating: number;
  completedChallenges: number;
  earnings: number;
  createdAt: string;
  joinedChallenges?: string[];
};

export type AppContextType = {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAccessToken: (token: string | null) => void;
  navigate: (page: string, params?: any) => void;
  currentPage: string;
  pageParams: any;
};

export const AppContext = React.createContext<AppContextType>({
  user: null,
  accessToken: null,
  setUser: () => {},
  setAccessToken: () => {},
  navigate: () => {},
  currentPage: 'landing',
  pageParams: {},
});

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState('landing');
  const [pageParams, setPageParams] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.access_token) {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-8ab168b1/auth/session`,
            {
              headers: {
                'Authorization': `Bearer ${session.access_token}`,
              },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.profile);
            setAccessToken(session.access_token);
            
            // Navigate to appropriate dashboard
            if (data.profile.role === 'solver' || data.profile.role === 'both') {
              setCurrentPage('solver');
            } else {
              setCurrentPage('poster');
            }
          }
        }
      } catch (error) {
        console.log('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const navigate = (page: string, params?: any) => {
    setCurrentPage(page);
    setPageParams(params || {});
  };

  const contextValue: AppContextType = {
    user,
    accessToken,
    setUser,
    setAccessToken,
    navigate,
    currentPage,
    pageParams,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading Next Aryca...</p>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen">
        {currentPage === 'landing' && <Landing />}
        {currentPage === 'login' && <Login />}
        {currentPage === 'register' && <Register />}
        {currentPage === 'solver' && <SolverDashboard />}
        {currentPage === 'poster' && <PosterDashboard />}
        {currentPage === 'create-challenge' && <CreateChallenge />}
        {currentPage === 'challenge' && <ChallengeDetails />}
        {currentPage === 'room' && <LiveRoom />}
        {currentPage === 'profile' && <Profile />}
        {currentPage === 'wallet' && <Wallet />}
      </div>
    </AppContext.Provider>
  );
}