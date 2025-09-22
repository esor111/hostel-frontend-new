// Discount Management Types
export enum DiscountStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  USED = 'used'
}

export enum DiscountApplication {
  LEDGER = 'ledger',
  INVOICE = 'invoice',
  PAYMENT = 'payment'
}

export enum DiscountCategory {
  ACADEMIC = 'academic',
  FINANCIAL_HARDSHIP = 'financial_hardship',
  EARLY_PAYMENT = 'early_payment',
  LOYALTY = 'loyalty',
  PROMOTIONAL = 'promotional',
  STAFF = 'staff',
  SIBLING = 'sibling'
}

export interface Discount {
  id: string;
  studentId: string;
  studentName: string;
  room: string;
  amount: number;
  reason: string;
  notes?: string;
  appliedBy: string;
  date: string | Date;
  status: DiscountStatus;
  appliedTo: DiscountApplication;
  discountType?: string;
  validFrom?: string | Date;
  validTo?: string | Date;
  isPercentage: boolean;
  percentageValue?: number;
  maxAmount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface DiscountType {
  id: string;
  name: string;
  category: DiscountCategory;
  description?: string;
  defaultAmount?: number;
  isPercentage: boolean;
  percentageValue?: number;
  maxAmount?: number;
  requiresApproval: boolean;
  autoApply: boolean;
}

export interface CreateDiscountDto {
  id?: string;
  studentId: string;
  amount: number;
  reason: string;
  notes?: string;
  appliedBy?: string;
  date?: string;
  status?: DiscountStatus;
  appliedTo?: DiscountApplication;
  discountType?: string;
  validFrom?: string;
  validTo?: string;
  isPercentage?: boolean;
  percentageValue?: number;
  maxAmount?: number;
  referenceId?: string;
}

export interface ApplyDiscountDto {
  studentId: string;
  amount: number;
  reason: string;
  notes?: string;
  appliedBy?: string;
  discountType?: string;
}

export interface UpdateDiscountDto {
  amount?: number;
  reason?: string;
  notes?: string;
  status?: DiscountStatus;
  validFrom?: string;
  validTo?: string;
}

export interface DiscountFilters {
  page?: number;
  limit?: number;
  studentId?: string;
  status?: DiscountStatus;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface DiscountStats {
  totalDiscounts: number;
  activeDiscounts: number;
  expiredDiscounts: number;
  cancelledDiscounts: number;
  totalAmount: number;
  averageDiscountAmount: number;
  studentsWithDiscounts: number;
  discountTypes: Record<string, {
    count: number;
    amount: number;
  }>;
}

export interface DiscountListResponse {
  items: Discount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApplyDiscountResponse {
  success: boolean;
  discount: Discount;
  message: string;
}