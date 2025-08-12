import { 
  type User, 
  type InsertUser, 
  type ContactMessage, 
  type InsertContactMessage,
  type InvestmentPackage,
  type InsertInvestmentPackage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getInvestmentPackages(): Promise<InvestmentPackage[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contactMessages: Map<string, ContactMessage>;
  private investmentPackages: Map<string, InvestmentPackage>;

  constructor() {
    this.users = new Map();
    this.contactMessages = new Map();
    this.investmentPackages = new Map();
    
    // Initialize investment packages
    this.initializeInvestmentPackages();
  }

  private initializeInvestmentPackages() {
    const packages: InvestmentPackage[] = [
      {
        id: "basic",
        name: "Gói Cơ bản",
        minInvestment: "10000000",
        minRate: "5.00",
        maxRate: "8.00",
        features: [
          "Đầu tư tối thiểu: 10M VNĐ",
          "Phân tích thị trường cơ bản",
          "Hỗ trợ email 24/7",
          "Rút vốn linh hoạt"
        ],
        recommended: 0
      },
      {
        id: "premium",
        name: "Gói Cao cấp",
        minInvestment: "50000000",
        minRate: "8.00",
        maxRate: "12.00",
        features: [
          "Đầu tư tối thiểu: 50M VNĐ",
          "AI dự báo chuyên sâu",
          "Tư vấn 1-1 với chuyên gia",
          "Báo cáo tuần",
          "Ưu tiên rút vốn"
        ],
        recommended: 1
      },
      {
        id: "vip",
        name: "Gói VIP",
        minInvestment: "200000000",
        minRate: "12.00",
        maxRate: "18.00",
        features: [
          "Đầu tư tối thiểu: 200M VNĐ",
          "AI dự báo độc quyền",
          "Quản lý danh mục cá nhân",
          "Báo cáo hàng ngày",
          "Hotline riêng 24/7"
        ],
        recommended: 0
      }
    ];

    packages.forEach(pkg => {
      this.investmentPackages.set(pkg.id, pkg);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const id = randomUUID();
    const message: ContactMessage = { 
      ...insertMessage, 
      id,
      phone: insertMessage.phone || null,
      createdAt: new Date()
    };
    this.contactMessages.set(id, message);
    return message;
  }

  async getInvestmentPackages(): Promise<InvestmentPackage[]> {
    return Array.from(this.investmentPackages.values());
  }
}

export const storage = new MemStorage();
