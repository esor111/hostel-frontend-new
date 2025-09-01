import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Bell,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { automatedBillingApiService, BillingStats } from '../../services/automatedBillingApiService';
import { billingAutomationService, BillingJob, BillingAutomationConfig } from '../../services/billingAutomationService';
import { notificationService } from '../../services/notificationService';

interface BillingDashboardProps {
  className?: string;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({ className = '' }) => {
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [automationConfig, setAutomationConfig] = useState<BillingAutomationConfig | null>(null);
  const [billingJobs, setBillingJobs] = useState<BillingJob[]>([]);
  const [studentsReady, setStudentsReady] = useState<any[]>([]);
  const [overdueInvoices, setOverdueInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'automation' | 'history' | 'settings'>('overview');

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [stats, students, overdue, config, jobs] = await Promise.all([
        automatedBillingApiService.getBillingStats(),
        automatedBillingApiService.getStudentsReadyForBilling(),
        automatedBillingApiService.getOverdueInvoices(),
        Promise.resolve(billingAutomationService.getConfig()),
        Promise.resolve(billingAutomationService.getBillingJobs())
      ]);

      setBillingStats(stats);
      setStudentsReady(students);
      setOverdueInvoices(overdue);
      setAutomationConfig(config);
      setBillingJobs(jobs);
    } catch (error) {
      console.error('Failed to load billing dashboard data:', error);
      notificationService.showError('Dashboard Error', 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMonthlyInvoices = async () => {
    const currentDate = new Date();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const dueDate = new Date(year, month, 15); // 15th of current month

    try {
      setLoading(true);
      const result = await automatedBillingApiService.generateMonthlyInvoices({
        month,
        year,
        dueDate: dueDate.toISOString().split('T')[0]
      });

      if (result.success) {
        notificationService.showSuccess(
          'Invoices Generated',
          `Successfully generated ${result.generated} invoices totaling NPR ${result.totalAmount.toLocaleString()}`
        );
        loadDashboardData();
      } else {
        notificationService.showWarning(
          'Partial Success',
          `Generated ${result.generated} invoices, ${result.failed} failed`
        );
      }
    } catch (error) {
      notificationService.showError('Generation Failed', 'Failed to generate monthly invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAutomation = () => {
    if (automationConfig) {
      const newConfig = { ...automationConfig, enabled: !automationConfig.enabled };
      billingAutomationService.updateConfig(newConfig);
      setAutomationConfig(newConfig);
      
      notificationService.showInfo(
        'Automation Updated',
        `Billing automation ${newConfig.enabled ? 'enabled' : 'disabled'}`
      );
    }
  };

  const handleUpdateAutomationConfig = (updates: Partial<BillingAutomationConfig>) => {
    if (automationConfig) {
      const newConfig = { ...automationConfig, ...updates };
      billingAutomationService.updateConfig(newConfig);
      setAutomationConfig(newConfig);
      
      notificationService.showSuccess('Settings Updated', 'Automation configuration saved');
    }
  };

  const formatCurrency = (amount: number) => `NPR ${amount.toLocaleString()}`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !billingStats) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-lg">Loading billing dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Dashboard</h1>
          <p className="text-gray-600">Automated billing management and monitoring</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleGenerateMonthlyInvoices}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoices
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {billingStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Configured Students</p>
                <p className="text-2xl font-bold text-gray-900">{billingStats.configuredStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(billingStats.currentMonthAmount)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Month Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{billingStats.currentMonthInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{billingStats.paidInvoices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{billingStats.overdueInvoices}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'automation', label: 'Automation', icon: Settings },
            { id: 'history', label: 'History', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Students Ready for Billing */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Students Ready for Billing</h3>
            <div className="space-y-3">
              {studentsReady.length > 0 ? (
                studentsReady.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-600">{student.activeCharges} active charges</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{formatCurrency(student.monthlyTotal)}</p>
                      <p className="text-sm text-gray-600">monthly</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No students ready for billing</p>
              )}
            </div>
          </div>

          {/* Overdue Invoices */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Overdue Invoices</h3>
            <div className="space-y-3">
              {overdueInvoices.length > 0 ? (
                overdueInvoices.slice(0, 5).map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{invoice.studentName}</p>
                      <p className="text-sm text-red-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600">{formatCurrency(parseFloat(invoice.total))}</p>
                      <p className="text-sm text-gray-600">{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No overdue invoices</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'automation' && automationConfig && (
        <div className="space-y-6">
          {/* Automation Status */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Automation Status</h3>
              <button
                onClick={handleToggleAutomation}
                className={`flex items-center px-4 py-2 rounded-lg font-medium ${
                  automationConfig.enabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {automationConfig.enabled ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    Disable
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Enable
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  automationConfig.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {automationConfig.enabled ? 'Active' : 'Inactive'}
                </div>
                <p className="text-sm text-gray-600 mt-1">Status</p>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{automationConfig.scheduleDay}</p>
                <p className="text-sm text-gray-600">Schedule Day</p>
              </div>

              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">{automationConfig.dueDate} days</p>
                <p className="text-sm text-gray-600">Due Date Offset</p>
              </div>
            </div>

            {automationConfig.enabled && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <p className="text-sm text-blue-800">
                    Next billing: {billingAutomationService.getScheduledBillingDates()[0]?.toLocaleDateString() || 'Not scheduled'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Billing Jobs</h3>
            <div className="space-y-3">
              {billingJobs.slice(0, 5).map(job => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                      <span className="ml-3 font-medium text-gray-900">
                        {new Date(job.year, job.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Generated: {job.generatedInvoices} | Failed: {job.failedInvoices} | Total: {formatCurrency(job.totalAmount)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{job.createdAt.toLocaleDateString()}</p>
                    {job.completedAt && (
                      <p className="text-xs text-gray-500">Completed: {job.completedAt.toLocaleTimeString()}</p>
                    )}
                  </div>
                </div>
              ))}
              {billingJobs.length === 0 && (
                <p className="text-gray-500 text-center py-4">No billing jobs found</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && automationConfig && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Automation Settings</h3>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule Day (1-28)
                </label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={automationConfig.scheduleDay}
                  onChange={(e) => handleUpdateAutomationConfig({ scheduleDay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Day of month to generate invoices</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date Offset (days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={automationConfig.dueDate}
                  onChange={(e) => handleUpdateAutomationConfig({ dueDate: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Days after generation for due date</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoSendInvoices"
                  checked={automationConfig.autoSendInvoices}
                  onChange={(e) => handleUpdateAutomationConfig({ autoSendInvoices: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoSendInvoices" className="ml-2 block text-sm text-gray-900">
                  Automatically send invoices to students
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyOnGeneration"
                  checked={automationConfig.notifyOnGeneration}
                  onChange={(e) => handleUpdateAutomationConfig({ notifyOnGeneration: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyOnGeneration" className="ml-2 block text-sm text-gray-900">
                  Notify on successful invoice generation
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyOnFailure"
                  checked={automationConfig.notifyOnFailure}
                  onChange={(e) => handleUpdateAutomationConfig({ notifyOnFailure: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyOnFailure" className="ml-2 block text-sm text-gray-900">
                  Notify on billing failures
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="retryFailedInvoices"
                  checked={automationConfig.retryFailedInvoices}
                  onChange={(e) => handleUpdateAutomationConfig({ retryFailedInvoices: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="retryFailedInvoices" className="ml-2 block text-sm text-gray-900">
                  Automatically retry failed invoices
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};