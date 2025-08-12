import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
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
  investmentAmount: decimal("investment_amount", { precision: 15, scale: 2 }).notNull(),
  bitcoinCode: text("bitcoin_code").notNull(),
  investmentDate: timestamp("investment_date").defaultNow(),
  currentValue: decimal("current_value", { precision: 15, scale: 2 }),
  profitLoss: decimal("profit_loss", { precision: 15, scale: 2 }),
  profitLossPercentage: decimal("profit_loss_percentage", { precision: 5, scale: 2 }),
  status: text("status").notNull().default("active"), // active, inactive, completed
  packageId: varchar("package_id").references(() => investmentPackages.id),
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
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type InvestmentPackage = typeof investmentPackages.$inferSelect;
export type InsertInvestmentPackage = z.infer<typeof insertInvestmentPackageSchema>;
export type Investor = typeof investors.$inferSelect;
export type InsertInvestor = z.infer<typeof insertInvestorSchema>;
