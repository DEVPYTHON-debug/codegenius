import {
  users,
  shops,
  jobs,
  chatMessages,
  payments,
  ratings,
  virtualAccounts,
  type User,
  type UpsertUser,
  type Shop,
  type InsertShop,
  type Job,
  type InsertJob,
  type ChatMessage,
  type InsertChatMessage,
  type Payment,
  type InsertPayment,
  type Rating,
  type InsertRating,
  type VirtualAccount,
  type InsertVirtualAccount,
} from "@shared/schema";
import { eq, desc, and, or, like } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT - mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  updateUserStatus(id: string, isActive: boolean): Promise<void>;

  // Shop operations
  getShops(category?: string): Promise<Shop[]>;
  getShop(id: number): Promise<Shop | undefined>;
  createShop(shop: InsertShop): Promise<Shop>;
  updateShop(id: number, shop: Partial<InsertShop>): Promise<Shop>;
  deleteShop(id: number): Promise<void>;
  getShopsByOwner(ownerId: string): Promise<Shop[]>;

  // Job operations
  getJobs(category?: string): Promise<Job[]>;
  getJob(id: number): Promise<Job | undefined>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<Job>;
  deleteJob(id: number): Promise<void>;
  getJobsByPoster(posterId: string): Promise<Job[]>;

  // Chat operations
  getChatMessages(senderId: string, receiverId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;
  getRecentChats(userId: string): Promise<any[]>;

  // Payment operations
  getPayments(userId?: string): Promise<Payment[]>;
  getPayment(id: number): Promise<Payment | undefined>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment>;

  // Rating operations
  getRatings(ratedId: string): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;
  getAverageRating(ratedId: string): Promise<number>;

  // Virtual Account operations
  getVirtualAccount(userId: string): Promise<VirtualAccount | undefined>;
  createVirtualAccount(account: InsertVirtualAccount): Promise<VirtualAccount>;
  updateVirtualAccountBalance(userId: string, amount: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private shops: Map<number, Shop> = new Map();
  private jobs: Map<number, Job> = new Map();
  private chatMessages: ChatMessage[] = [];
  private payments: Map<number, Payment> = new Map();
  private ratings: Rating[] = [];
  private virtualAccounts: Map<string, VirtualAccount> = new Map();
  private currentShopId = 1;
  private currentJobId = 1;
  private currentMessageId = 1;
  private currentPaymentId = 1;
  private currentRatingId = 1;
  private currentAccountId = 1;

  constructor() {
    // Initialize with super admin
    this.users.set("super_admin", {
      id: "super_admin",
      email: "Jacobsilas007@gmail.com",
      firstName: "Super",
      lastName: "Admin",
      profileImageUrl: null,
      role: "super_admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      id: userData.id!,
      updatedAt: new Date(),
      createdAt: existingUser?.createdAt || new Date(),
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.isActive = isActive;
      user.updatedAt = new Date();
      this.users.set(id, user);
    }
  }

  // Shop operations
  async getShops(category?: string): Promise<Shop[]> {
    let shops = Array.from(this.shops.values()).filter(shop => shop.isActive);
    if (category && category !== 'all') {
      shops = shops.filter(shop => shop.category === category);
    }
    return shops.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getShop(id: number): Promise<Shop | undefined> {
    return this.shops.get(id);
  }

  async createShop(shopData: InsertShop): Promise<Shop> {
    const shop: Shop = {
      ...shopData,
      id: this.currentShopId++,
      createdAt: new Date(),
    };
    this.shops.set(shop.id, shop);
    return shop;
  }

  async updateShop(id: number, shopData: Partial<InsertShop>): Promise<Shop> {
    const existing = this.shops.get(id);
    if (!existing) throw new Error("Shop not found");
    
    const updated = { ...existing, ...shopData };
    this.shops.set(id, updated);
    return updated;
  }

  async deleteShop(id: number): Promise<void> {
    this.shops.delete(id);
  }

  async getShopsByOwner(ownerId: string): Promise<Shop[]> {
    return Array.from(this.shops.values()).filter(shop => shop.ownerId === ownerId);
  }

  // Job operations
  async getJobs(category?: string): Promise<Job[]> {
    let jobs = Array.from(this.jobs.values()).filter(job => job.status === 'open');
    if (category && category !== 'all') {
      jobs = jobs.filter(job => job.category === category);
    }
    return jobs.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getJob(id: number): Promise<Job | undefined> {
    return this.jobs.get(id);
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const job: Job = {
      ...jobData,
      id: this.currentJobId++,
      createdAt: new Date(),
    };
    this.jobs.set(job.id, job);
    return job;
  }

  async updateJob(id: number, jobData: Partial<InsertJob>): Promise<Job> {
    const existing = this.jobs.get(id);
    if (!existing) throw new Error("Job not found");
    
    const updated = { ...existing, ...jobData };
    this.jobs.set(id, updated);
    return updated;
  }

  async deleteJob(id: number): Promise<void> {
    this.jobs.delete(id);
  }

  async getJobsByPoster(posterId: string): Promise<Job[]> {
    return Array.from(this.jobs.values()).filter(job => job.posterId === posterId);
  }

  // Chat operations
  async getChatMessages(senderId: string, receiverId: string): Promise<ChatMessage[]> {
    return this.chatMessages
      .filter(msg => 
        (msg.senderId === senderId && msg.receiverId === receiverId) ||
        (msg.senderId === receiverId && msg.receiverId === senderId)
      )
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      ...messageData,
      id: this.currentMessageId++,
      timestamp: new Date(),
      isRead: false,
    };
    this.chatMessages.push(message);
    return message;
  }

  async markMessagesAsRead(senderId: string, receiverId: string): Promise<void> {
    this.chatMessages.forEach(msg => {
      if (msg.senderId === senderId && msg.receiverId === receiverId) {
        msg.isRead = true;
      }
    });
  }

  async getRecentChats(userId: string): Promise<any[]> {
    const userChats = new Map<string, ChatMessage>();
    
    this.chatMessages.forEach(msg => {
      const otherId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      if (msg.senderId === userId || msg.receiverId === userId) {
        const existing = userChats.get(otherId);
        if (!existing || msg.timestamp! > existing.timestamp!) {
          userChats.set(otherId, msg);
        }
      }
    });

    const chats = Array.from(userChats.entries()).map(([otherId, lastMessage]) => ({
      userId: otherId,
      user: this.users.get(otherId),
      lastMessage,
      unreadCount: this.chatMessages.filter(msg => 
        msg.senderId === otherId && msg.receiverId === userId && !msg.isRead
      ).length,
    }));

    return chats.sort((a, b) => b.lastMessage.timestamp!.getTime() - a.lastMessage.timestamp!.getTime());
  }

  // Payment operations
  async getPayments(userId?: string): Promise<Payment[]> {
    let payments = Array.from(this.payments.values());
    if (userId) {
      payments = payments.filter(p => p.payerId === userId || p.receiverId === userId);
    }
    return payments.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPayment(id: number): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...paymentData,
      id: this.currentPaymentId++,
      createdAt: new Date(),
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updatePayment(id: number, paymentData: Partial<InsertPayment>): Promise<Payment> {
    const existing = this.payments.get(id);
    if (!existing) throw new Error("Payment not found");
    
    const updated = { ...existing, ...paymentData };
    this.payments.set(id, updated);
    return updated;
  }

  // Rating operations
  async getRatings(ratedId: string): Promise<Rating[]> {
    return this.ratings.filter(rating => rating.ratedId === ratedId);
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    const rating: Rating = {
      ...ratingData,
      id: this.currentRatingId++,
      createdAt: new Date(),
    };
    this.ratings.push(rating);
    return rating;
  }

  async getAverageRating(ratedId: string): Promise<number> {
    const userRatings = this.ratings.filter(rating => rating.ratedId === ratedId);
    if (userRatings.length === 0) return 0;
    
    const sum = userRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return sum / userRatings.length;
  }

  // Virtual Account operations
  async getVirtualAccount(userId: string): Promise<VirtualAccount | undefined> {
    return this.virtualAccounts.get(userId);
  }

  async createVirtualAccount(accountData: InsertVirtualAccount): Promise<VirtualAccount> {
    const account: VirtualAccount = {
      ...accountData,
      id: this.currentAccountId++,
      createdAt: new Date(),
    };
    this.virtualAccounts.set(accountData.userId, account);
    return account;
  }

  async updateVirtualAccountBalance(userId: string, amount: string): Promise<void> {
    const account = this.virtualAccounts.get(userId);
    if (account) {
      account.balance = amount;
      this.virtualAccounts.set(userId, account);
    }
  }
}

export const storage = new MemStorage();
