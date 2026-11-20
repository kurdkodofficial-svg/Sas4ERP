# SAS4ERP Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **Default Deny**: Every unmatched path is denied (`match /{document=**} { allow read, write: if false; }`).
2. **Verified Identity**: All authenticated reads/writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Isolation**: `/users/{userId}` documents (email, displayName, photoURL) are strictly readable only by the document owner (`request.auth.uid == userId`) or a verified platform admin.
4. **Master Gate Relational Integrity**: Subcollections (`/companies`, `/projects`, `/purchaseOrders`, `/activityLogs`, `/members`) require verifying the parent `/holdings/{holdingId}` exists and the caller is the Holding Owner, an active Holding Member (for authorized operations), or a verified Admin.
5. **Strict Schema & No Shadow Fields**: Every `create` enforces `hasAll` + `hasOnly` and exact `.size()` bounds. Every `update` invokes `isValid[Entity](incoming())` and strictly allowlists changed fields via `affectedKeys().hasOnly(...)`.
6. **Immutable Fields & Server Timestamps**: `ownerId`, `holdingId`, `id`, and `createdAt` cannot be modified after creation. `createdAt == request.time` on create; `updatedAt == request.time` on update.
7. **Terminal State Locking**: Once a `PurchaseOrder` reaches `APPROVED_BY_OWNER`, `REJECTED_BY_OWNER`, or `CLOSED`, non-admin clients cannot mutate it.
8. **Immutable Audit Trail**: `activityLogs` cannot be updated or deleted by non-admins.
9. **Secure List Queries**: No `get()` or `exists()` calls inside `allow list`; all list rules explicitly constrain `resource.data.ownerId == request.auth.uid` (or `resource.data.uid == request.auth.uid`).

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)
1. **Unverified Admin Email Spoof**: Caller with `email: "kurdkodofficial@gmail.com"`, `email_verified: false` attempts to read `/admins/uid-1`.
2. **PII Cross-User Read**: Verified user `userB` attempts `get` on `/users/userA`.
3. **Self-Assigned Admin Escalation**: Verified user `userB` attempts `create` on `/admins/userB`.
4. **Shadow Field Injection on Holding Create**: Verified owner attempts `create` on `/holdings/hold-1` with ghost field `"isVerified": true`.
5. **Identity Spoofing on Company Create**: Verified user `userB` attempts `create` on `/holdings/hold-1/companies/comp-1` with `ownerId: "userA"`.
6. **Orphaned Project Creation**: Verified owner attempts `create` on `/holdings/nonexistent-hold/projects/proj-1`.
7. **ID Poisoning (1.5KB Document ID)**: Verified owner attempts `create` on `/holdings/${'a'.repeat(300)}`.
8. **Client-Forged Timestamp**: Verified owner attempts `create` on `/holdings/hold-1` with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
9. **Immutable Owner Transfer on Update**: Verified owner attempts `update` on `/holdings/hold-1` changing `ownerId` to `"attacker"`.
10. **Terminal PO State Tampering**: Verified holding owner attempts `update` on a PO whose existing `status` is `"APPROVED_BY_OWNER"` to alter `totalAmountUSD`.
11. **Value Poisoning on Whitelisted Update Field**: Verified owner attempts `update` on `/holdings/hold-1/companies/comp-1` setting `name` to a 500-character string (exceeds `maxLength: 160`).
12. **Blanket List Query Scraping**: Verified user `userB` attempts an unfiltered `list` on `/holdings` or `/holdings/hold-1/companies` belonging to `userA`.
