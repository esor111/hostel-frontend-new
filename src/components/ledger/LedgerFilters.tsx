import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker, DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Calendar, Filter, X, RotateCcw } from "lucide-react";
import { subDays, subWeeks, subMonths, startOfMonth, endOfMonth, format } from "date-fns";

export interface LedgerFilterOptions {
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  month?: Date;
  preset?: 'lastWeek' | 'last2Weeks' | 'lastMonth' | 'last3Months' | 'custom';
  entryType?: string;
  studentId?: string;
}

interface LedgerFiltersProps {
  filters: LedgerFilterOptions;
  onFiltersChange: (filters: LedgerFilterOptions) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  loading?: boolean;
  className?: string;
}

const PRESET_OPTIONS = [
  { value: 'lastWeek', label: 'Last Week', days: 7 },
  { value: 'last2Weeks', label: 'Last 2 Weeks', days: 14 },
  { value: 'lastMonth', label: 'Last Month', days: 30 },
  { value: 'last3Months', label: 'Last 3 Months', days: 90 },
  { value: 'custom', label: 'Custom Range', days: 0 },
] as const;

const ENTRY_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'Invoice', label: 'Invoices' },
  { value: 'Payment', label: 'Payments' },
  { value: 'Discount', label: 'Discounts' },
  { value: 'Adjustment', label: 'Adjustments' },
  { value: 'Refund', label: 'Refunds' },
  { value: 'Penalty', label: 'Penalties' },
];

export const LedgerFilters = ({
  filters,
  onFiltersChange,
  onApplyFilters,
  onClearFilters,
  loading = false,
  className = "",
}: LedgerFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<LedgerFilterOptions>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handlePresetChange = (preset: string) => {
    const now = new Date();
    let from: Date | undefined;
    let to: Date | undefined = now;

    switch (preset) {
      case 'lastWeek':
        from = subDays(now, 7);
        break;
      case 'last2Weeks':
        from = subDays(now, 14);
        break;
      case 'lastMonth':
        from = subDays(now, 30);
        break;
      case 'last3Months':
        from = subDays(now, 90);
        break;
      case 'custom':
        // Keep existing dates or clear them
        from = localFilters.dateRange?.from;
        to = localFilters.dateRange?.to;
        break;
      default:
        from = undefined;
        to = undefined;
    }

    const newFilters = {
      ...localFilters,
      preset: preset as LedgerFilterOptions['preset'],
      dateRange: { from, to },
      month: undefined, // Clear month when using date range
    };

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDateRangeChange = (from: Date | undefined, to: Date | undefined) => {
    const newFilters = {
      ...localFilters,
      dateRange: { from, to },
      preset: 'custom',
      month: undefined, // Clear month when using date range
    };

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleMonthChange = (month: Date | undefined) => {
    const newFilters = {
      ...localFilters,
      month,
      dateRange: undefined, // Clear date range when using month
      preset: undefined,
    };

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleEntryTypeChange = (entryType: string) => {
    const newFilters = {
      ...localFilters,
      entryType: entryType === 'all' ? undefined : entryType,
    };

    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: LedgerFilterOptions = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
    onClearFilters();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.dateRange?.from || localFilters.month) count++;
    if (localFilters.entryType) count++;
    if (localFilters.preset && localFilters.preset !== 'custom') count++;
    return count;
  };

  const getFilterSummary = () => {
    const parts: string[] = [];
    
    if (localFilters.preset && localFilters.preset !== 'custom') {
      const preset = PRESET_OPTIONS.find(p => p.value === localFilters.preset);
      if (preset) parts.push(preset.label);
    } else if (localFilters.dateRange?.from && localFilters.dateRange?.to) {
      parts.push(`${format(localFilters.dateRange.from, 'MMM dd')} - ${format(localFilters.dateRange.to, 'MMM dd')}`);
    } else if (localFilters.month) {
      parts.push(format(localFilters.month, 'MMMM yyyy'));
    }
    
    if (localFilters.entryType) {
      const entryType = ENTRY_TYPE_OPTIONS.find(e => e.value === localFilters.entryType);
      if (entryType) parts.push(entryType.label);
    }
    
    return parts.join(' • ');
  };

  const activeFiltersCount = getActiveFiltersCount();
  const filterSummary = getFilterSummary();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Ledger Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
        {filterSummary && !isExpanded && (
          <div className="text-sm text-muted-foreground mt-2">
            Active filters: {filterSummary}
          </div>
        )}
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Quick Preset Filters */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Filters</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_OPTIONS.map((preset) => (
                <Button
                  key={preset.value}
                  variant={localFilters.preset === preset.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(preset.value)}
                  disabled={loading}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Date Range */}
          {localFilters.preset === 'custom' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Custom Date Range</label>
              <DateRangePicker
                from={localFilters.dateRange?.from}
                to={localFilters.dateRange?.to}
                onDateRangeChange={handleDateRangeChange}
                placeholder="Select date range"
                disabled={loading}
              />
            </div>
          )}

          {/* Month Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Or Select Specific Month</label>
            <DatePicker
              date={localFilters.month}
              onDateChange={handleMonthChange}
              placeholder="Select month"
              disabled={loading}
              className="w-full"
            />
            {localFilters.month && (
              <div className="text-xs text-muted-foreground">
                Will show entries from {format(startOfMonth(localFilters.month), 'MMM dd')} to {format(endOfMonth(localFilters.month), 'MMM dd, yyyy')}
              </div>
            )}
          </div>

          {/* Entry Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Entry Type</label>
            <Select
              value={localFilters.entryType || 'all'}
              onValueChange={handleEntryTypeChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by entry type" />
              </SelectTrigger>
              <SelectContent>
                {ENTRY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Apply Filters Button */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={loading || activeFiltersCount === 0}
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            <Button
              onClick={onApplyFilters}
              disabled={loading}
              className="min-w-[100px]"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Applying...
                </div>
              ) : (
                <>
                  <Filter className="h-4 w-4 mr-1" />
                  Apply Filters
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};