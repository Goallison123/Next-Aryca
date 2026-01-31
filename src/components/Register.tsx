import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowLeft, X } from 'lucide-react';

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Design', 
  'Marketing', 'Data Analysis', 'Writing', 'Video Editing',
  'Project Management', 'SEO', 'Mobile Development'
];

export function Register() {
  const { navigate } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: '',
    skills: [] as string[],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8ab168b1/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      // Success - navigate to login
      navigate('login');
    } catch (err) {
      console.log('Registration error:', err);
      setError('An error occurred during registration');
      setLoading(false);
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate('landing')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card className="glass border-primary/20">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <defs>
                  <linearGradient id="registerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#00e5ff', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#7c4dff', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <path
                  d="M 50 10 L 80 90 L 65 90 L 50 50 L 35 90 L 20 90 L 50 10 Z"
                  fill="url(#registerLogoGradient)"
                  className="drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]"
                />
              </svg>
            </div>
            <CardTitle className="text-2xl">Join Next Aryca</CardTitle>
            <CardDescription>
              {step === 1 ? 'Create your account' : 'Complete your profile'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {step === 1 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-input-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-input-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      minLength={6}
                      className="bg-input-background"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>I want to...</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'solver' })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.role === 'solver'
                            ? 'border-primary bg-primary/10 glow-cyan'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold">Solve Challenges</div>
                        <div className="text-sm text-muted-foreground">Join teams and earn money</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'poster' })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.role === 'poster'
                            ? 'border-secondary bg-secondary/10 glow-violet'
                            : 'border-border hover:border-secondary/50'
                        }`}
                      >
                        <div className="font-semibold">Post Challenges</div>
                        <div className="text-sm text-muted-foreground">Get solutions from experts</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, role: 'both' })}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          formData.role === 'both'
                            ? 'border-primary bg-primary/10 glow-cyan'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold">Both</div>
                        <div className="text-sm text-muted-foreground">Solve and post challenges</div>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full glow-cyan"
                    onClick={() => setStep(2)}
                    disabled={!formData.role || !formData.email || !formData.password || !formData.name}
                  >
                    Continue
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (Optional)</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="bg-input-background"
                    />
                  </div>

                  {(formData.role === 'solver' || formData.role === 'both') && (
                    <div className="space-y-2">
                      <Label>Your Skills</Label>
                      <div className="flex flex-wrap gap-2">
                        {SKILL_OPTIONS.map(skill => (
                          <Badge
                            key={skill}
                            variant={formData.skills.includes(skill) ? 'default' : 'outline'}
                            className={`cursor-pointer ${
                              formData.skills.includes(skill) 
                                ? 'bg-primary text-primary-foreground' 
                                : 'hover:bg-primary/10'
                            }`}
                            onClick={() => toggleSkill(skill)}
                          >
                            {skill}
                            {formData.skills.includes(skill) && (
                              <X className="w-3 h-3 ml-1" />
                            )}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select skills you're proficient in (click to add/remove)
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 glow-cyan"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <button
                onClick={() => navigate('login')}
                className="text-primary hover:underline"
              >
                Sign in
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
