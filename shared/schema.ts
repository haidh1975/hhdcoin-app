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

export const insertUserSchema = createInsertSchema(users).pick({
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

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InvestmentPackage = typeof investmentPackages.$inferSelect;
export type InsertInvestmentPackage = z.infer<typeof insertInvestmentPackageSchema>;
export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = z.infer<typeof insertCommunityMemberSchema>;
