import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kvStore from './kv_store.tsx';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Helper to verify auth
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// ========== AUTH ROUTES ==========

// Sign up
app.post('/make-server-8ab168b1/auth/signup', async (c) => {
  try {
    const { email, password, name, role, skills, timezone, location } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true,
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Store user profile
    await kvStore.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role, // 'solver', 'poster', or 'both'
      skills: skills || [],
      timezone: timezone || 'UTC',
      location: location || '',
      rating: 5.0,
      completedChallenges: 0,
      earnings: 0,
      createdAt: new Date().toISOString(),
    });
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Signup error:', error);
    return c.json({ error: 'Failed to create account' }, 500);
  }
});

// Sign in
app.post('/make-server-8ab168b1/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.log('Signin error:', error);
      return c.json({ error: error.message }, 400);
    }
    
    // Get user profile
    const profile = await kvStore.get(`user:${data.user.id}`);
    
    return c.json({ 
      session: data.session,
      profile 
    });
  } catch (error) {
    console.log('Signin error:', error);
    return c.json({ error: 'Failed to sign in' }, 500);
  }
});

// Get current session
app.get('/make-server-8ab168b1/auth/session', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const profile = await kvStore.get(`user:${user.id}`);
  return c.json({ user, profile });
});

// Sign out (client-side handles this mostly)
app.post('/make-server-8ab168b1/auth/signout', async (c) => {
  return c.json({ success: true });
});

// ========== USER ROUTES ==========

// Get user profile
app.get('/make-server-8ab168b1/users/:userId', async (c) => {
  const userId = c.req.param('userId');
  const profile = await kvStore.get(`user:${userId}`);
  
  if (!profile) {
    return c.json({ error: 'User not found' }, 404);
  }
  
  return c.json({ profile });
});

// Update user profile
app.put('/make-server-8ab168b1/users/:userId', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const userId = c.req.param('userId');
  if (user.id !== userId) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  const updates = await c.req.json();
  const currentProfile = await kvStore.get(`user:${userId}`);
  
  const updatedProfile = {
    ...currentProfile,
    ...updates,
    id: userId, // Don't allow ID changes
    email: currentProfile.email, // Don't allow email changes
  };
  
  await kvStore.set(`user:${userId}`, updatedProfile);
  
  return c.json({ profile: updatedProfile });
});

// ========== CHALLENGE ROUTES ==========

// Create challenge
app.post('/make-server-8ab168b1/challenges', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  try {
    const { title, description, category, skills, bounty, duration, startTime } = await c.req.json();
    
    const challengeId = `challenge:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const challenge = {
      id: challengeId,
      title,
      description,
      category,
      skills: skills || [],
      bounty,
      duration, // in minutes
      startTime,
      posterId: user.id,
      status: 'draft', // draft, open, in_progress, completed, cancelled
      teams: [],
      createdAt: new Date().toISOString(),
      fundingStatus: 'pending', // pending, funded
    };
    
    await kvStore.set(challengeId, challenge);
    
    // Add to poster's challenges list
    const posterChallenges = (await kvStore.get(`poster:${user.id}:challenges`)) || [];
    posterChallenges.push(challengeId);
    await kvStore.set(`poster:${user.id}:challenges`, posterChallenges);
    
    return c.json({ challenge });
  } catch (error) {
    console.log('Create challenge error:', error);
    return c.json({ error: 'Failed to create challenge' }, 500);
  }
});

// Fund challenge (in real app, this would integrate with Stripe)
app.post('/make-server-8ab168b1/challenges/:challengeId/fund', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const challengeId = c.req.param('challengeId');
  const challenge = await kvStore.get(challengeId);
  
  if (!challenge || challenge.posterId !== user.id) {
    return c.json({ error: 'Challenge not found or not authorized' }, 404);
  }
  
  challenge.fundingStatus = 'funded';
  challenge.status = 'open';
  await kvStore.set(challengeId, challenge);
  
  // Add to open challenges list
  const openChallenges = (await kvStore.get('challenges:open')) || [];
  if (!openChallenges.includes(challengeId)) {
    openChallenges.push(challengeId);
    await kvStore.set('challenges:open', openChallenges);
  }
  
  return c.json({ challenge });
});

// Get all open challenges
app.get('/make-server-8ab168b1/challenges', async (c) => {
  const status = c.req.query('status') || 'open';
  
  const challengeIds = (await kvStore.get(`challenges:${status}`)) || [];
  const challenges = await kvStore.mget(challengeIds);
  
  return c.json({ challenges: challenges.filter(Boolean) });
});

// Get specific challenge
app.get('/make-server-8ab168b1/challenges/:challengeId', async (c) => {
  const challengeId = c.req.param('challengeId');
  const challenge = await kvStore.get(challengeId);
  
  if (!challenge) {
    return c.json({ error: 'Challenge not found' }, 404);
  }
  
  return c.json({ challenge });
});

// ========== TEAM ROUTES ==========

// Join a challenge (creates or joins a team)
app.post('/make-server-8ab168b1/challenges/:challengeId/join', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const challengeId = c.req.param('challengeId');
  const challenge = await kvStore.get(challengeId);
  
  if (!challenge) {
    return c.json({ error: 'Challenge not found' }, 404);
  }
  
  // Find an available team or create new one
  let teamId = null;
  for (const tId of challenge.teams || []) {
    const team = await kvStore.get(tId);
    if (team && team.members.length < 5) {
      teamId = tId;
      break;
    }
  }
  
  if (!teamId) {
    // Create new team
    teamId = `team:${challengeId}:${Date.now()}`;
    const team = {
      id: teamId,
      challengeId,
      members: [user.id],
      createdAt: new Date().toISOString(),
    };
    await kvStore.set(teamId, team);
    
    challenge.teams = challenge.teams || [];
    challenge.teams.push(teamId);
    await kvStore.set(challengeId, challenge);
  } else {
    // Join existing team
    const team = await kvStore.get(teamId);
    if (!team.members.includes(user.id)) {
      team.members.push(user.id);
      await kvStore.set(teamId, team);
    }
  }
  
  // Add to user's joined challenges
  const userProfile = await kvStore.get(`user:${user.id}`);
  userProfile.joinedChallenges = userProfile.joinedChallenges || [];
  if (!userProfile.joinedChallenges.includes(challengeId)) {
    userProfile.joinedChallenges.push(challengeId);
    await kvStore.set(`user:${user.id}`, userProfile);
  }
  
  const team = await kvStore.get(teamId);
  return c.json({ team });
});

// ========== ROOM ROUTES ==========

// Create or get room for challenge
app.post('/make-server-8ab168b1/rooms/:challengeId', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const challengeId = c.req.param('challengeId');
  const roomId = `room:${challengeId}`;
  
  let room = await kvStore.get(roomId);
  
  if (!room) {
    room = {
      id: roomId,
      challengeId,
      messages: [],
      createdAt: new Date().toISOString(),
    };
    await kvStore.set(roomId, room);
  }
  
  return c.json({ room });
});

// Get room messages
app.get('/make-server-8ab168b1/rooms/:challengeId/messages', async (c) => {
  const challengeId = c.req.param('challengeId');
  const roomId = `room:${challengeId}`;
  
  const room = await kvStore.get(roomId);
  
  if (!room) {
    return c.json({ messages: [] });
  }
  
  return c.json({ messages: room.messages || [] });
});

// Post message to room
app.post('/make-server-8ab168b1/rooms/:challengeId/messages', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const challengeId = c.req.param('challengeId');
  const { content } = await c.req.json();
  const roomId = `room:${challengeId}`;
  
  let room = await kvStore.get(roomId);
  
  if (!room) {
    room = {
      id: roomId,
      challengeId,
      messages: [],
      createdAt: new Date().toISOString(),
    };
  }
  
  const userProfile = await kvStore.get(`user:${user.id}`);
  
  const message = {
    id: `msg:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: user.id,
    userName: userProfile?.name || 'Anonymous',
    content,
    timestamp: new Date().toISOString(),
  };
  
  room.messages = room.messages || [];
  room.messages.push(message);
  
  // Keep only last 100 messages
  if (room.messages.length > 100) {
    room.messages = room.messages.slice(-100);
  }
  
  await kvStore.set(roomId, room);
  
  return c.json({ message });
});

// ========== WALLET & TRANSACTIONS ==========

// Get wallet balance
app.get('/make-server-8ab168b1/wallet/:userId', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const userId = c.req.param('userId');
  if (user.id !== userId) {
    return c.json({ error: 'Forbidden' }, 403);
  }
  
  const profile = await kvStore.get(`user:${userId}`);
  const transactions = (await kvStore.get(`transactions:${userId}`)) || [];
  
  return c.json({ 
    balance: profile?.earnings || 0,
    transactions 
  });
});

// Add transaction (for demo purposes)
app.post('/make-server-8ab168b1/transactions', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const { userId, amount, type, description } = await c.req.json();
  
  const transaction = {
    id: `tx:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    amount,
    type, // 'earning', 'tip', 'payout'
    description,
    timestamp: new Date().toISOString(),
  };
  
  const transactions = (await kvStore.get(`transactions:${userId}`)) || [];
  transactions.push(transaction);
  await kvStore.set(`transactions:${userId}`, transactions);
  
  // Update user earnings
  const profile = await kvStore.get(`user:${userId}`);
  profile.earnings = (profile.earnings || 0) + amount;
  await kvStore.set(`user:${userId}`, profile);
  
  return c.json({ transaction });
});

// Complete challenge and distribute bounty
app.post('/make-server-8ab168b1/challenges/:challengeId/complete', async (c) => {
  const user = await verifyAuth(c.req.header('Authorization'));
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  
  const challengeId = c.req.param('challengeId');
  const { winningTeamId } = await c.req.json();
  
  const challenge = await kvStore.get(challengeId);
  
  if (!challenge || challenge.posterId !== user.id) {
    return c.json({ error: 'Not authorized to complete this challenge' }, 403);
  }
  
  challenge.status = 'completed';
  challenge.winningTeamId = winningTeamId;
  await kvStore.set(challengeId, challenge);
  
  // Distribute bounty (15% platform fee)
  const team = await kvStore.get(winningTeamId);
  const platformFee = challenge.bounty * 0.15;
  const payout = challenge.bounty - platformFee;
  const perMember = payout / team.members.length;
  
  for (const memberId of team.members) {
    const transaction = {
      id: `tx:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: memberId,
      amount: perMember,
      type: 'earning',
      description: `Won challenge: ${challenge.title}`,
      timestamp: new Date().toISOString(),
    };
    
    const transactions = (await kvStore.get(`transactions:${memberId}`)) || [];
    transactions.push(transaction);
    await kvStore.set(`transactions:${memberId}`, transactions);
    
    const profile = await kvStore.get(`user:${memberId}`);
    profile.earnings = (profile.earnings || 0) + perMember;
    profile.completedChallenges = (profile.completedChallenges || 0) + 1;
    await kvStore.set(`user:${memberId}`, profile);
  }
  
  return c.json({ challenge, payout: perMember });
});

Deno.serve(app.fetch);
