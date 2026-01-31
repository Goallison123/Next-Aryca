import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../App';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, Clock, DollarSign, Users, Calendar } from 'lucide-react';

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
  posterId: string;
};

export function ChallengeDetails() {
  const { user, accessToken, navigate, pageParams } = useContext(AppContext);
  const { challengeId } = pageParams;
  
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8ab168b1/challenges/${challengeId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setChallenge(data.challenge);
      }
    } catch (error) {
      console.log('Load challenge error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 relative">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Challenge not found</p>
          <Button onClick={() => navigate('solver')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === challenge.posterId;
  const startDate = new Date(challenge.startTime);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(user?.role === 'poster' ? 'poster' : 'solver')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Challenge Header */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-3xl mb-2">{challenge.title}</CardTitle>
                  <CardDescription className="text-base">
                    {challenge.description}
                  </CardDescription>
                </div>
                <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2 ml-4">
                  ${challenge.bounty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-semibold">{challenge.duration} min</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Teams</p>
                    <p className="font-semibold">{challenge.teams?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Starts</p>
                    <p className="font-semibold">{startDate.toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Share</p>
                    <p className="font-semibold">${(challenge.bounty * 0.85).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="glass">
              <CardHeader>
                <CardTitle>Required Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {challenge.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader>
                <CardTitle>Challenge Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{challenge.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline">{challenge.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Time</span>
                  <span className="font-medium">{startDate.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payout Info */}
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle>Payout Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Bounty</span>
                  <span className="text-2xl font-bold text-primary">${challenge.bounty}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Platform Fee (15%)</span>
                  <span>${(challenge.bounty * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Winners Receive</span>
                  <span className="font-semibold text-primary">${(challenge.bounty * 0.85).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    The winning team will split the payout equally among all members. 
                    For a team of 3, each member receives ${((challenge.bounty * 0.85) / 3).toFixed(2)}.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isOwner && (
            <Card className="glass border-primary/20">
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <Button
                    onClick={handleJoin}
                    className="flex-1 glow-cyan"
                    size="lg"
                  >
                    Join Challenge
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('solver')}
                    size="lg"
                  >
                    Back to Challenges
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
