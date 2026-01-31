import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { projectId } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, X } from 'lucide-react';

const SKILL_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Design', 
  'Marketing', 'Data Analysis', 'Writing', 'Video Editing',
  'Project Management', 'SEO', 'Mobile Development'
];

const CATEGORIES = [
  'Development', 'Design', 'Marketing', 'Writing', 
  'Data Analysis', 'Business', 'Other'
];

export function CreateChallenge() {
  const { user, accessToken, navigate } = useContext(AppContext);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [] as string[],
    bounty: '',
    duration: '60',
    startTime: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8ab168b1/challenges`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            skills: formData.skills,
            bounty: parseFloat(formData.bounty),
            duration: parseInt(formData.duration),
            startTime: formData.startTime,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Failed to create challenge');
        setLoading(false);
        return;
      }

      const data = await response.json();
      
      // Fund the challenge (in real app, this would go through Stripe)
      const fundResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-8ab168b1/challenges/${data.challenge.id}/fund`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (fundResponse.ok) {
        navigate('poster');
      }
    } catch (err) {
      console.log('Create challenge error:', err);
      setError('An error occurred while creating the challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('poster')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="glass border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Create a Challenge</CardTitle>
              <CardDescription>
                Post a challenge and get solutions from skilled teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Challenge Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Build a landing page for my startup"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-input-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the challenge in detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={6}
                    className="bg-input-background"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className="bg-input-background">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bounty">Bounty ($)</Label>
                    <Input
                      id="bounty"
                      type="number"
                      min="10"
                      step="10"
                      placeholder="100"
                      value={formData.bounty}
                      onChange={(e) => setFormData({ ...formData, bounty: e.target.value })}
                      required
                      className="bg-input-background"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => setFormData({ ...formData, duration: value })}
                    >
                      <SelectTrigger className="bg-input-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      className="bg-input-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Required Skills</Label>
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
                    Select skills required for this challenge
                  </p>
                </div>

                {error && (
                  <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="bg-muted/50 border border-border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Summary</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Bounty:</span> ${formData.bounty || '0'}</p>
                    <p><span className="text-muted-foreground">Platform Fee (15%):</span> ${formData.bounty ? (parseFloat(formData.bounty) * 0.15).toFixed(2) : '0'}</p>
                    <p><span className="text-muted-foreground">Winners Receive:</span> ${formData.bounty ? (parseFloat(formData.bounty) * 0.85).toFixed(2) : '0'}</p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full glow-cyan"
                  disabled={loading || !formData.category}
                >
                  {loading ? 'Creating Challenge...' : 'Create & Fund Challenge'}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By creating a challenge, you agree to fund the bounty upfront. 
                  Payment will be held until the challenge is completed.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
