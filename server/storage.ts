import { 
  type User, 
  type InsertUser, 
  type ContactMessage, 
  type InsertContactMessage,
  type InvestmentPackage,
  type InsertInvestmentPackage,
  type Investor,
  type InsertInvestor
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getInvestmentPackages(): Promise<InvestmentPackage[]>;
  getInvestors(): Promise<Investor[]>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
  updateInvestor(id: string, investor: Partial<Investor>): Promise<Investor | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contactMessages: Map<string, ContactMessage>;
  private investmentPackages: Map<string, InvestmentPackage>;
  private investors: Map<string, Investor>;

  constructor() {
    this.users = new Map();
    this.contactMessages = new Map();
    this.investmentPackages = new Map();
    this.investors = new Map();
    
    // Initialize investment packages and sample investors
    this.initializeInvestmentPackages();
    this.initializeSampleInvestors();
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

  private initializeSampleInvestors() {
    const sampleInvestors: Investor[] = [
      {
        id: randomUUID(),
        fullName: "Nguyễn Văn An",
        email: "nguyenvanan@gmail.com",
        phone: "+84901234567",
        investmentAmount: "50000000.00",
        bitcoinCode: "BTC001234",
        investmentDate: new Date("2024-01-15"),
        currentValue: "65000000.00",
        profitLoss: "15000000.00",
        profitLossPercentage: "30.00",
        status: "active",
        packageId: "premium"
      },
      {
        id: randomUUID(),
        fullName: "Trần Thị Bình",
        email: "tranthibibh@outlook.com",
        phone: "+84912345678",
        investmentAmount: "25000000.00",
        bitcoinCode: "BTC005678",
        investmentDate: new Date("2024-02-10"),
        currentValue: "22500000.00",
        profitLoss: "-2500000.00",
        profitLossPercentage: "-10.00",
        status: "active",
        packageId: "basic"
      },
      {
        id: randomUUID(),
        fullName: "Lê Minh Cường",
        email: "leminhcuong@yahoo.com",
        phone: "+84923456789",
        investmentAmount: "300000000.00",
        bitcoinCode: "BTC009876",
        investmentDate: new Date("2023-12-05"),
        currentValue: "420000000.00",
        profitLoss: "120000000.00",
        profitLossPercentage: "40.00",
        status: "active",
        packageId: "vip"
      },
      {
        id: randomUUID(),
        fullName: "Phạm Thị Dung",
        email: "phamthidung@gmail.com",
        phone: "+84934567890",
        investmentAmount: "75000000.00",
        bitcoinCode: "BTC112233",
        investmentDate: new Date("2024-03-01"),
        currentValue: "82500000.00",
        profitLoss: "7500000.00",
        profitLossPercentage: "10.00",
        status: "active",
        packageId: "premium"
      },
      {
        id: randomUUID(),
        fullName: "Hoàng Văn Đức",
        email: "hoangvanduc@hotmail.com",
        phone: "+84945678901",
        investmentAmount: "15000000.00",
        bitcoinCode: "BTC445566",
        investmentDate: new Date("2024-01-20"),
        currentValue: "16800000.00",
        profitLoss: "1800000.00",
        profitLossPercentage: "12.00",
        status: "active",
        packageId: "basic"
      }
    ];

    sampleInvestors.forEach(investor => {
      this.investors.set(investor.id, investor);
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

  async getInvestors(): Promise<Investor[]> {
    return Array.from(this.investors.values()).sort((a, b) => 
      new Date(b.investmentDate || 0).getTime() - new Date(a.investmentDate || 0).getTime()
    );
  }

  async createInvestor(insertInvestor: InsertInvestor): Promise<Investor> {
    const id = randomUUID();
    const investor: Investor = { 
      ...insertInvestor, 
      id,
      investmentDate: new Date(),
      status: insertInvestor.status || "active"
    };
    this.investors.set(id, investor);
    return investor;
  }

  async updateInvestor(id: string, updates: Partial<Investor>): Promise<Investor | undefined> {
    const existing = this.investors.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.investors.set(id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
