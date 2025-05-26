import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { insertShopSchema, insertJobSchema, insertChatMessageSchema, insertPaymentSchema, insertRatingSchema } from "@shared/schema";
import { z } from "zod";
import { supabaseAuth } from "./supabaseAuth";
import { supabase } from "./supabase"; // <-- Make sure this file exists and exports the client

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get('/api/auth/users', async (req, res) => {
    const { data, error } = await supabase.from('users').select('*');
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get('/api/auth/user', supabaseAuth, async (req: any, res) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', req.user.id)
        .single();
      if (error) return res.status(500).json({ message: error.message });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.get('/api/users', supabaseAuth, async (req: any, res) => {
    try {
      const { role } = req.query;
      let query = supabase.from('users').select('*');
      if (role) query = query.eq('role', role);
      const { data, error } = await query;
      if (error) return res.status(500).json({ message: error.message });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/status', supabaseAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();
      if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }
      const { error } = await supabase
        .from('users')
        .update({ isActive })
        .eq('id', id);
      if (error) return res.status(500).json({ message: error.message });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Shop routes
  app.get('/api/shops', async (req, res) => {
    const { category } = req.query;
    let query = supabase.from('shops').select('*');
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.get('/api/shops/:id', async (req, res) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('shops').select('*').eq('id', id).single();
    if (error) return res.status(500).json({ message: error.message });
    if (!data) return res.status(404).json({ message: "Shop not found" });
    res.json(data);
  });

  app.post('/api/shops', supabaseAuth, async (req: any, res) => {
    try {
      const shopData = insertShopSchema.parse({
        ...req.body,
        ownerId: req.user.id,
      });
      const { data, error } = await supabase.from('shops').insert([shopData]).select().single();
      if (error) return res.status(500).json({ message: error.message });
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shop data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shop" });
    }
  });

  app.get('/api/my-shops', supabaseAuth, async (req: any, res) => {
    try {
      const { data, error } = await supabase.from('shops').select('*').eq('ownerId', req.user.id);
      if (error) return res.status(500).json({ message: error.message });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your shops" });
    }
  });

  // Job routes
  app.get('/api/jobs', async (req, res) => {
    const { category } = req.query;
    let query = supabase.from('jobs').select('*');
    if (category) query = query.eq('category', category);
    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post('/api/jobs', supabaseAuth, async (req: any, res) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        posterId: req.user.id,
      });
      const { data, error } = await supabase.from('jobs').insert([jobData]).select().single();
      if (error) return res.status(500).json({ message: error.message });
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/my-jobs', supabaseAuth, async (req: any, res) => {
    try {
      const { data, error } = await supabase.from('jobs').select('*').eq('posterId', req.user.id);
      if (error) return res.status(500).json({ message: error.message });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your jobs" });
    }
  });

  // Chat routes
  app.get('/api/chats/:userId/messages', supabaseAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(senderId.eq.${req.user.id},receiverId.eq.${userId}),and(senderId.eq.${userId},receiverId.eq.${req.user.id})`)
        .order('timestamp', { ascending: true });
      if (error) return res.status(500).json({ message: error.message });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chats/:userId/messages', supabaseAuth, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        senderId: req.user.id,
        receiverId: userId,
      });
      const { data, error } = await supabase.from('chat_messages').insert([messageData]).select().single();
      if (error) return res.status(500).json({ message: error.message });
      broadcastMessage(data); // keep your websocket logic
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Payment routes
  app.get('/api/payments', supabaseAuth, async (req: any, res) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .or(`payerId.eq.${req.user.id},receiverId.eq.${req.user.id}`);
      if (error) return res.status(500).json({ message: error.message });
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/payments', supabaseAuth, async (req: any, res) => {
    try {
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        payerId: req.user.id,
      });
      const { data, error } = await supabase.from('payments').insert([paymentData]).select().single();
      if (error) return res.status(500).json({ message: error.message });
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid payment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create payment" });
    }
  });

  // Flutterwave webhook
  app.post('/api/flutterwave/webhook', async (req, res) => {
    try {
      const { status, tx_ref, flw_ref } = req.body;
      if (status === 'successful') {
        // Find and update payment in Supabase
        const { data: payment, error: findError } = await supabase
          .from('payments')
          .select('*')
          .eq('transactionRef', tx_ref)
          .single();
        if (findError) return res.status(500).json({ message: findError.message });
        if (payment) {
          const { error: updateError } = await supabase
            .from('payments')
            .update({ status: 'completed', flutterwaveRef: flw_ref })
            .eq('id', payment.id);
          if (updateError) return res.status(500).json({ message: updateError.message });
        }
      }
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Virtual Account routes
  app.get('/api/virtual-account', supabaseAuth, async (req: any, res) => {
    try {
      let { data: account, error } = await supabase
        .from('virtual_accounts')
        .select('*')
        .eq('userId', req.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ message: error.message });
      }

      if (!account) {
        const user = { firstName: '', lastName: '' };
        const insertData = {
          userId: req.user.id,
          accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          bankName: "Wema Bank",
          accountName: `SILINK/${user?.firstName?.toUpperCase()} ${user?.lastName?.toUpperCase()}`,
          balance: "0.00",
          isActive: true,
        };
        const { data: created, error: createError } = await supabase
          .from('virtual_accounts')
          .insert([insertData])
          .select()
          .single();
        if (createError) return res.status(500).json({ message: createError.message });
        account = created;
      }

      res.json(account);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch virtual account" });
    }
  });

  // Rating routes
  app.get('/api/ratings/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { data, error } = await supabase.from('ratings').select('*').eq('ratedId', userId);
      if (error) return res.status(500).json({ message: error.message });
      const avg = data && data.length
        ? data.reduce((sum, r) => sum + r.rating, 0) / data.length
        : 0;
      res.json({ ratings: data, average: avg });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.post('/api/ratings', supabaseAuth, async (req: any, res) => {
    try {
      const ratingData = insertRatingSchema.parse({
        ...req.body,
        raterId: req.user.id,
      });
      const { data, error } = await supabase.from('ratings').insert([ratingData]).select().single();
      if (error) return res.status(500).json({ message: error.message });
      res.status(201).json(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rating data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  // Analytics routes (admin only)
  app.get('/api/analytics', supabaseAuth, async (req: any, res) => {
    try {
      const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', req.user.id)
        .single();
      if (userError) return res.status(500).json({ message: userError.message });
      if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const { data: users } = await supabase.from('users').select('*').eq('role', 'student');
      const { data: providers } = await supabase.from('users').select('*').eq('role', 'provider');
      const { data: shops } = await supabase.from('shops').select('*');
      const { data: jobs } = await supabase.from('jobs').select('*');
      const { data: payments } = await supabase.from('payments').select('*');

      const analytics = {
        totalUsers: (users?.length || 0) + (providers?.length || 0),
        totalShops: shops?.length || 0,
        totalJobs: jobs?.length || 0,
        totalRevenue: (payments || [])
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0),
        userGrowth: (users?.length || 0) * 0.12,
        shopGrowth: (shops?.length || 0) * 0.08,
      };

      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws: WebSocket, req) => {
    let userId: string | null = null;

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'auth') {
          userId = message.userId;
          clients.set(userId, ws);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // Function to broadcast messages to specific users
  function broadcastMessage(message: any) {
    const receiverWs = clients.get(message.receiverId);
    if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
      receiverWs.send(JSON.stringify({
        type: 'new_message',
        message,
      }));
    }
  }

  return httpServer;
}