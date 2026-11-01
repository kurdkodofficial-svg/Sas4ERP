export type IntercompanyInvoiceDirection = 'EXPENSE_BUYER' | 'REVENUE_SELLER';

export type IntercompanyInvoiceStatus = 
  | 'DRAFT'
  | 'PENDING_MUTUAL_ACCEPTANCE'
  | 'MUTUALLY_CONFIRMED'
  | 'SETTLED'
  | 'CANCELLED';

export interface IntercompanyInvoice {
  id: string;
  pairId: string; // Immutable link between the expense voucher and revenue voucher
  pairCode: string; // e.g. IC-PAIR-9042
  invoiceNumber: string; // e.g. IC-EXP-1001 or IC-REV-1001
  direction: IntercompanyInvoiceDirection;
  
  // Buyer Subsidiary (Expense / Accounts Payable)
  buyerCompanyId: string;
  buyerCompanyName: string;
  buyerProjectId?: string;
  buyerProjectName?: string;

  // Seller Subsidiary (Revenue / Accounts Receivable)
  sellerCompanyId: string;
  sellerCompanyName: string;
  sellerProjectId?: string;
  sellerProjectName?: string;

  // Details
  title: string;
  titleKu?: string;
  titleAr?: string;
  description: string;
  category: 'RAW_MATERIALS' | 'LOGISTICS_TRANSPORT' | 'HEAVY_MACHINERY_RENTAL' | 'ENGINEERING_SERVICES' | 'SUB_CONTRACTING';
  
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  amountUSD: number;
  amountIQD: number;
  
  issueDate: string;
  dueDate: string;
  status: IntercompanyInvoiceStatus;
  
  // Elimination flag for financial consolidation
  eliminatedInConsolidation: boolean;
  
  // Cryptographic audit verification
  cryptoVerificationHash: string;
  settledAt?: string;
  settledBy?: string;
  referencePoNumber?: string;
  notes?: string;
}

export interface IntercompanyBilateralPair {
  pairId: string;
  pairCode: string;
  title: string;
  titleKu?: string;
  titleAr?: string;
  buyerCompanyId: string;
  buyerCompanyName: string;
  sellerCompanyId: string;
  sellerCompanyName: string;
  amountUSD: number;
  amountIQD: number;
  category: string;
  status: IntercompanyInvoiceStatus;
  issueDate: string;
  dueDate: string;
  expenseInvoice: IntercompanyInvoice;
  revenueInvoice: IntercompanyInvoice;
  cryptoVerificationHash: string;
  eliminatedInConsolidation: boolean;
}

export interface ConsolidationSummary {
  grossRevenueUSD: number;
  grossExpensesUSD: number;
  grossNetProfitUSD: number;
  
  intercompanyEliminationsUSD: number; // The amount subtracted from both to eliminate double counting
  intercompanyPairsCount: number;
  
  consolidatedRevenueUSD: number; // Gross Revenue - Eliminations
  consolidatedExpensesUSD: number; // Gross Expenses - Eliminations
  consolidatedNetProfitUSD: number; // Exactly equal to Gross Net Profit, but margins are realistic
  
  eliminationAccuracyRate: number; // 100% when balanced
  isBalanced: boolean;
}

export interface CreateBilateralInvoiceParams {
  buyerCompanyId: string;
  sellerCompanyId: string;
  buyerProjectId?: string;
  sellerProjectId?: string;
  title: string;
  titleKu?: string;
  titleAr?: string;
  description: string;
  category: 'RAW_MATERIALS' | 'LOGISTICS_TRANSPORT' | 'HEAVY_MACHINERY_RENTAL' | 'ENGINEERING_SERVICES' | 'SUB_CONTRACTING';
  quantity: number;
  unit: string;
  unitPriceUSD: number;
  dueDate?: string;
  referencePoNumber?: string;
  notes?: string;
}
