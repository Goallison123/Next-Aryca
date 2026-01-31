import React, { useContext } from 'react';
import { AppContext } from '../App';
import { Button } from './ui/button';
import { Zap, Users, Trophy, DollarSign } from 'lucide-react';

export function Landing() {
  const { navigate } = useContext(AppContext);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00e5ff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#7c4dff', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 10 L 80 90 L 65 90 L 50 50 L 35 90 L 20 90 L 50 10 Z"
                  fill="url(#logoGradient)"
                  className="drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                />
              </svg>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Next Aryca
            </span>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('login')}>
              Sign In
            </Button>
            <Button onClick={() => navigate('register')} className="glow-cyan">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-pulse">
            Turn Skills into Cash
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Real-time team challenges where clients post problems, skilled solvers collaborate live, 
            and everyone can watch, vote, and tip. Welcome to the skill arena.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('register')}
              className="glow-cyan text-lg px-8"
            >
              Join as Solver
            </Button>
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => navigate('register')}
              className="glow-violet text-lg px-8"
            >
              Post a Challenge
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass rounded-xl p-6 hover:glow-cyan transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Live Collaboration</h3>
            <p className="text-muted-foreground text-sm">
              Join teams and solve challenges in real-time with chat, whiteboard, and code editors.
            </p>
          </div>

          <div className="glass rounded-xl p-6 hover:glow-violet transition-all">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Team Matching</h3>
            <p className="text-muted-foreground text-sm">
              Get matched with skilled teammates based on expertise and challenge requirements.
            </p>
          </div>

          <div className="glass rounded-xl p-6 hover:glow-cyan transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Win Bounties</h3>
            <p className="text-muted-foreground text-sm">
              Compete for paid challenges with transparent payouts distributed to winning teams.
            </p>
          </div>

          <div className="glass rounded-xl p-6 hover:glow-violet transition-all">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Earn & Tip</h3>
            <p className="text-muted-foreground text-sm">
              Track your earnings, receive tips from viewers, and cash out anytime.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold border border-primary/30">
              1
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Clients Post Challenges</h3>
              <p className="text-muted-foreground">
                Businesses and individuals post real-world problems with bounties, timelines, and skill requirements.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary font-bold border border-secondary/30">
              2
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Solvers Join Teams</h3>
              <p className="text-muted-foreground">
                Skilled professionals browse challenges, form teams (2-5 members), and prepare to collaborate.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary font-bold border border-primary/30">
              3
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Live Collaboration</h3>
              <p className="text-muted-foreground">
                Teams work together in timed sessions with real-time chat, shared tools, and viewer engagement.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary font-bold border border-secondary/30">
              4
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Win & Get Paid</h3>
              <p className="text-muted-foreground">
                Client selects the winning solution, and bounty is automatically distributed to team members.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20">
        <div className="glass rounded-2xl p-12 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">Ready to Enter the Arena?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of solvers earning money by solving real problems, or post your challenge today.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('register')}
            className="glow-cyan text-lg px-12"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-muted-foreground text-sm">
            © 2026 Next Aryca. Turn real-world tasks into timed, collaborative skill arenas.
          </p>
        </div>
      </footer>
    </div>
  );
}
