import { 
  type User, 
  type InsertUser, 
  type AuthUser,
  type InsertAuthUser,
  type ContactMessage, 
  type InsertContactMessage,
  type InvestmentPackage,
  type InsertInvestmentPackage,
  type Investor,
  type InsertInvestor,
  type CommunityMember,
  type InsertCommunityMember,
  type PaymentTransaction,
  type InsertPaymentTransaction,
  type UserInvestment,
  type InsertUserInvestment,
  type InvestmentHistory,
  type InsertInvestmentHistory,
  type InvestmentSummary,
  type InsertInvestmentSummary,
  type ManagerInvestorAssignment,
  type InsertManagerInvestorAssignment,
  users,
  authUsers,
  contactMessages,
  investmentPackages,
  investors,
  communityMembers,
  paymentTransactions,
  userInvestments,
  investmentHistory,
  investmentSummary,
  managerInvestorAssignments
} from "@shared/schema";
import { randomUUID } from "crypto";
import { hashPassword } from "./auth";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Auth user management
  getAuthUsers(): Promise<AuthUser[]>;
  getAuthUser(id: string): Promise<AuthUser | undefined>;
  getAuthUserByUsername(username: string): Promise<AuthUser | undefined>;
  createAuthUser(user: InsertAuthUser): Promise<AuthUser>;
  updateAuthUser(id: string, user: Partial<AuthUser>): Promise<AuthUser | undefined>;
  deleteAuthUser(id: string): Promise<boolean>;
  
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  getInvestmentPackages(): Promise<InvestmentPackage[]>;
  getInvestors(): Promise<Investor[]>;
  createInvestor(investor: InsertInvestor): Promise<Investor>;
  updateInvestor(id: string, investor: Partial<Investor>): Promise<Investor | undefined>;
  getCommunityMembers(): Promise<CommunityMember[]>;
  createCommunityMember(member: InsertCommunityMember): Promise<CommunityMember>;
  updateCommunityMember(id: string, member: Partial<CommunityMember>): Promise<CommunityMember | undefined>;
  deleteCommunityMember(id: string): Promise<boolean>;
  
  // Payment transaction management
  getPaymentTransactions(): Promise<PaymentTransaction[]>;
  getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined>;
  getPaymentTransactionsByUserId(userId: string): Promise<PaymentTransaction[]>;
  createPaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  updatePaymentTransaction(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined>;
  
  // User investment management
  getUserInvestments(): Promise<UserInvestment[]>;
  getUserInvestment(id: string): Promise<UserInvestment | undefined>;
  getUserInvestmentsByUserId(userId: string): Promise<UserInvestment[]>;
  createUserInvestment(investment: InsertUserInvestment): Promise<UserInvestment>;
  updateUserInvestment(id: string, updates: Partial<UserInvestment>): Promise<UserInvestment | undefined>;
  deleteUserInvestment(id: string): Promise<boolean>;
  
  // Investment history tracking for P&L calculations
  getInvestmentHistory(userInvestmentId: string): Promise<InvestmentHistory[]>;
  createInvestmentHistory(history: InsertInvestmentHistory): Promise<InvestmentHistory>;
  getLatestInvestmentHistory(userInvestmentId: string): Promise<InvestmentHistory | undefined>;
  
  // Investment summary management
  getInvestmentSummary(userId: string): Promise<InvestmentSummary | undefined>;
  createInvestmentSummary(summary: InsertInvestmentSummary): Promise<InvestmentSummary>;
  updateInvestmentSummary(userId: string, updates: Partial<InvestmentSummary>): Promise<InvestmentSummary | undefined>;
  
  // Role-based queries for investor management
  getInvestorsByManagerId(managerId: string): Promise<AuthUser[]>; // Manager can see their investors
  getAllInvestorsForAdmin(): Promise<AuthUser[]>; // Admin can see all investors
  getInvestorPerformanceReport(userId: string): Promise<{
    user: AuthUser;
    summary: InvestmentSummary | undefined;
    investments: UserInvestment[];
    totalReturn: number;
  }>;
  
  // SECURITY CRITICAL: Manager-investor assignment validation
  checkManagerInvestorAssignment(managerId: string, investorId: string): Promise<boolean>;
  createManagerInvestorAssignment(managerId: string, investorId: string, assignedBy: string, notes?: string): Promise<boolean>;
  removeManagerInvestorAssignment(managerId: string, investorId: string): Promise<boolean>;
  getManagerAssignments(managerId: string): Promise<string[]>; // Returns investor IDs
}

export class DatabaseStorage implements IStorage {
  private initialized = false;

  constructor() {
    this.initData(); // Initialize async data
  }

  private async initData() {
    if (this.initialized) return;
    try {
      await this.initializeInvestmentPackages();
      await this.initializeSampleAuthUsers();
      await this.initializeSampleInvestors();
      await this.initializeSampleCommunityMembers();
      this.initialized = true;
      console.log('Database storage initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  }

  private async initializeInvestmentPackages() {
    try {
      // Check if packages already exist
      const existingPackages = await db.select().from(investmentPackages).limit(1);
      if (existingPackages.length > 0) return;

      const packages = [
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

      await db.insert(investmentPackages).values(packages);
      console.log('Investment packages initialized');
    } catch (error) {
      console.error('Error initializing investment packages:', error);
    }
  }

  private async initializeSampleInvestors() {
    try {
      // Check if investors already exist
      const existingInvestors = await db.select().from(investors).limit(1);
      if (existingInvestors.length > 0) return;

      const sampleInvestors = [
        {
          fullName: "Nguyễn Văn An",
          email: "nguyenvanan@gmail.com",
          phone: "+84901234567",
          facebookUrl: "https://facebook.com/nguyenvanan",
          zaloPhone: "0901234567",
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
          fullName: "Trần Thị Bình",
          email: "tranthibibh@outlook.com",
          phone: "+84912345678",
          facebookUrl: null,
          zaloPhone: "0912345678",
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
          fullName: "Lê Minh Cường",
          email: "leminhcuong@yahoo.com",
          phone: "+84923456789",
          facebookUrl: "https://facebook.com/leminhcuong",
          zaloPhone: "0923456789",
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
          fullName: "Phạm Thị Dung",
          email: "phamthidung@gmail.com",
          phone: "+84934567890",
          facebookUrl: "https://facebook.com/phamthidung",
          zaloPhone: null,
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
          fullName: "Hoàng Văn Đức",
          email: "hoangvanduc@hotmail.com",
          phone: "+84945678901",
          facebookUrl: null,
          zaloPhone: "0945678901",
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

      await db.insert(investors).values(sampleInvestors);
      console.log('Sample investors initialized');
    } catch (error) {
      console.error('Error initializing sample investors:', error);
    }
  }

  private async initializeSampleCommunityMembers() {
    try {
      // Check if community members already exist
      const existingMembers = await db.select().from(communityMembers).limit(1);
      if (existingMembers.length > 0) return;

      const sampleMembers = [
        {
          fullName: "Nguyễn Văn An",
          email: "nguyenvanan@gmail.com",
          phone: "0987654321",
          avatar: null,
          bio: "Nhà đầu tư Bitcoin với 5 năm kinh nghiệm. Chuyên về phân tích kỹ thuật và DCA.",
          interests: ["Bitcoin", "Blockchain", "DeFi", "Trading"],
          experienceLevel: "advanced",
          investmentFocus: ["Bitcoin", "Ethereum"],
          joinDate: new Date("2023-01-15"),
          lastActive: new Date(),
          isActive: true,
          socialLinks: ["https://facebook.com/nguyenvanan", "https://twitter.com/nguyenvanan"],
          location: "Hà Nội",
          occupation: "Kỹ sư phần mềm",
          totalInvestment: "500000000",
          memberLevel: "Gold",
          points: 2500,
        },
        {
          fullName: "Trần Thị Bình",
          email: "tranthibinh@yahoo.com",
          phone: "0912345678",
          avatar: null,
          bio: "Người mới bắt đầu học về Bitcoin và crypto. Mong muốn học hỏi từ cộng đồng.",
          interests: ["Bitcoin", "Đầu tư", "Tài chính cá nhân"],
          experienceLevel: "beginner",
          investmentFocus: ["Bitcoin"],
          joinDate: new Date("2024-06-20"),
          lastActive: new Date(),
          isActive: true,
          socialLinks: ["https://facebook.com/tranthibinh"],
          location: "TP. Hồ Chí Minh",
          occupation: "Giáo viên",
          totalInvestment: "50000000",
          memberLevel: "Bronze",
          points: 150,
        },
        {
          fullName: "Lê Minh Cường",
          email: "leminhcuong@outlook.com",
          phone: "0908765432",
          avatar: null,
          bio: "Trader chuyên nghiệp, chuyên về futures và options. Chia sẻ signals và chiến lược giao dịch.",
          interests: ["Bitcoin", "Futures", "Options", "Technical Analysis"],
          experienceLevel: "expert",
          investmentFocus: ["Bitcoin", "Ethereum", "DeFi"],
          joinDate: new Date("2022-08-10"),
          lastActive: new Date(),
          isActive: true,
          socialLinks: ["https://twitter.com/leminhcuong", "https://t.me/leminhcuong"],
          location: "Đà Nẵng",
          occupation: "Trader",
          totalInvestment: "2000000000",
          memberLevel: "Diamond",
          points: 8500,
        }
      ];

      await db.insert(communityMembers).values(sampleMembers);
      console.log('Sample community members initialized');
    } catch (error) {
      console.error('Error initializing sample community members:', error);
    }
  }

  // Auth User Methods
  private async initializeSampleAuthUsers() {
    try {
      // Check if auth users already exist
      const existingUsers = await db.select().from(authUsers).limit(1);
      if (existingUsers.length > 0) return;

      const sampleAuthUsers = [
        {
          username: "admin",
          password: await hashPassword("admin123"),
          role: "admin",
          fullName: "Administrator",
          email: "admin@hhdcoin.net",
          status: "active",
          lastLogin: new Date("2025-08-10T09:00:00Z"),
          createdAt: new Date("2025-01-01T00:00:00Z"),
          updatedAt: new Date("2025-08-10T09:00:00Z"),
        },
        {
          username: "member1",
          password: await hashPassword("member123"),
          role: "member",
          fullName: "Nguyễn Văn A",
          email: "member1@gmail.com",
          status: "active",
          lastLogin: new Date("2025-08-11T14:30:00Z"),
          createdAt: new Date("2025-02-15T00:00:00Z"),
          updatedAt: new Date("2025-08-11T14:30:00Z"),
        },
        {
          username: "manager",
          password: await hashPassword("manager123"),
          role: "admin",
          fullName: "Trần Thị B",
          email: "manager@hhdcoin.net",
          status: "active",
          lastLogin: null,
          createdAt: new Date("2025-03-01T00:00:00Z"),
          updatedAt: new Date("2025-03-01T00:00:00Z"),
        }
      ];

      await db.insert(authUsers).values(sampleAuthUsers);
      console.log('Sample auth users initialized');
    } catch (error) {
      console.error('Error initializing sample auth users:', error);
    }
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Auth User Methods
  async getAuthUsers(): Promise<AuthUser[]> {
    return await db.select().from(authUsers).orderBy(desc(authUsers.createdAt));
  }

  async getAuthUser(id: string): Promise<AuthUser | undefined> {
    const result = await db.select().from(authUsers).where(eq(authUsers.id, id));
    return result[0];
  }

  async getAuthUserByUsername(username: string): Promise<AuthUser | undefined> {
    const result = await db.select().from(authUsers).where(eq(authUsers.username, username));
    return result[0];
  }

  async createAuthUser(insertUser: InsertAuthUser): Promise<AuthUser> {
    // Hash password for security
    const hashedPassword = await hashPassword(insertUser.password);
    
    const userWithHashedPassword = {
      ...insertUser,
      password: hashedPassword,
    };

    const result = await db.insert(authUsers).values(userWithHashedPassword).returning();
    return result[0];
  }

  async updateAuthUser(id: string, updates: Partial<AuthUser>): Promise<AuthUser | undefined> {
    // Hash password if being updated
    if (updates.password) {
      updates.password = await hashPassword(updates.password);
    }
    
    const result = await db
      .update(authUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(authUsers.id, id))
      .returning();
    
    return result[0];
  }

  async deleteAuthUser(id: string): Promise<boolean> {
    const result = await db.delete(authUsers).where(eq(authUsers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Contact message methods
  async createContactMessage(insertMessage: InsertContactMessage): Promise<ContactMessage> {
    const result = await db.insert(contactMessages).values(insertMessage).returning();
    return result[0];
  }

  // Investment package methods
  async getInvestmentPackages(): Promise<InvestmentPackage[]> {
    return await db.select().from(investmentPackages);
  }

  // Investor methods
  async getInvestors(): Promise<Investor[]> {
    return await db.select().from(investors).orderBy(desc(investors.investmentDate));
  }

  async createInvestor(insertInvestor: InsertInvestor): Promise<Investor> {
    const result = await db.insert(investors).values(insertInvestor).returning();
    return result[0];
  }

  async updateInvestor(id: string, updates: Partial<Investor>): Promise<Investor | undefined> {
    const result = await db
      .update(investors)
      .set(updates)
      .where(eq(investors.id, id))
      .returning();
    
    return result[0];
  }

  // Community member methods
  async getCommunityMembers(): Promise<CommunityMember[]> {
    return await db.select().from(communityMembers).orderBy(desc(communityMembers.joinDate));
  }

  async createCommunityMember(insertMember: InsertCommunityMember): Promise<CommunityMember> {
    const result = await db.insert(communityMembers).values(insertMember).returning();
    return result[0];
  }

  async updateCommunityMember(id: string, updates: Partial<CommunityMember>): Promise<CommunityMember | undefined> {
    const result = await db
      .update(communityMembers)
      .set({ ...updates, lastActive: new Date() })
      .where(eq(communityMembers.id, id))
      .returning();
    
    return result[0];
  }

  async deleteCommunityMember(id: string): Promise<boolean> {
    const result = await db.delete(communityMembers).where(eq(communityMembers.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Payment Transaction Methods
  async getPaymentTransactions(): Promise<PaymentTransaction[]> {
    return await db.select().from(paymentTransactions).orderBy(desc(paymentTransactions.createdAt));
  }

  async getPaymentTransaction(id: string): Promise<PaymentTransaction | undefined> {
    const result = await db.select().from(paymentTransactions).where(eq(paymentTransactions.id, id));
    return result[0];
  }

  async getPaymentTransactionsByUserId(userId: string): Promise<PaymentTransaction[]> {
    return await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.userId, userId))
      .orderBy(desc(paymentTransactions.createdAt));
  }

  async createPaymentTransaction(insertTransaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const result = await db.insert(paymentTransactions).values(insertTransaction).returning();
    return result[0];
  }

  async updatePaymentTransaction(id: string, updates: Partial<PaymentTransaction>): Promise<PaymentTransaction | undefined> {
    const updateData = { ...updates };
    if (updates.status === "completed" && !updates.completedAt) {
      updateData.completedAt = new Date();
    }
    
    const result = await db
      .update(paymentTransactions)
      .set(updateData)
      .where(eq(paymentTransactions.id, id))
      .returning();
    
    return result[0];
  }

  // User Investment Methods
  async getUserInvestments(): Promise<UserInvestment[]> {
    return await db.select().from(userInvestments).orderBy(desc(userInvestments.startDate));
  }

  async getUserInvestment(id: string): Promise<UserInvestment | undefined> {
    const result = await db.select().from(userInvestments).where(eq(userInvestments.id, id));
    return result[0];
  }

  async getUserInvestmentsByUserId(userId: string): Promise<UserInvestment[]> {
    return await db.select()
      .from(userInvestments)
      .where(eq(userInvestments.userId, userId))
      .orderBy(desc(userInvestments.startDate));
  }

  async createUserInvestment(insertInvestment: InsertUserInvestment): Promise<UserInvestment> {
    const result = await db.insert(userInvestments).values(insertInvestment).returning();
    return result[0];
  }

  async updateUserInvestment(id: string, updates: Partial<UserInvestment>): Promise<UserInvestment | undefined> {
    const result = await db
      .update(userInvestments)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(userInvestments.id, id))
      .returning();
    
    return result[0];
  }

  async deleteUserInvestment(id: string): Promise<boolean> {
    const result = await db.delete(userInvestments).where(eq(userInvestments.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Investment history tracking for P&L calculations
  async getInvestmentHistory(userInvestmentId: string): Promise<InvestmentHistory[]> {
    try {
      return await db.select()
        .from(investmentHistory)
        .where(eq(investmentHistory.userInvestmentId, userInvestmentId))
        .orderBy(desc(investmentHistory.recordedAt));
    } catch (error) {
      console.error('Error getting investment history:', error);
      return [];
    }
  }

  async createInvestmentHistory(history: InsertInvestmentHistory): Promise<InvestmentHistory> {
    try {
      const [newHistory] = await db.insert(investmentHistory).values(history).returning();
      return newHistory;
    } catch (error) {
      console.error('Error creating investment history:', error);
      throw error;
    }
  }

  async getLatestInvestmentHistory(userInvestmentId: string): Promise<InvestmentHistory | undefined> {
    try {
      const [latest] = await db.select()
        .from(investmentHistory)
        .where(eq(investmentHistory.userInvestmentId, userInvestmentId))
        .orderBy(desc(investmentHistory.recordedAt))
        .limit(1);
      return latest;
    } catch (error) {
      console.error('Error getting latest investment history:', error);
      return undefined;
    }
  }

  // Investment summary management
  async getInvestmentSummary(userId: string): Promise<InvestmentSummary | undefined> {
    try {
      const [summary] = await db.select()
        .from(investmentSummary)
        .where(eq(investmentSummary.userId, userId));
      return summary;
    } catch (error) {
      console.error('Error getting investment summary:', error);
      return undefined;
    }
  }

  async createInvestmentSummary(summary: InsertInvestmentSummary): Promise<InvestmentSummary> {
    try {
      const [newSummary] = await db.insert(investmentSummary).values(summary).returning();
      return newSummary;
    } catch (error) {
      console.error('Error creating investment summary:', error);
      throw error;
    }
  }

  async updateInvestmentSummary(userId: string, updates: Partial<InvestmentSummary>): Promise<InvestmentSummary | undefined> {
    try {
      const [updated] = await db.update(investmentSummary)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(investmentSummary.userId, userId))
        .returning();
      return updated;
    } catch (error) {
      console.error('Error updating investment summary:', error);
      return undefined;
    }
  }

  // SECURITY FIXED: Role-based queries for investor management with proper assignment validation
  async getInvestorsByManagerId(managerId: string): Promise<AuthUser[]> {
    try {
      console.log(`[SECURITY] Manager ${managerId} requesting investor data - using proper assignment validation`);
      
      // Get investors assigned to this manager through secure relationship table
      const results = await db.select({
        id: authUsers.id,
        username: authUsers.username,
        role: authUsers.role,
        fullName: authUsers.fullName,
        email: authUsers.email,
        status: authUsers.status,
        lastLogin: authUsers.lastLogin,
        createdAt: authUsers.createdAt,
        updatedAt: authUsers.updatedAt,
        password: authUsers.password
      })
        .from(authUsers)
        .innerJoin(managerInvestorAssignments, eq(authUsers.id, managerInvestorAssignments.investorId))
        .where(and(
          eq(authUsers.role, 'investor'),
          eq(authUsers.status, 'active'),
          eq(managerInvestorAssignments.managerId, managerId),
          eq(managerInvestorAssignments.isActive, true)
        ))
        .orderBy(desc(authUsers.createdAt));

      console.log(`[SECURITY] Manager ${managerId} has access to ${results.length} investors`);
      return results;
    } catch (error) {
      console.error('Error getting investors by manager:', error);
      // FAIL SECURE: Return empty array on any error to prevent unauthorized access
      return [];
    }
  }

  async getAllInvestorsForAdmin(): Promise<AuthUser[]> {
    try {
      return await db.select()
        .from(authUsers)
        .where(eq(authUsers.role, 'investor'))
        .orderBy(desc(authUsers.createdAt));
    } catch (error) {
      console.error('Error getting all investors:', error);
      return [];
    }
  }

  async getInvestorPerformanceReport(userId: string): Promise<{
    user: AuthUser;
    summary: InvestmentSummary | undefined;
    investments: UserInvestment[];
    totalReturn: number;
  }> {
    try {
      const user = await this.getAuthUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const summary = await this.getInvestmentSummary(userId);
      const investments = await this.getUserInvestmentsByUserId(userId);
      
      // Calculate total return
      const totalReturn = investments.reduce((acc, inv) => {
        const profitLoss = parseFloat(inv.profitLoss?.toString() || '0');
        return acc + profitLoss;
      }, 0);

      return {
        user,
        summary,
        investments,
        totalReturn
      };
    } catch (error) {
      console.error('Error getting investor performance report:', error);
      throw error;
    }
  }

  // SECURITY CRITICAL: Manager-investor assignment validation methods
  async checkManagerInvestorAssignment(managerId: string, investorId: string): Promise<boolean> {
    try {
      const assignment = await db.select()
        .from(managerInvestorAssignments)
        .where(and(
          eq(managerInvestorAssignments.managerId, managerId),
          eq(managerInvestorAssignments.investorId, investorId),
          eq(managerInvestorAssignments.isActive, true)
        ))
        .limit(1);
      
      return assignment.length > 0;
    } catch (error) {
      console.error('Error checking manager-investor assignment:', error);
      // FAIL SECURE: Return false on any error to prevent unauthorized access
      return false;
    }
  }

  async createManagerInvestorAssignment(managerId: string, investorId: string, assignedBy: string, notes?: string): Promise<boolean> {
    try {
      // Verify the manager and investor exist and have correct roles
      const manager = await this.getAuthUser(managerId);
      const investor = await this.getAuthUser(investorId);
      
      if (!manager || manager.role !== 'manager') {
        console.error('Invalid manager for assignment:', managerId);
        return false;
      }
      
      if (!investor || investor.role !== 'investor') {
        console.error('Invalid investor for assignment:', investorId);
        return false;
      }

      // Check if assignment already exists
      const existingAssignment = await this.checkManagerInvestorAssignment(managerId, investorId);
      if (existingAssignment) {
        console.log('Assignment already exists between manager and investor');
        return true;
      }

      // Create new assignment
      await db.insert(managerInvestorAssignments).values({
        managerId,
        investorId,
        assignedBy,
        notes: notes || null,
        isActive: true
      });

      console.log(`Created manager-investor assignment: ${managerId} -> ${investorId}`);
      return true;
    } catch (error) {
      console.error('Error creating manager-investor assignment:', error);
      return false;
    }
  }

  async removeManagerInvestorAssignment(managerId: string, investorId: string): Promise<boolean> {
    try {
      const result = await db.update(managerInvestorAssignments)
        .set({ isActive: false })
        .where(and(
          eq(managerInvestorAssignments.managerId, managerId),
          eq(managerInvestorAssignments.investorId, investorId)
        ));

      return true;
    } catch (error) {
      console.error('Error removing manager-investor assignment:', error);
      return false;
    }
  }

  async getManagerAssignments(managerId: string): Promise<string[]> {
    try {
      const assignments = await db.select({ investorId: managerInvestorAssignments.investorId })
        .from(managerInvestorAssignments)
        .where(and(
          eq(managerInvestorAssignments.managerId, managerId),
          eq(managerInvestorAssignments.isActive, true)
        ));

      return assignments.map(a => a.investorId);
    } catch (error) {
      console.error('Error getting manager assignments:', error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();