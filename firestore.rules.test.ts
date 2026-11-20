/**
 * SAS4ERP Firestore Security Rules Verification Matrix (Phase 0 TDD)
 * Verifies that all "Dirty Dozen" adversarial payloads are rejected (PERMISSION_DENIED)
 * by the hardened rules in firestore.rules.
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  actor: { uid: string; email: string; email_verified: boolean };
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
  enforcedByPillar: string;
}

export const DIRTY_DOZEN_PAYLOADS: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unverified Admin Email Spoof',
    actor: { uid: 'spoof-1', email: 'kurdkodofficial@gmail.com', email_verified: false },
    operation: 'get',
    path: '/admins/spoof-1',
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 4 / Verified Users Gate (email_verified == true)'
  },
  {
    id: 2,
    name: 'PII Cross-User Profile Read',
    actor: { uid: 'userB', email: 'userb@example.com', email_verified: true },
    operation: 'get',
    path: '/users/userA',
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 6 / PII Isolation'
  },
  {
    id: 3,
    name: 'Self-Assigned Admin Privilege Escalation',
    actor: { uid: 'userB', email: 'userb@example.com', email_verified: true },
    operation: 'create',
    path: '/admins/userB',
    payload: { uid: 'userB', email: 'userb@example.com', createdAt: 'SERVER_TIMESTAMP' },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 4 / Anti-Self-Assigned Roles'
  },
  {
    id: 4,
    name: 'Shadow Field Injection on Holding Create',
    actor: { uid: 'owner1', email: 'owner1@holding.com', email_verified: true },
    operation: 'create',
    path: '/holdings/hold-1',
    payload: {
      id: 'hold-1',
      ownerId: 'owner1',
      name: 'Alpha Holding',
      currency: 'USD',
      totalRevenueUSD: 1000,
      totalExpensesUSD: 500,
      updatedBy: 'owner1',
      isVerified: true
    },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 2 / Strict Keys hasOnly()'
  },
  {
    id: 5,
    name: 'Identity Spoofing on Subsidiary Company Create',
    actor: { uid: 'attacker', email: 'attacker@example.com', email_verified: true },
    operation: 'create',
    path: '/holdings/hold-1/companies/comp-1',
    payload: {
      id: 'comp-1',
      holdingId: 'hold-1',
      ownerId: 'owner1',
      code: 'CMP-1',
      name: 'Spoof Co',
      annualBudgetUSD: 50000,
      spentUSD: 0,
      employeeCount: 10,
      status: 'ACTIVE'
    },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 2 / Identity Integrity (ownerId == request.auth.uid)'
  },
  {
    id: 6,
    name: 'Orphaned Project Creation Under Non-Existent Holding',
    actor: { uid: 'owner1', email: 'owner1@holding.com', email_verified: true },
    operation: 'create',
    path: '/holdings/missing-holding/projects/proj-1',
    payload: {
      id: 'proj-1',
      holdingId: 'missing-holding',
      companyId: 'comp-1',
      ownerId: 'owner1',
      code: 'PRJ-1',
      name: 'Orphan Tower',
      budgetUSD: 10000,
      spentUSD: 0,
      progress: 0,
      status: 'PLANNING'
    },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 1 / Master Gate Relational Parent exists()'
  },
  {
    id: 7,
    name: 'ID Poisoning (Oversized Document ID)',
    actor: { uid: 'owner1', email: 'owner1@holding.com', email_verified: true },
    operation: 'create',
    path: `/holdings/${'x'.repeat(250)}`,
    payload: { id: 'x'.repeat(250), ownerId: 'owner1', name: 'Poison' },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 3 / Path Variable Hardening isValidId()'
  },
  {
    id: 8,
    name: 'Client-Forged Timestamp',
    actor: { uid: 'owner1', email: 'owner1@holding.com', email_verified: true },
    operation: 'create',
    path: '/holdings/hold-2',
    payload: {
      id: 'hold-2',
      ownerId: 'owner1',
      name: 'Forged Time Holding',
      currency: 'USD',
      totalRevenueUSD: 0,
      totalExpensesUSD: 0,
      updatedBy: 'owner1',
      createdAt: '2020-01-01T00:00:00Z',
      updatedAt: '2020-01-01T00:00:00Z'
    },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Temporal Integrity (createdAt == request.time)'
  },
  {
    id: 9,
    name: 'Immutable Owner Transfer on Update',
    actor: { uid: 'owner1', email: 'owner1@holding.com', email_verified: true },
    operation: 'update',
    path: '/holdings/hold-1',
    payload: { ownerId: 'attacker' },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Immortal Field Rule (incoming().ownerId == existing().ownerId)'
  },
  {
    id: 10,
    name: 'Terminal Purchase Order State Tampering',
    actor: { uid: 'owner1', email: 'owner1@holding.com', email_verified: true },
    operation: 'update',
    path: '/holdings/hold-1/purchaseOrders/po-approved-1',
    payload: { totalAmountUSD: 9999999, status: 'APPROVED_BY_OWNER' },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Terminal State Locking (existing().status not in terminal states)'
  },
  {
    id: 11,
    name: 'Value Poisoning on Whitelisted Update Field',
    actor: { uid: 'owner1', email: 'owner1@holding.com', email_verified: true },
    operation: 'update',
    path: '/holdings/hold-1/companies/comp-1',
    payload: { name: 'A'.repeat(500) },
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 2 / isValidCompany() size <= 160 in update block'
  },
  {
    id: 12,
    name: 'Blanket List Query Scraping Across Tenants',
    actor: { uid: 'userB', email: 'userb@example.com', email_verified: true },
    operation: 'list',
    path: '/holdings/hold-1/companies',
    expected: 'PERMISSION_DENIED',
    enforcedByPillar: 'Pillar 8 / Secure List Queries (resource.data.ownerId == request.auth.uid)'
  }
];
