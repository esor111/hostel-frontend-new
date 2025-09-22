import { automatedBillingApiService } from './automatedBillingApiService';
import { notificationService } from './notificationService';

export interface BillingAutomationConfig {
  enabled: boolean;
  scheduleDay: number; // Day of month to generate invoices (1-28)
  dueDate: number; // Days after generation for due date
  autoSendInvoices: boolean;
  notifyOnGeneration: boolean;
  notifyOnFailure: boolean;
  retryFailedInvoices: boolean;
  maxRetries: number;
}

export interface BillingJob {
  id: string;
  month: number;
  year: number;
  scheduledDate: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  generatedInvoices: number;
  failedInvoices: number;
  totalAmount: number;
  errors: string[];
  createdAt: Date;
  completedAt?: Date;
}

export class BillingAutomationService {
  private config: BillingAutomationConfig;
  private jobs: Map<string, BillingJob> = new Map();
  private scheduledJobs: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    this.config = this.loadConfig();
    this.initializeScheduler();
  }

  private loadConfig(): BillingAutomationConfig {
    const savedConfig = localStorage.getItem('billingAutomationConfig');
    if (savedConfig) {
      return JSON.parse(savedConfig);
    }

    // Default configuration
    return {
      enabled: false,
      scheduleDay: 1, // 1st of each month
      dueDate: 10, // 10 days after generation
      autoSendInvoices: false,
      notifyOnGeneration: true,
      notifyOnFailure: true,
      retryFailedInvoices: true,
      maxRetries: 3
    };
  }

  private saveConfig(): void {
    localStorage.setItem('billingAutomationConfig', JSON.stringify(this.config));
  }

  private initializeScheduler(): void {
    if (this.config.enabled) {
      this.scheduleNextBillingJobs();
    }
  }

  /**
   * Update automation configuration
   */
  updateConfig(newConfig: Partial<BillingAutomationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();

    // Reschedule jobs if enabled status changed
    if (this.config.enabled) {
      this.scheduleNextBillingJobs();
    } else {
      this.cancelAllScheduledJobs();
    }

    console.log('🔧 Billing automation config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): BillingAutomationConfig {
    return { ...this.config };
  }

  /**
   * Schedule billing jobs for next 6 months
   */
  private scheduleNextBillingJobs(): void {
    this.cancelAllScheduledJobs();

    if (!this.config.enabled) return;

    const now = new Date();
    
    for (let i = 0; i < 6; i++) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() + i, this.config.scheduleDay);
      
      // Skip if date is in the past
      if (targetDate <= now) continue;

      const jobId = `billing-${targetDate.getFullYear()}-${targetDate.getMonth() + 1}`;
      const timeUntilExecution = targetDate.getTime() - now.getTime();

      const timeout = setTimeout(() => {
        this.executeBillingJob(targetDate.getMonth(), targetDate.getFullYear());
      }, timeUntilExecution);

      this.scheduledJobs.set(jobId, timeout);
      
      console.log(`📅 Scheduled billing job for ${targetDate.toLocaleDateString()}`);
    }
  }

  /**
   * Cancel all scheduled jobs
   */
  private cancelAllScheduledJobs(): void {
    this.scheduledJobs.forEach((timeout, jobId) => {
      clearTimeout(timeout);
      console.log(`❌ Cancelled scheduled job: ${jobId}`);
    });
    this.scheduledJobs.clear();
  }

  /**
   * Execute billing job for specific month/year
   */
  async executeBillingJob(month: number, year: number): Promise<BillingJob> {
    const jobId = `billing-${year}-${month + 1}`;
    const dueDate = new Date(year, month, this.config.scheduleDay + this.config.dueDate);

    const job: BillingJob = {
      id: jobId,
      month,
      year,
      scheduledDate: new Date(year, month, this.config.scheduleDay),
      status: 'running',
      generatedInvoices: 0,
      failedInvoices: 0,
      totalAmount: 0,
      errors: [],
      createdAt: new Date()
    };

    this.jobs.set(jobId, job);

    try {
      console.log(`🚀 Starting billing job: ${jobId}`);

      // Generate monthly invoices
      const result = await automatedBillingApiService.generateMonthlyInvoices({
        month,
        year,
        dueDate: dueDate.toISOString().split('T')[0]
      });

      job.generatedInvoices = result.generated;
      job.failedInvoices = result.failed;
      job.totalAmount = result.totalAmount;
      job.status = result.failed > 0 ? 'completed' : 'completed';
      job.completedAt = new Date();

      if (result.errors) {
        job.errors = result.errors.map(error => 
          `${error.studentName}: ${error.error}`
        );
      }

      // Send notifications
      if (this.config.notifyOnGeneration) {
        await this.sendGenerationNotification(job, result);
      }

      // Auto-send invoices if enabled
      if (this.config.autoSendInvoices && result.invoices.length > 0) {
        await this.sendInvoicesAutomatically(result.invoices);
      }

      // Retry failed invoices if enabled
      if (this.config.retryFailedInvoices && result.failed > 0) {
        await this.retryFailedInvoices(job, result.errors || []);
      }

      console.log(`✅ Billing job completed: ${jobId}`, {
        generated: job.generatedInvoices,
        failed: job.failedInvoices,
        total: job.totalAmount
      });

    } catch (error) {
      job.status = 'failed';
      job.errors.push(`Job execution failed: ${error.message}`);
      job.completedAt = new Date();

      if (this.config.notifyOnFailure) {
        await this.sendFailureNotification(job, error);
      }

      console.error(`❌ Billing job failed: ${jobId}`, error);
    }

    this.jobs.set(jobId, job);
    return job;
  }

  /**
   * Send generation notification
   */
  private async sendGenerationNotification(job: BillingJob, result: any): Promise<void> {
    const message = `
      📊 Monthly Billing Completed
      
      Month: ${new Date(job.year, job.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      Generated: ${job.generatedInvoices} invoices
      Failed: ${job.failedInvoices} invoices
      Total Amount: NPR ${job.totalAmount.toLocaleString()}
      
      ${job.errors.length > 0 ? `Errors:\n${job.errors.join('\n')}` : ''}
    `;

    await notificationService.showNotification({
      title: 'Monthly Billing Completed',
      message,
      type: job.failedInvoices > 0 ? 'warning' : 'success',
      duration: 10000
    });
  }

  /**
   * Send failure notification
   */
  private async sendFailureNotification(job: BillingJob, error: any): Promise<void> {
    const message = `
      ❌ Monthly Billing Failed
      
      Month: ${new Date(job.year, job.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
      Error: ${error.message}
      
      Please check the system and retry manually.
    `;

    await notificationService.showNotification({
      title: 'Monthly Billing Failed',
      message,
      type: 'error',
      duration: 15000
    });
  }

  /**
   * Send invoices automatically
   */
  private async sendInvoicesAutomatically(invoices: any[]): Promise<void> {
    console.log(`📧 Auto-sending ${invoices.length} invoices`);

    for (const invoice of invoices) {
      try {
        await automatedBillingApiService.sendInvoice(invoice.id);
        console.log(`✅ Invoice sent: ${invoice.invoiceNumber}`);
      } catch (error) {
        console.error(`❌ Failed to send invoice ${invoice.invoiceNumber}:`, error);
      }
    }
  }

  /**
   * Retry failed invoices
   */
  private async retryFailedInvoices(job: BillingJob, errors: any[]): Promise<void> {
    console.log(`🔄 Retrying ${errors.length} failed invoices`);

    // Implementation would depend on specific retry logic
    // For now, just log the attempt
    for (const error of errors) {
      console.log(`🔄 Would retry: ${error.studentName} - ${error.error}`);
    }
  }

  /**
   * Get all billing jobs
   */
  getBillingJobs(): BillingJob[] {
    return Array.from(this.jobs.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  /**
   * Get job by ID
   */
  getBillingJob(jobId: string): BillingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Cancel scheduled job
   */
  cancelScheduledJob(jobId: string): boolean {
    const timeout = this.scheduledJobs.get(jobId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledJobs.delete(jobId);
      console.log(`❌ Cancelled job: ${jobId}`);
      return true;
    }
    return false;
  }

  /**
   * Get next scheduled billing dates
   */
  getScheduledBillingDates(): Date[] {
    const dates: Date[] = [];
    const now = new Date();

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, this.config.scheduleDay);
      if (date > now) {
        dates.push(date);
      }
    }

    return dates;
  }

  /**
   * Manual trigger for billing job
   */
  async triggerManualBilling(month: number, year: number): Promise<BillingJob> {
    console.log(`🔧 Manual billing trigger for ${month + 1}/${year}`);
    return await this.executeBillingJob(month, year);
  }

  /**
   * Get billing automation status
   */
  getAutomationStatus(): {
    enabled: boolean;
    nextBillingDate: Date | null;
    scheduledJobs: number;
    completedJobs: number;
    failedJobs: number;
  } {
    const nextDates = this.getScheduledBillingDates();
    const jobs = this.getBillingJobs();

    return {
      enabled: this.config.enabled,
      nextBillingDate: nextDates.length > 0 ? nextDates[0] : null,
      scheduledJobs: this.scheduledJobs.size,
      completedJobs: jobs.filter(job => job.status === 'completed').length,
      failedJobs: jobs.filter(job => job.status === 'failed').length
    };
  }
}

// Export singleton instance
export const billingAutomationService = new BillingAutomationService();