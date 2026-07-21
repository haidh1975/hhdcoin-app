CREATE TABLE "auth_users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'investor' NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"email" varchar(100),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "auth_users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "community_members" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"avatar" text,
	"bio" text,
	"interests" text[],
	"experience_level" text DEFAULT 'beginner' NOT NULL,
	"investment_focus" text[],
	"join_date" timestamp DEFAULT now(),
	"last_active" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"social_links" text[],
	"location" text,
	"occupation" text,
	"total_investment" numeric(15, 0),
	"member_level" text DEFAULT 'Bronze' NOT NULL,
	"points" integer DEFAULT 0,
	CONSTRAINT "community_members_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investment_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_investment_id" varchar NOT NULL,
	"bitcoin_price" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2) NOT NULL,
	"profit_loss" numeric(15, 2) NOT NULL,
	"profit_loss_percentage" numeric(5, 2) NOT NULL,
	"recorded_at" timestamp DEFAULT now(),
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "investment_packages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"min_investment" numeric(15, 0) NOT NULL,
	"min_rate" numeric(5, 2) NOT NULL,
	"max_rate" numeric(5, 2) NOT NULL,
	"features" text[] NOT NULL,
	"recommended" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "investment_summary" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"total_invested" numeric(15, 2) DEFAULT '0' NOT NULL,
	"current_value" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_profit_loss" numeric(15, 2) DEFAULT '0' NOT NULL,
	"total_profit_loss_percentage" numeric(5, 2) DEFAULT '0' NOT NULL,
	"best_performance" numeric(5, 2) DEFAULT '0',
	"worst_performance" numeric(5, 2) DEFAULT '0',
	"average_return" numeric(5, 2) DEFAULT '0',
	"total_transactions" integer DEFAULT 0,
	"active_investments" integer DEFAULT 0,
	"last_calculated" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "investors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"facebook_url" text,
	"zalo_phone" text,
	"investment_amount" numeric(15, 2) NOT NULL,
	"bitcoin_code" text NOT NULL,
	"investment_date" timestamp DEFAULT now(),
	"current_value" numeric(15, 2),
	"profit_loss" numeric(15, 2),
	"profit_loss_percentage" numeric(5, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"package_id" varchar
);
--> statement-breakpoint
CREATE TABLE "manager_investor_assignments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"manager_id" varchar NOT NULL,
	"investor_id" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"assigned_by" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "payment_transactions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"package_id" varchar NOT NULL,
	"amount" numeric(15, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'VND' NOT NULL,
	"stripe_payment_intent_id" text,
	"stripe_customer_id" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_method" varchar(50) DEFAULT 'stripe' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"completed_at" timestamp,
	"metadata" text,
	CONSTRAINT "payment_transactions_stripe_payment_intent_id_unique" UNIQUE("stripe_payment_intent_id")
);
--> statement-breakpoint
CREATE TABLE "user_investments" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"package_id" varchar NOT NULL,
	"transaction_id" varchar NOT NULL,
	"investment_amount" numeric(15, 2) NOT NULL,
	"entry_price" numeric(15, 2) NOT NULL,
	"current_value" numeric(15, 2),
	"profit_loss" numeric(15, 2),
	"profit_loss_percentage" numeric(5, 2),
	"bitcoin_code" text NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"last_updated" timestamp DEFAULT now(),
	"metadata" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "investment_history" ADD CONSTRAINT "investment_history_user_investment_id_user_investments_id_fk" FOREIGN KEY ("user_investment_id") REFERENCES "public"."user_investments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investment_summary" ADD CONSTRAINT "investment_summary_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investors" ADD CONSTRAINT "investors_package_id_investment_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."investment_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_investor_assignments" ADD CONSTRAINT "manager_investor_assignments_manager_id_auth_users_id_fk" FOREIGN KEY ("manager_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_investor_assignments" ADD CONSTRAINT "manager_investor_assignments_investor_id_auth_users_id_fk" FOREIGN KEY ("investor_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "manager_investor_assignments" ADD CONSTRAINT "manager_investor_assignments_assigned_by_auth_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_package_id_investment_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."investment_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_user_id_auth_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_package_id_investment_packages_id_fk" FOREIGN KEY ("package_id") REFERENCES "public"."investment_packages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_investments" ADD CONSTRAINT "user_investments_transaction_id_payment_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."payment_transactions"("id") ON DELETE no action ON UPDATE no action;