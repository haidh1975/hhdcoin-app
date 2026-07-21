import { storage } from './storage';
import { bitcoinPriceService } from './bitcoin-price-service';
import type { UserInvestment, InvestmentHistory, InvestmentSummary } from '@shared/schema';

export class PnLSchedulerService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private lastHistoryWrite = 0;
  private readonly CALCULATION_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  private readonly HISTORY_WRITE_INTERVAL_MS = 60 * 60 * 1000; // ghi history 1 lần/giờ — chống phình DB
  private readonly BATCH_SIZE = 50; // Process investments in batches to avoid overwhelming DB

  constructor() {
    console.log('[PnL Scheduler] Service initialized');
  }

  /**
   * Start the automatic P&L calculation scheduler
   */
  public start(): void {
    if (this.isRunning) {
      console.log('[PnL Scheduler] Already running');
      return;
    }

    console.log(`[PnL Scheduler] Starting with ${this.CALCULATION_INTERVAL_MS / 1000}s interval`);
    this.isRunning = true;

    // Run immediately on start
    this.calculateAllPnL().catch(error => {
      console.error('[PnL Scheduler] Error in initial calculation:', error);
    });

    // Then run periodically
    this.intervalId = setInterval(() => {
      this.calculateAllPnL().catch(error => {
        console.error('[PnL Scheduler] Error in scheduled calculation:', error);
      });
    }, this.CALCULATION_INTERVAL_MS);
  }

  /**
   * Stop the scheduler
   */
  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('[PnL Scheduler] Stopped');
  }

  /**
   * Check if the scheduler is running
   */
  public getStatus(): { isRunning: boolean; intervalMs: number } {
    return {
      isRunning: this.isRunning,
      intervalMs: this.CALCULATION_INTERVAL_MS
    };
  }

  /**
   * Main P&L calculation logic - calculates for all active investments
   */
  private async calculateAllPnL(): Promise<void> {
    const startTime = Date.now();
    console.log('[PnL Scheduler] Starting P&L calculation cycle...');

    try {
      // Get current Bitcoin price
      const priceData = await bitcoinPriceService.getCurrentPrice(false);
      const currentBitcoinPrice = priceData.price;
      
      console.log(`[PnL Scheduler] Current Bitcoin price: $${currentBitcoinPrice.toLocaleString()}`);

      // Get all active user investments
      const allInvestments = await storage.getUserInvestments();
      const activeInvestments = allInvestments.filter(inv => inv.status === 'active');

      console.log(`[PnL Scheduler] Processing ${activeInvestments.length} active investments`);

      if (activeInvestments.length === 0) {
        console.log('[PnL Scheduler] No active investments to process');
        return;
      }

      // Ghi history tối đa 1 lần/giờ — PnL vẫn cập nhật mỗi 5 phút
      const shouldWriteHistory = Date.now() - this.lastHistoryWrite >= this.HISTORY_WRITE_INTERVAL_MS;
      if (shouldWriteHistory) {
        this.lastHistoryWrite = Date.now();
      }

      // Process investments in batches to avoid overwhelming the database
      const batches = this.createBatches(activeInvestments, this.BATCH_SIZE);
      let processedCount = 0;
      let updatedCount = 0;

      for (const batch of batches) {
        const batchResults = await Promise.allSettled(
          batch.map(investment => this.calculateSingleInvestmentPnL(investment, currentBitcoinPrice, shouldWriteHistory))
        );

        // Count successful updates
        batchResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            updatedCount++;
          }
        });

        processedCount += batch.length;
        console.log(`[PnL Scheduler] Processed batch: ${processedCount}/${activeInvestments.length} investments`);
      }

      // Update investment summaries by user
      await this.updateInvestmentSummaries();

      const duration = Date.now() - startTime;
      console.log(`[PnL Scheduler] Completed cycle in ${duration}ms. Updated ${updatedCount}/${activeInvestments.length} investments`);

    } catch (error) {
      console.error('[PnL Scheduler] Error in P&L calculation cycle:', error);
      throw error;
    }
  }

  /**
   * Calculate P&L for a single investment
   */
  private async calculateSingleInvestmentPnL(
    investment: UserInvestment,
    currentBitcoinPrice: number,
    writeHistory: boolean = true
  ): Promise<boolean> {
    try {
      const investmentAmount = parseFloat(investment.investmentAmount.toString());
      const entryPrice = parseFloat(investment.entryPrice?.toString() || '0');
      
      // Skip calculation if no entry price available (shouldn't happen for new investments)
      if (entryPrice <= 0) {
        console.warn(`[PnL Scheduler] Investment ${investment.id} has invalid entry price: ${entryPrice}`);
        return false;
      }
      
      // Calculate current value based on actual Bitcoin price movement from entry
      // Formula: currentValue = investmentAmount * (currentPrice / entryPrice)
      // This tracks the actual Bitcoin performance since the investment was made
      const priceRatio = currentBitcoinPrice / entryPrice;
      const currentValue = investmentAmount * priceRatio;
      
      // Calculate profit/loss
      const profitLoss = currentValue - investmentAmount;
      const profitLossPercentage = (profitLoss / investmentAmount) * 100;

      // Update the investment record
      const updateResult = await storage.updateUserInvestment(investment.id, {
        currentValue: currentValue.toFixed(2),
        profitLoss: profitLoss.toFixed(2),
        profitLossPercentage: profitLossPercentage.toFixed(2),
        lastUpdated: new Date()
      });

      if (!updateResult) {
        console.error(`[PnL Scheduler] Failed to update investment ${investment.id}`);
        return false;
      }

      // Ghi history theo throttle (mặc định 1 lần/giờ) — chống phình DB
      if (writeHistory) {
        await storage.createInvestmentHistory({
          userInvestmentId: investment.id,
          bitcoinPrice: currentBitcoinPrice.toFixed(2),
          currentValue: currentValue.toFixed(2),
          profitLoss: profitLoss.toFixed(2),
          profitLossPercentage: profitLossPercentage.toFixed(2),
          metadata: JSON.stringify({
            calculationTime: new Date().toISOString(),
            originalInvestment: investmentAmount,
            entryPrice: entryPrice,
            priceRatio: priceRatio,
            priceSource: 'bitcoinPriceService'
          })
        });
      }

      return true;

    } catch (error) {
      console.error(`[PnL Scheduler] Error calculating P&L for investment ${investment.id}:`, error);
      return false;
    }
  }

  /**
   * Update investment summaries for all users who have active investments
   */
  private async updateInvestmentSummaries(): Promise<void> {
    try {
      console.log('[PnL Scheduler] Updating investment summaries...');

      // Get all users with investments
      const allInvestments = await storage.getUserInvestments();
      const userIds = Array.from(new Set(allInvestments.map(inv => inv.userId)));

      for (const userId of userIds) {
        await this.updateUserInvestmentSummary(userId);
      }

      console.log(`[PnL Scheduler] Updated summaries for ${userIds.length} users`);
    } catch (error) {
      console.error('[PnL Scheduler] Error updating investment summaries:', error);
    }
  }

  /**
   * Update investment summary for a specific user
   */
  private async updateUserInvestmentSummary(userId: string): Promise<void> {
    try {
      const userInvestments = await storage.getUserInvestmentsByUserId(userId);
      const activeInvestments = userInvestments.filter(inv => inv.status === 'active');

      if (activeInvestments.length === 0) {
        return;
      }

      // Calculate totals
      const totalInvested = activeInvestments.reduce((sum, inv) => {
        return sum + parseFloat(inv.investmentAmount.toString());
      }, 0);

      const currentValue = activeInvestments.reduce((sum, inv) => {
        return sum + parseFloat(inv.currentValue?.toString() || '0');
      }, 0);

      const totalProfitLoss = currentValue - totalInvested;
      const totalProfitLossPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

      // Calculate performance metrics
      const performanceValues = activeInvestments.map(inv => {
        const pnlPercent = parseFloat(inv.profitLossPercentage?.toString() || '0');
        return pnlPercent;
      });

      const bestPerformance = Math.max(...performanceValues, 0);
      const worstPerformance = Math.min(...performanceValues, 0);
      const averageReturn = performanceValues.length > 0 
        ? performanceValues.reduce((sum, val) => sum + val, 0) / performanceValues.length 
        : 0;

      // Update or create summary
      const existingSummary = await storage.getInvestmentSummary(userId);
      
      if (existingSummary) {
        await storage.updateInvestmentSummary(userId, {
          totalInvested: totalInvested.toFixed(2),
          currentValue: currentValue.toFixed(2),
          totalProfitLoss: totalProfitLoss.toFixed(2),
          totalProfitLossPercentage: totalProfitLossPercentage.toFixed(2),
          bestPerformance: bestPerformance.toFixed(2),
          worstPerformance: worstPerformance.toFixed(2),
          averageReturn: averageReturn.toFixed(2),
          activeInvestments: activeInvestments.length,
          lastCalculated: new Date()
        });
      } else {
        await storage.createInvestmentSummary({
          userId,
          totalInvested: totalInvested.toFixed(2),
          currentValue: currentValue.toFixed(2),
          totalProfitLoss: totalProfitLoss.toFixed(2),
          totalProfitLossPercentage: totalProfitLossPercentage.toFixed(2),
          bestPerformance: bestPerformance.toFixed(2),
          worstPerformance: worstPerformance.toFixed(2),
          averageReturn: averageReturn.toFixed(2),
          totalTransactions: activeInvestments.length,
          activeInvestments: activeInvestments.length
        });
      }

    } catch (error) {
      console.error(`[PnL Scheduler] Error updating summary for user ${userId}:`, error);
    }
  }

  /**
   * Utility function to create batches from an array
   */
  private createBatches<T>(array: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < array.length; i += batchSize) {
      batches.push(array.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Manual trigger for P&L calculation (for testing or admin use)
   */
  public async triggerCalculation(): Promise<void> {
    console.log('[PnL Scheduler] Manual calculation triggered');
    await this.calculateAllPnL();
  }
}

// Export singleton instance
export const pnlScheduler = new PnLSchedulerService();