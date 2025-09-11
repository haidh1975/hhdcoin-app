import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const investmentPackages = pgTable("investment_packages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  minInvestment: decimal("min_investment", { precision: 15, scale: 0 }).notNull(),
  minRate: decimal("min_rate", { precision: 5, scale: 2 }).notNull(),
  maxRate: decimal("max_rate", { precision: 5, scale: 2 }).notNull(),
  features: text("features").array().notNull(),
  recommended: integer("recommended").default(0),
});

export const investors = pgTable("investors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  facebookUrl: text("facebook_url"),
  zaloPhone: text("zalo_phone"),
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }).notNull(),
  bitcoinCode: text("bitcoin_code").notNull(),
  investmentDate: timestamp("investment_date").defaultNow(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  profitLoss: decimal("profit_loss", { precision: 15, scale: 2 }),
  profitLossPercentage: decimal("profit_loss_percentage", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("active"), // active, inactive, completed
  packageId: varchar("package_id").references(() => investmentPackages.id),
});

export const communityMembers = pgTable("community_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  interests: text("interests").array(),
  experienceLevel: text("experience_level").notNull().default("beginner"), // beginner, intermediate, advanced, expert
  investmentFocus: text("investment_focus").array(), // Bitcoin, Ethereum, DeFi, NFT, etc.
  joinDate: timestamp("join_date").defaultNow(),
  lastActive: timestamp("last_active").defaultNow(),
  isActive: boolean("is_active").default(true),
  socialLinks: text("social_links").array(),
  location: text("location"),
  occupation: text("occupation"),
  totalInvestment: decimal("total_investment", { precision: 15, scale: 0 }),
  memberLevel: text("member_level").notNull().default("Bronze"), // Bronze, Silver, Gold, Diamond
  points: integer("points").default(0),
});

// Payment Transactions Table
export const paymentTransactions = pgTable("payment_transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => authUsers.id).notNull(),
  packageId: varchar("package_id").references(() => investmentPackages.id).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull().default("VND"),
  stripePaymentIntentId: text("stripe_payment_intent_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  status: varchar("status", { length: 20 }).notNull().default("pending"), // pending, completed, failed, refunded
  paymentMethod: varchar("payment_method", { length: 50 }).notNull().default("stripe"), // stripe, crypto, bank_transfer
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  metadata: text("metadata"), // JSON string for additional data
});

export const insertRealtUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
});

export const insertInvestmentPackageSchema = createInsertSchema(investmentPackages).omit({
  id: true,
});

export const insertInvestorSchema = createInsertSchema(investors).omit({
  id: true,
  investmentDate: true,
  currentValue: true,
  profitLoss: true,
  profitLossPercentage: true,
  packageId: true,
}).extend({
  facebookUrl: z.string().optional().or(z.literal("")),
  zaloPhone: z.string().optional().or(z.literal("")),
});

export const insertCommunityMemberSchema = createInsertSchema(communityMembers).omit({
  id: true,
  joinDate: true,
  lastActive: true,
});

export const insertPaymentTransactionSchema = createInsertSchema(paymentTransactions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

// User Investments Table - Links users to their investment packages
export const userInvestments = pgTable("user_investments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => authUsers.id).notNull(),
  packageId: varchar("package_id").references(() => investmentPackages.id).notNull(),
  transactionId: varchar("transaction_id").references(() => paymentTransactions.id).notNull(),
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  profitLoss: decimal("profit_loss", { precision: 15, scale: 2 }),
  profitLossPercentage: decimal("profit_loss_percentage", { precision: 5, scale: 2 }),
  bitcoinCode: text("bitcoin_code").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, completed, cancelled
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  metadata: text("metadata"), // JSON string for additional data
});

export const insertUserInvestmentSchema = createInsertSchema(userInvestments).omit({
  id: true,
  startDate: true,
  lastUpdated: true,
});

// User Management Table for Auth System
export const authUsers = pgTable("auth_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: varchar("role", { length: 20 }).notNull().default("investor"), // admin, manager, investor
  fullName: varchar("full_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  status: varchar("status", { length: 20 }).notNull().default("active"), // active, inactive
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertAuthUserSchema = createInsertSchema(authUsers).omit({
  id: true,
  lastLogin: true,
  createdAt: true,
  updatedAt: true,
});

export type AuthUser = typeof authUsers.$inferSelect;
export type InsertAuthUser = z.infer<typeof insertAuthUserSchema>;
export type InsertUser = z.infer<typeof insertRealtUserSchema>;
export type User = typeof users.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InvestmentPackage = typeof investmentPackages.$inferSelect;
export type InsertInvestmentPackage = z.infer<typeof insertInvestmentPackageSchema>;
export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;
export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = z.infer<typeof insertPaymentTransactionSchema>;
export type UserInvestment = typeof userInvestments.$inferSelect;
export type InsertUserInvestment = z.infer<typeof insertUserInvestmentSchema>;

// Investment History for P&L tracking
export const investmentHistory = pgTable("investment_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userInvestmentId: varchar("user_investment_id").references(() => userInvestments.id).notNull(),
  bitcoinPrice: decimal("bitcoin_price", { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull(),
  profitLoss: decimal("profit_loss", { precision: 15, scale: 2 }).notNull(),
  profitLossPercentage: decimal("profit_loss_percentage", { precision: 5, scale: 2 }).notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
  metadata: text("metadata"), // JSON for additional tracking data
});

export const insertInvestmentHistorySchema = createInsertSchema(investmentHistory).omit({
  id: true,
  recordedAt: true,
});

export type InvestmentHistory = typeof investmentHistory.$inferSelect;
export type InsertInvestmentHistory = z.infer<typeof insertInvestmentHistorySchema>;

// Investment Performance Summary
export const investmentSummary = pgTable("investment_summary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => authUsers.id).notNull(),
  totalInvested: decimal("total_invested", { precision: 15, scale: 2 }).notNull().default("0"),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }).notNull().default("0"),
  totalProfitLoss: decimal("total_profit_loss", { precision: 15, scale: 2 }).notNull().default("0"),
  totalProfitLossPercentage: decimal("total_profit_loss_percentage", { precision: 5, scale: 2 }).notNull().default("0"),
  bestPerformance: decimal("best_performance", { precision: 5, scale: 2 }).default("0"),
  worstPerformance: decimal("worst_performance", { precision: 5, scale: 2 }).default("0"),
  averageReturn: decimal("average_return", { precision: 5, scale: 2 }).default("0"),
  totalTransactions: integer("total_transactions").default(0),
  activeInvestments: integer("active_investments").default(0),
  lastCalculated: timestamp("last_calculated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertInvestmentSummarySchema = createInsertSchema(investmentSummary).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastCalculated: true,
});

export type InvestmentSummary = typeof investmentSummary.$inferSelect;
export type InsertInvestmentSummary = z.infer<typeof insertInvestmentSummarySchema>;
