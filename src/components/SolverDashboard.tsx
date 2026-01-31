import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Clock, DollarSign, Trophy, Users, Wallet, LogOut, User } from 'lucide-react';

type Challenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  skills: string[];
  bounty: number;
  duration: number;
  startTime: string;
  status: string;
  teams: string[];
};

export function SolverDashboard() {
  const { user, accessToken, navigate, setUser, setAccessToken } = useContext(AppContext);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, []);

  const loadChallenges = async () => {
    try {
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
        setChallenges(data.challenges || []);
      }
    } catch (error) {
      console.log('Load challenges error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8ab168b1/challenges/${challengeId}/join`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        navigate('room', { challengeId });
      }
    } catch (error) {
      console.log('Join challenge error:', error);
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
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="dashLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#00e5ff', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#7c4dff', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                    <path
                      d="M 50 10 L 80 90 L 65 90 L 50 50 L 35 90 L 20 90 L 50 10 Z"
                      fill="url(#dashLogoGradient)"
                      className="drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                    />
                  </svg>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Next Aryca
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('wallet')}
              >
                <Wallet className="w-4 h-4 mr-2" />
                ${user?.earnings?.toFixed(2) || '0.00'}
              </Button>
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
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold text-primary">
                    ${user?.earnings?.toFixed(2) || '0.00'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-secondary">
                    {user?.completedChallenges || 0}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-secondary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rating</p>
                  <p className="text-2xl font-bold text-primary">
                    {user?.rating?.toFixed(1) || '5.0'}
                  </p>
                </div>
                <Trophy className="w-8 h-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-secondary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Skills</p>
                  <p className="text-2xl font-bold text-secondary">
                    {user?.skills?.length || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-secondary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Challenges */}
        <Tabs defaultValue="available" className="space-y-6">
          <TabsList className="glass">
            <TabsTrigger value="available">Available Challenges</TabsTrigger>
            <TabsTrigger value="joined">My Challenges</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
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
                  <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No challenges available right now</p>
                  <p className="text-sm text-muted-foreground mt-2">Check back soon!</p>
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
                      <Badge className="bg-primary text-primary-foreground ml-4">
                        ${challenge.bounty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {challenge.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>{challenge.duration} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{challenge.teams?.length || 0} teams</span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => navigate('challenge', { challengeId: challenge.id })}
                          variant="outline"
                          className="flex-1"
                        >
                          View Details
                        </Button>
                        <Button
                          onClick={() => handleJoinChallenge(challenge.id)}
                          className="flex-1 glow-cyan"
                        >
                          Join Challenge
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="joined">
            <Card className="glass">
              <CardContent className="py-12 text-center">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">You haven't joined any challenges yet</p>
                <p className="text-sm text-muted-foreground mt-2">Browse available challenges to get started!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
