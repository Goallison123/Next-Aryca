import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, LogOut, User, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

type Challenge = {
  id: string;
  title: string;
  description: string;
  bounty: number;
  status: string;
  fundingStatus: string;
  teams: string[];
  createdAt: string;
};

export function PosterDashboard() {
  const { user, accessToken, navigate, setUser, setAccessToken } = useContext(AppContext);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
      // In a real app, we'd have an endpoint for user's challenges
      // For now, we'll show all challenges
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8ab168b1/challenges?status=open`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Filter to only user's challenges
        const userChallenges = (data.challenges || []).filter(
          (c: Challenge) => c.id.includes(user?.id || '')
        );
        setChallenges(userChallenges);
      }
    } catch (error) {
      console.log('Load challenges error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAccessToken(null);
    navigate('landing');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="posterLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" style={{ stopColor: '#00e5ff', stopOpacity: 1 }} />
                      <stop offset="100%" style={{ stopColor: '#7c4dff', stopOpacity: 1 }} />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 50 10 L 80 90 L 65 90 L 50 50 L 35 90 L 20 90 L 50 10 Z"
                    fill="url(#posterLogoGradient)"
                    className="drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                  />
                </svg>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Next Aryca
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('profile', { userId: user?.id })}
              >
                <User className="w-4 h-4 mr-2" />
                {user?.name}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Challenges</h1>
            <p className="text-muted-foreground">Post and manage your challenges</p>
          </div>
          <Button 
            onClick={() => navigate('create-challenge')}
            className="glow-cyan"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Challenge
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Challenges</p>
                  <p className="text-2xl font-bold text-primary">{challenges.length}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-secondary">
                    {challenges.filter(c => c.status === 'in_progress').length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-secondary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-primary">
                    {challenges.filter(c => c.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 mx-auto mb-4 relative">
                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-muted-foreground">Loading challenges...</p>
            </div>
          ) : challenges.length === 0 ? (
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <Plus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">You haven't created any challenges yet</p>
                <Button 
                  onClick={() => navigate('create-challenge')}
                  className="glow-cyan"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Challenge
                </Button>
              </CardContent>
            </Card>
          ) : (
            challenges.map((challenge) => (
              <Card key={challenge.id} className="glass border-primary/20 hover:border-primary/50 transition-all">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{challenge.title}</CardTitle>
                      <CardDescription>{challenge.description}</CardDescription>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Badge className="bg-primary text-primary-foreground">
                        ${challenge.bounty}
                      </Badge>
                      <Badge variant={
                        challenge.status === 'completed' ? 'default' :
                        challenge.status === 'in_progress' ? 'secondary' :
                        'outline'
                      }>
                        {challenge.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {challenge.teams?.length || 0} teams joined
                    </div>
                    <Button
                      onClick={() => navigate('challenge', { challengeId: challenge.id })}
                      variant="outline"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
