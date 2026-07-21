CREATE TABLE "assets" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"symbol" varchar(20) NOT NULL,
	"name" text NOT NULL,
	"type" varchar(20) DEFAULT 'crypto' NOT NULL,
	"coingecko_id" varchar(100),
	"current_price" numeric(18, 4),
	"change_24h" numeric(8, 2),
	"price_source" varchar(30),
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"last_price_update" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "assets_symbol_unique" UNIQUE("symbol")
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" varchar,
	"actor_username" varchar(50),
	"actor_role" varchar(20),
	"action" varchar(50) NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"entity_id" varchar,
	"details" text,
	"ip_address" varchar(45),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_investments" ADD COLUMN "asset_symbol" varchar(20) DEFAULT 'BTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_id_auth_users_id_fk" FOREIGN KEY ("actor_id") REFERENCES "public"."auth_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_assets_type" ON "assets" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_assets_active" ON "assets" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_audit_actor" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "idx_audit_action" ON "audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_audit_created" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_inv_history_investment" ON "investment_history" USING btree ("user_investment_id");--> statement-breakpoint
CREATE INDEX "idx_inv_history_recorded" ON "investment_history" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "idx_payment_tx_user" ON "payment_transactions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_payment_tx_status" ON "payment_transactions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_inv_user" ON "user_investments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_user_inv_status" ON "user_investments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_user_inv_asset" ON "user_investments" USING btree ("asset_symbol");