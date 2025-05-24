import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertShopSchema, insertJobSchema, insertChatMessageSchema, insertPaymentSchema, insertRatingSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User routes
  app.get('/api/users', isAuthenticated, async (req: any, res) => {
    try {
      const { role } = req.query;
      const users = role ? await storage.getUsersByRole(role as string) : [];
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.patch('/api/users/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      
      // Only admins can modify user status
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role!)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      await storage.updateUserStatus(id, isActive);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update user status" });
    }
  });

  // Shop routes
  app.get('/api/shops', async (req, res) => {
    try {
      const { category } = req.query;
      const shops = await storage.getShops(category as string);
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shops" });
    }
  });

  app.get('/api/shops/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const shop = await storage.getShop(parseInt(id));
      if (!shop) {
        return res.status(404).json({ message: "Shop not found" });
      }
      res.json(shop);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch shop" });
    }
  });

  app.post('/api/shops', isAuthenticated, async (req: any, res) => {
    try {
      const shopData = insertShopSchema.parse({
        ...req.body,
        ownerId: req.user.claims.sub,
      });
      const shop = await storage.createShop(shopData);
      res.status(201).json(shop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid shop data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shop" });
    }
  });

  app.get('/api/my-shops', isAuthenticated, async (req: any, res) => {
    try {
      const shops = await storage.getShopsByOwner(req.user.claims.sub);
      res.json(shops);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your shops" });
    }
  });

  // Job routes
  app.get('/api/jobs', async (req, res) => {
    try {
      const { category } = req.query;
      const jobs = await storage.getJobs(category as string);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch jobs" });
    }
  });

  app.post('/api/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const jobData = insertJobSchema.parse({
        ...req.body,
        posterId: req.user.claims.sub,
      });
      const job = await storage.createJob(jobData);
      res.status(201).json(job);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid job data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create job" });
    }
  });

  app.get('/api/my-jobs', isAuthenticated, async (req: any, res) => {
    try {
      const jobs = await storage.getJobsByPoster(req.user.claims.sub);
      res.json(jobs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch your jobs" });
    }
  });

  // Chat routes
  app.get('/api/chats', isAuthenticated, async (req: any, res) => {
    try {
      const chats = await storage.getRecentChats(req.user.claims.sub);
      res.json(chats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chats" });
    }
  });

  app.get('/api/chats/:userId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const messages = await storage.getChatMessages(req.user.claims.sub, userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/chats/:userId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const messageData = insertChatMessageSchema.parse({
        ...req.body,
        senderId: req.user.claims.sub,
        receiverId: userId,
      });
      const message = await storage.createChatMessage(messageData);
      
      // Broadcast to WebSocket clients
      broadcastMessage(message);
      
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid message data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Payment routes
  app.get('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const payments = await storage.getPayments(req.user.claims.sub);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post('/api/payments', isAuthenticated, async (req: any, res) => {
    try {
      const paymentData = insertPaymentSchema.parse({
        ...req.body,
        payerId: req.user.claims.sub,
      });
      const payment = await storage.createPayment(paymentData);
      res.status(201).json(payment);
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
      const { status, tx_ref, amount, currency } = req.body;
      
      if (status === 'successful') {
        // Find and update payment
        const payments = await storage.getPayments();
        const payment = payments.find(p => p.transactionRef === tx_ref);
        
        if (payment) {
          await storage.updatePayment(payment.id, {
            status: 'completed',
            flutterwaveRef: req.body.flw_ref,
          });
        }
      }
      
      res.status(200).json({ status: 'success' });
    } catch (error) {
      res.status(500).json({ message: "Webhook processing failed" });
    }
  });

  // Virtual Account routes
  app.get('/api/virtual-account', isAuthenticated, async (req: any, res) => {
    try {
      let account = await storage.getVirtualAccount(req.user.claims.sub);
      
      if (!account) {
        // Create virtual account
        const user = await storage.getUser(req.user.claims.sub);
        account = await storage.createVirtualAccount({
          userId: req.user.claims.sub,
          accountNumber: `${Math.floor(Math.random() * 9000000000) + 1000000000}`,
          bankName: "Wema Bank",
          accountName: `SILINK/${user?.firstName?.toUpperCase()} ${user?.lastName?.toUpperCase()}`,
          balance: "0.00",
          isActive: true,
        });
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
      const ratings = await storage.getRatings(userId);
      const average = await storage.getAverageRating(userId);
      res.json({ ratings, average });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });

  app.post('/api/ratings', isAuthenticated, async (req: any, res) => {
    try {
      const ratingData = insertRatingSchema.parse({
        ...req.body,
        raterId: req.user.claims.sub,
      });
      const rating = await storage.createRating(ratingData);
      res.status(201).json(rating);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid rating data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create rating" });
    }
  });

  // Analytics routes (admin only)
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role!)) {
        return res.status(403).json({ message: "Insufficient permissions" });
      }

      const users = await storage.getUsersByRole('student');
      const providers = await storage.getUsersByRole('provider');
      const shops = await storage.getShops();
      const jobs = await storage.getJobs();
      const payments = await storage.getPayments();

      const analytics = {
        totalUsers: users.length + providers.length,
        totalShops: shops.length,
        totalJobs: jobs.length,
        totalRevenue: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0),
        userGrowth: users.length * 0.12, // Mock 12% growth
        shopGrowth: shops.length * 0.08, // Mock 8% growth
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
