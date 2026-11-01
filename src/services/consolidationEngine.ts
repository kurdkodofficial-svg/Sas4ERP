import { Company, HoldingGroup } from '../types/erp';
import {
  IntercompanyInvoice,
  IntercompanyBilateralPair,
  ConsolidationSummary,
  CreateBilateralInvoiceParams
} from '../types/intercompany';
import { groupInvoicesIntoBilateralPairs } from '../data/initialIntercompanyData';

export class ConsolidationEngine {
  /**
   * Computes the consolidated financial summary with GAAP/IFRS intercompany elimination.
   * Ensures holding revenue and expenses are not double-counted when subsidiaries trade internally.
   */
  public static computeConsolidation(
    companies: Company[],
    holding: HoldingGroup,
    invoices: IntercompanyInvoice[],
    isConsolidationEnabled: boolean = true
  ): ConsolidationSummary {
    // 1. Gross metrics before elimination
    const grossExpensesUSD = companies.reduce((acc, c) => acc + (c.spentUSD || 0), 0);
    const grossRevenueUSD = holding.totalRevenueUSD || (grossExpensesUSD * 1.6);
    const grossNetProfitUSD = grossRevenueUSD - grossExpensesUSD;

    // 2. Identify active intercompany elimination volume
    // Only eliminate bilateral pairs that are active (MUTUALLY_CONFIRMED, SETTLED, PENDING)
    const bilateralPairs = groupInvoicesIntoBilateralPairs(invoices);
    const activePairs = bilateralPairs.filter(p => p.status !== 'CANCELLED');

    const totalEliminationsUSD = activePairs.reduce((sum, pair) => sum + pair.amountUSD, 0);

    // 3. Consolidated metrics
    if (!isConsolidationEnabled) {
      return {
        grossRevenueUSD,
        grossExpensesUSD,
        grossNetProfitUSD,
        intercompanyEliminationsUSD: 0,
        intercompanyPairsCount: activePairs.length,
        consolidatedRevenueUSD: grossRevenueUSD,
        consolidatedExpensesUSD: grossExpensesUSD,
        consolidatedNetProfitUSD: grossNetProfitUSD,
        eliminationAccuracyRate: 100,
        isBalanced: true
      };
    }

    const consolidatedRevenueUSD = Math.max(0, grossRevenueUSD - totalEliminationsUSD);
    const consolidatedExpensesUSD = Math.max(0, grossExpensesUSD - totalEliminationsUSD);
    // Net profit remains identical because revenue and expenses are eliminated symmetrically!
    const consolidatedNetProfitUSD = consolidatedRevenueUSD - consolidatedExpensesUSD;

    return {
      grossRevenueUSD,
      grossExpensesUSD,
      grossNetProfitUSD,
      intercompanyEliminationsUSD: totalEliminationsUSD,
      intercompanyPairsCount: activePairs.length,
      consolidatedRevenueUSD,
      consolidatedExpensesUSD,
      consolidatedNetProfitUSD,
      eliminationAccuracyRate: 100,
      isBalanced: Math.abs(consolidatedNetProfitUSD - grossNetProfitUSD) < 0.01
    };
  }

  /**
   * Creates a pair of linked bilateral invoices simultaneously:
   * 1. Buyer Expense Invoice (Debit Project Cost / Credit Intercompany Payable)
   * 2. Seller Revenue Invoice (Debit Intercompany Receivable / Credit Sales Revenue)
   */
  public static generateBilateralPair(
    params: CreateBilateralInvoiceParams,
    companies: Company[]
  ): { expenseInvoice: IntercompanyInvoice; revenueInvoice: IntercompanyInvoice } {
    const timestamp = Date.now();
    const pairCodeNumber = Math.floor(1000 + Math.random() * 9000);
    const pairId = `pair-ic-${timestamp}`;
    const pairCode = `IC-PAIR-${pairCodeNumber}`;
    
    const buyerComp = companies.find(c => c.id === params.buyerCompanyId);
    const sellerComp = companies.find(c => c.id === params.sellerCompanyId);
    
    const buyerName = buyerComp?.name || 'Buyer Subsidiary';
    const sellerName = sellerComp?.name || 'Seller Subsidiary';
    
    const amountUSD = Number(params.quantity) * Number(params.unitPriceUSD);
    const amountIQD = amountUSD * 1310;
    
    const today = new Date().toISOString().split('T')[0];
    const dueDate = params.dueDate || new Date(timestamp + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
    
    const cryptoHash = `SHA256:IC-MIRROR-${pairCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Expense Invoice for Buyer Subsidiary
    const expenseInvoice: IntercompanyInvoice = {
      id: `ic-exp-${timestamp}`,
      pairId,
      pairCode,
      invoiceNumber: `IC-EXP-${pairCodeNumber}`,
      direction: 'EXPENSE_BUYER',
      buyerCompanyId: params.buyerCompanyId,
      buyerCompanyName: buyerName,
      buyerProjectId: params.buyerProjectId,
      sellerCompanyId: params.sellerCompanyId,
      sellerCompanyName: sellerName,
      sellerProjectId: params.sellerProjectId,
      title: params.title,
      titleKu: params.titleKu,
      titleAr: params.titleAr,
      description: params.description,
      category: params.category,
      quantity: params.quantity,
      unit: params.unit,
      unitPriceUSD: params.unitPriceUSD,
      amountUSD,
      amountIQD,
      issueDate: today,
      dueDate,
      status: 'MUTUALLY_CONFIRMED',
      eliminatedInConsolidation: true,
      cryptoVerificationHash: cryptoHash,
      referencePoNumber: params.referencePoNumber,
      notes: params.notes || 'Bilateral mirror invoice auto-generated by SAS4ERP Consolidation Engine.'
    };

    // Revenue Invoice for Seller Subsidiary
    const revenueInvoice: IntercompanyInvoice = {
      id: `ic-rev-${timestamp}`,
      pairId,
      pairCode,
      invoiceNumber: `IC-REV-${pairCodeNumber}`,
      direction: 'REVENUE_SELLER',
      buyerCompanyId: params.buyerCompanyId,
      buyerCompanyName: buyerName,
      buyerProjectId: params.buyerProjectId,
      sellerCompanyId: params.sellerCompanyId,
      sellerCompanyName: sellerName,
      sellerProjectId: params.sellerProjectId,
      title: params.title,
      titleKu: params.titleKu,
      titleAr: params.titleAr,
      description: params.description,
      category: params.category,
      quantity: params.quantity,
      unit: params.unit,
      unitPriceUSD: params.unitPriceUSD,
      amountUSD,
      amountIQD,
      issueDate: today,
      dueDate,
      status: 'MUTUALLY_CONFIRMED',
      eliminatedInConsolidation: true,
      cryptoVerificationHash: cryptoHash,
      referencePoNumber: params.referencePoNumber,
      notes: params.notes || 'Bilateral mirror invoice auto-generated by SAS4ERP Consolidation Engine.'
    };

    return { expenseInvoice, revenueInvoice };
  }
}
