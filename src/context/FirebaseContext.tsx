import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  doc,
  collection,
  query,
  where,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  OperationType,
  handleFirestoreError,
  sanitizeFirestoreId,
  clampString,
  clampNonNegativeNumber,
  clampPercent,
  FIREBASE_PROJECT_ID,
  FIREBASE_DATABASE_ID
} from '../firebase';
import { HoldingGroup, Company, Project, PurchaseOrder } from '../types/erp';

export interface WorkspaceSyncPayload {
  holding: HoldingGroup;
  companies: Company[];
  projects: Project[];
  purchaseOrders: PurchaseOrder[];
}

export interface CloudHoldingRecord {
  id: string;
  ownerId: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  chairmanName?: string;
  chairmanEmail?: string;
  legalRegNo?: string;
  currency: 'USD' | 'IQD';
  totalRevenueUSD: number;
  totalExpensesUSD: number;
  logoUrl?: string;
}

export interface CloudCompanyRecord {
  id: string;
  code: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  sector?: string;
  generalManager?: string;
  gmPhone?: string;
  annualBudgetUSD: number;
  spentUSD: number;
  employeeCount: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface CloudProjectRecord {
  id: string;
  companyId: string;
  code: string;
  name: string;
  nameKu?: string;
  nameAr?: string;
  location?: string;
  manager?: string;
  budgetUSD: number;
  spentUSD: number;
  progress: number;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
}

export interface CloudPurchaseOrderRecord {
  id: string;
  companyId: string;
  poNumber: string;
  supplierName: string;
  purpose?: string;
  totalAmountUSD: number;
  currency: 'USD' | 'IQD';
  requestedBy: string;
  status: 'DRAFT' | 'PENDING_GM_APPROVAL' | 'PENDING_OWNER_APPROVAL' | 'APPROVED_BY_OWNER' | 'REJECTED_BY_OWNER' | 'CLOSED';
  ownerDecisionNote?: string;
}

export type FirebaseSyncState = 'DISCONNECTED' | 'SYNCING' | 'CONNECTED' | 'ERROR';

interface FirebaseContextType {
  firebaseUser: User | null;
  authReady: boolean;
  isConnecting: boolean;
  syncState: FirebaseSyncState;
  lastSyncedAt: string | null;
  errorMessage: string | null;
  quotaUpgradeUrl: string | null;
  holdingDocId: string | null;
  hasCloudHolding: boolean | null;
  cloudCounts: {
    companies: number;
    projects: number;
    purchaseOrders: number;
  };
  cloudHolding: CloudHoldingRecord | null;
  cloudCompanies: CloudCompanyRecord[];
  cloudProjects: CloudProjectRecord[];
  cloudPurchaseOrders: CloudPurchaseOrderRecord[];
  connectWithGoogle: () => Promise<boolean>;
  disconnectFirebase: () => Promise<void>;
  syncWorkspaceToCloud: (payload: WorkspaceSyncPayload, reason?: string) => Promise<boolean>;
  clearError: () => void;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

const TERMINAL_PO_STATUSES = new Set(['APPROVED_BY_OWNER', 'REJECTED_BY_OWNER', 'CLOSED']);

function mapPoStatusToBlueprint(status: string): CloudPurchaseOrderRecord['status'] {
  if (
    status === 'DRAFT' ||
    status === 'PENDING_GM_APPROVAL' ||
    status === 'PENDING_OWNER_APPROVAL' ||
    status === 'APPROVED_BY_OWNER' ||
    status === 'REJECTED_BY_OWNER' ||
    status === 'CLOSED'
  ) {
    return status;
  }
  if (status.includes('APPROVED') || status === 'PAID' || status === 'DELIVERED') {
    return 'APPROVED_BY_OWNER';
  }
  if (status.includes('REJECTED')) {
    return 'REJECTED_BY_OWNER';
  }
  return 'PENDING_OWNER_APPROVAL';
}

function mapProjectStatusToBlueprint(status?: string): CloudProjectRecord['status'] {
  if (status === 'PLANNING' || status === 'ACTIVE' || status === 'ON_HOLD' || status === 'COMPLETED') {
    return status;
  }
  if (status === 'IN_PROGRESS' || status === 'ON_TRACK') return 'ACTIVE';
  if (status === 'DELAYED' || status === 'AT_RISK') return 'ON_HOLD';
  return 'ACTIVE';
}

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [syncState, setSyncState] = useState<FirebaseSyncState>('DISCONNECTED');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [quotaUpgradeUrl, setQuotaUpgradeUrl] = useState<string | null>(null);
  const [hasCloudHolding, setHasCloudHolding] = useState<boolean | null>(null);

  const [cloudHolding, setCloudHolding] = useState<CloudHoldingRecord | null>(null);
  const [cloudCompanies, setCloudCompanies] = useState<CloudCompanyRecord[]>([]);
  const [cloudProjects, setCloudProjects] = useState<CloudProjectRecord[]>([]);
  const [cloudPurchaseOrders, setCloudPurchaseOrders] = useState<CloudPurchaseOrderRecord[]>([]);

  const isSyncingRef = useRef<boolean>(false);

  const holdingDocId = firebaseUser
    ? sanitizeFirestoreId(`holding_${firebaseUser.uid.slice(0, 32)}`, 'holding')
    : null;

  const parseFriendlyError = useCallback((err: unknown): string => {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('Quota exceeded')) {
      if (msg.includes('Free daily read units')) {
        setQuotaUpgradeUrl(
          `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/firestore/databases/${FIREBASE_DATABASE_ID}/data?openUpgradeDialog=true`
        );
      }
      return 'Firestore daily quota reached. Quotas reset tomorrow.';
    }
    if (msg.includes('popup-closed-by-user') || msg.includes('cancelled-popup-request')) {
      return 'پەنجەرەی چوونەژوورەوەی Google داخرا پێش تەواوبوون.';
    }
    if (msg.includes('popup-blocked')) {
      return 'بڕاوزەرەکە پەنجەرەی چوونەژوورەوەی بلۆک کرد. تکایە ڕێگە بە Popup بدە و دووبارە کلیک بکە.';
    }
    if (msg.includes('unauthorized-domain')) {
      return 'ئەم دۆمەینە هێشتا لە Firebase Auth Authorized Domains زیاد نەکراوە.';
    }
    return msg.slice(0, 220);
  }, []);

  // Track Firebase Authentication state
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (!user) {
        setSyncState('DISCONNECTED');
        setHasCloudHolding(null);
        setCloudHolding(null);
        setCloudCompanies([]);
        setCloudProjects([]);
        setCloudPurchaseOrders([]);
      }
    });
    return () => unsubAuth();
  }, []);

  // Attach real-time Firestore listeners ONLY when auth is ready and user is verified
  useEffect(() => {
    if (!authReady || !firebaseUser || !firebaseUser.emailVerified || !holdingDocId) {
      return;
    }

    const unsubscribers: Unsubscribe[] = [];
    const uid = firebaseUser.uid;
    const holdingPath = `holdings/${holdingDocId}`;
    const companiesPath = `holdings/${holdingDocId}/companies`;
    const projectsPath = `holdings/${holdingDocId}/projects`;
    const posPath = `holdings/${holdingDocId}/purchaseOrders`;

    // 1. Listen to Holding master doc
    const unsubHolding = onSnapshot(
      doc(db, 'holdings', holdingDocId),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setHasCloudHolding(true);
          setCloudHolding({
            id: String(d.id || holdingDocId),
            ownerId: String(d.ownerId || uid),
            name: String(d.name || ''),
            nameKu: typeof d.nameKu === 'string' ? d.nameKu : undefined,
            nameAr: typeof d.nameAr === 'string' ? d.nameAr : undefined,
            chairmanName: typeof d.chairmanName === 'string' ? d.chairmanName : undefined,
            chairmanEmail: typeof d.chairmanEmail === 'string' ? d.chairmanEmail : undefined,
            legalRegNo: typeof d.legalRegNo === 'string' ? d.legalRegNo : undefined,
            currency: d.currency === 'IQD' ? 'IQD' : 'USD',
            totalRevenueUSD: Number(d.totalRevenueUSD) || 0,
            totalExpensesUSD: Number(d.totalExpensesUSD) || 0,
            logoUrl: typeof d.logoUrl === 'string' ? d.logoUrl : undefined,
          });
          setSyncState('CONNECTED');
          setLastSyncedAt(new Date().toLocaleTimeString());
        } else {
          setHasCloudHolding(false);
          setCloudHolding(null);
        }
      },
      (error) => {
        setSyncState('ERROR');
        setErrorMessage(parseFriendlyError(error));
        try {
          handleFirestoreError(error, OperationType.GET, holdingPath);
        } catch {
          // Structured error logged via handleFirestoreError
        }
      }
    );
    unsubscribers.push(unsubHolding);

    // 2. Listen to Subsidiary Companies (query strictly scoped by ownerId)
    const companiesQuery = query(collection(db, 'holdings', holdingDocId, 'companies'), where('ownerId', '==', uid));
    const unsubCompanies = onSnapshot(
      companiesQuery,
      (snap) => {
        const list: CloudCompanyRecord[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: String(d.id || docSnap.id),
            code: String(d.code || 'CMP'),
            name: String(d.name || ''),
            nameKu: typeof d.nameKu === 'string' ? d.nameKu : undefined,
            nameAr: typeof d.nameAr === 'string' ? d.nameAr : undefined,
            sector: typeof d.sector === 'string' ? d.sector : undefined,
            generalManager: typeof d.generalManager === 'string' ? d.generalManager : undefined,
            gmPhone: typeof d.gmPhone === 'string' ? d.gmPhone : undefined,
            annualBudgetUSD: Number(d.annualBudgetUSD) || 0,
            spentUSD: Number(d.spentUSD) || 0,
            employeeCount: Number(d.employeeCount) || 0,
            status: d.status === 'INACTIVE' || d.status === 'ARCHIVED' ? d.status : 'ACTIVE',
          };
        });
        setCloudCompanies(list);
      },
      (error) => {
        setErrorMessage(parseFriendlyError(error));
        try {
          handleFirestoreError(error, OperationType.LIST, companiesPath);
        } catch {
          // Structured error logged
        }
      }
    );
    unsubscribers.push(unsubCompanies);

    // 3. Listen to Projects (query strictly scoped by ownerId)
    const projectsQuery = query(collection(db, 'holdings', holdingDocId, 'projects'), where('ownerId', '==', uid));
    const unsubProjects = onSnapshot(
      projectsQuery,
      (snap) => {
        const list: CloudProjectRecord[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: String(d.id || docSnap.id),
            companyId: String(d.companyId || ''),
            code: String(d.code || 'PRJ'),
            name: String(d.name || ''),
            nameKu: typeof d.nameKu === 'string' ? d.nameKu : undefined,
            nameAr: typeof d.nameAr === 'string' ? d.nameAr : undefined,
            location: typeof d.location === 'string' ? d.location : undefined,
            manager: typeof d.manager === 'string' ? d.manager : undefined,
            budgetUSD: Number(d.budgetUSD) || 0,
            spentUSD: Number(d.spentUSD) || 0,
            progress: Number(d.progress) || 0,
            status: mapProjectStatusToBlueprint(typeof d.status === 'string' ? d.status : 'ACTIVE'),
          };
        });
        setCloudProjects(list);
      },
      (error) => {
        setErrorMessage(parseFriendlyError(error));
        try {
          handleFirestoreError(error, OperationType.LIST, projectsPath);
        } catch {
          // Structured error logged
        }
      }
    );
    unsubscribers.push(unsubProjects);

    // 4. Listen to Purchase Orders (query strictly scoped by ownerId)
    const posQuery = query(collection(db, 'holdings', holdingDocId, 'purchaseOrders'), where('ownerId', '==', uid));
    const unsubPos = onSnapshot(
      posQuery,
      (snap) => {
        const list: CloudPurchaseOrderRecord[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: String(d.id || docSnap.id),
            companyId: String(d.companyId || ''),
            poNumber: String(d.poNumber || 'PO'),
            supplierName: String(d.supplierName || ''),
            purpose: typeof d.purpose === 'string' ? d.purpose : undefined,
            totalAmountUSD: Number(d.totalAmountUSD) || 0,
            currency: d.currency === 'IQD' ? 'IQD' : 'USD',
            requestedBy: String(d.requestedBy || ''),
            status: mapPoStatusToBlueprint(String(d.status || 'PENDING_OWNER_APPROVAL')),
            ownerDecisionNote: typeof d.ownerDecisionNote === 'string' ? d.ownerDecisionNote : undefined,
          };
        });
        setCloudPurchaseOrders(list);
      },
      (error) => {
        setErrorMessage(parseFriendlyError(error));
        try {
          handleFirestoreError(error, OperationType.LIST, posPath);
        } catch {
          // Structured error logged
        }
      }
    );
    unsubscribers.push(unsubPos);

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, [authReady, firebaseUser, holdingDocId, parseFriendlyError]);

  const connectWithGoogle = useCallback(async (): Promise<boolean> => {
    setErrorMessage(null);
    setQuotaUpgradeUrl(null);
    setIsConnecting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (!user || !user.email) {
        setErrorMessage('Google account email is required.');
        return false;
      }

      const defaultHoldingId = sanitizeFirestoreId(`holding_${user.uid.slice(0, 32)}`, 'holding');
      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);

      try {
        const existingUserSnap = await getDoc(userRef);
        const safeDisplayName = clampString(user.displayName || user.email.split('@')[0], 120, 'Executive User');
        const safePhoto = clampString(user.photoURL || '', 500);

        if (!existingUserSnap.exists()) {
          const createPayload: Record<string, unknown> = {
            uid: user.uid,
            email: clampString(user.email, 160),
            displayName: safeDisplayName,
            defaultHoldingId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (safePhoto) {
            createPayload.photoURL = safePhoto;
          }
          await setDoc(userRef, createPayload);
        } else {
          const updatePayload: Record<string, unknown> = {
            displayName: safeDisplayName,
            defaultHoldingId,
            updatedAt: serverTimestamp(),
          };
          if (safePhoto) {
            updatePayload.photoURL = safePhoto;
          }
          await updateDoc(userRef, updatePayload);
        }
      } catch (err) {
        setErrorMessage(parseFriendlyError(err));
        handleFirestoreError(err, OperationType.WRITE, userPath);
      }

      setSyncState('CONNECTED');
      return true;
    } catch (err) {
      setSyncState('ERROR');
      setErrorMessage(parseFriendlyError(err));
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [parseFriendlyError]);

  const disconnectFirebase = useCallback(async () => {
    try {
      await signOut(auth);
      setSyncState('DISCONNECTED');
      setLastSyncedAt(null);
      setErrorMessage(null);
    } catch (err) {
      setErrorMessage(parseFriendlyError(err));
    }
  }, [parseFriendlyError]);

  const syncWorkspaceToCloud = useCallback(
    async (payload: WorkspaceSyncPayload, reason = 'SYNC_WORKSPACE'): Promise<boolean> => {
      if (!firebaseUser || !firebaseUser.emailVerified || !holdingDocId || isSyncingRef.current) {
        return false;
      }

      isSyncingRef.current = true;
      setSyncState('SYNCING');
      setErrorMessage(null);

      const uid = firebaseUser.uid;
      const holdingPath = `holdings/${holdingDocId}`;
      const holdingRef = doc(db, 'holdings', holdingDocId);

      try {
        // 1. Upsert Holding root document strictly matching firebase-blueprint.json
        const existingHolding = await getDoc(holdingRef);
        const safeHoldingName = clampString(
          payload.holding.name || payload.holding.nameKu || 'SAS Holding Group',
          160,
          'SAS Holding Group'
        );
        const safeLogoUrl =
          payload.holding.logoUrl && !payload.holding.logoUrl.startsWith('data:')
            ? clampString(payload.holding.logoUrl, 600)
            : '';

        const holdingFields: Record<string, unknown> = {
          name: safeHoldingName,
          nameKu: clampString(payload.holding.nameKu || safeHoldingName, 160),
          nameAr: clampString(payload.holding.nameAr || safeHoldingName, 160),
          chairmanName: clampString(payload.holding.chairmanName || firebaseUser.displayName || '', 120),
          chairmanEmail: clampString(firebaseUser.email || '', 160),
          legalRegNo: clampString(payload.holding.legalRegistration || '', 80),
          currency: 'USD',
          totalRevenueUSD: clampNonNegativeNumber(payload.holding.totalRevenueUSD, 0),
          totalExpensesUSD: clampNonNegativeNumber(payload.holding.totalExpensesUSD, 0),
          logoUrl: safeLogoUrl,
          updatedBy: uid,
          updatedAt: serverTimestamp(),
        };

        if (!existingHolding.exists()) {
          await setDoc(holdingRef, {
            id: holdingDocId,
            ownerId: uid,
            ...holdingFields,
            createdAt: serverTimestamp(),
          });
        } else {
          await updateDoc(holdingRef, holdingFields);
        }

        // 2. Sync Subsidiary Companies (cap batch size to keep free-tier reads/writes efficient)
        const companiesToSync = payload.companies.slice(0, 25);
        for (const comp of companiesToSync) {
          const compId = sanitizeFirestoreId(comp.id, 'comp');
          const compPath = `holdings/${holdingDocId}/companies/${compId}`;
          const compRef = doc(db, 'holdings', holdingDocId, 'companies', compId);
          try {
            const compSnap = await getDoc(compRef);
            const compFields: Record<string, unknown> = {
              code: clampString(comp.code || compId.toUpperCase(), 40, 'CMP'),
              name: clampString(comp.name || comp.nameKu || 'Subsidiary', 160, 'Subsidiary'),
              nameKu: clampString(comp.nameKu || comp.name || '', 160),
              nameAr: clampString(comp.nameAr || comp.name || '', 160),
              sector: clampString(comp.industry || 'General', 100),
              generalManager: clampString(comp.generalManager || '', 120),
              gmPhone: clampString(comp.gmPhone || '', 40),
              annualBudgetUSD: clampNonNegativeNumber(comp.annualBudgetUSD, 0),
              spentUSD: clampNonNegativeNumber(comp.spentUSD, 0),
              employeeCount: clampNonNegativeNumber(comp.employeeCount, 0),
              status: 'ACTIVE',
              updatedAt: serverTimestamp(),
            };
            if (!compSnap.exists()) {
              await setDoc(compRef, {
                id: compId,
                holdingId: holdingDocId,
                ownerId: uid,
                ...compFields,
                createdAt: serverTimestamp(),
              });
            } else {
              await updateDoc(compRef, compFields);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, compPath);
          }
        }

        // 3. Sync Projects
        const projectsToSync = payload.projects.slice(0, 40);
        for (const proj of projectsToSync) {
          const projId = sanitizeFirestoreId(proj.id, 'proj');
          const projPath = `holdings/${holdingDocId}/projects/${projId}`;
          const projRef = doc(db, 'holdings', holdingDocId, 'projects', projId);
          const safeCompanyId = sanitizeFirestoreId(proj.companyId || companiesToSync[0]?.id || 'comp_1', 'comp');
          try {
            const projSnap = await getDoc(projRef);
            const projFields: Record<string, unknown> = {
              companyId: safeCompanyId,
              code: clampString(proj.code || projId.toUpperCase(), 40, 'PRJ'),
              name: clampString(proj.name || proj.nameKu || 'Project', 160, 'Project'),
              nameKu: clampString(proj.nameKu || proj.name || '', 160),
              nameAr: clampString(proj.nameAr || proj.name || '', 160),
              location: clampString(proj.location || '', 160),
              manager: clampString(proj.manager || '', 120),
              budgetUSD: clampNonNegativeNumber(proj.budgetUSD, 0),
              spentUSD: clampNonNegativeNumber(proj.spentUSD, 0),
              progress: clampPercent(proj.progressPercentage),
              status: mapProjectStatusToBlueprint(proj.status),
              updatedAt: serverTimestamp(),
            };
            if (!projSnap.exists()) {
              await setDoc(projRef, {
                id: projId,
                holdingId: holdingDocId,
                ownerId: uid,
                ...projFields,
                createdAt: serverTimestamp(),
              });
            } else {
              await updateDoc(projRef, projFields);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, projPath);
          }
        }

        // 4. Sync Purchase Orders (respecting Terminal State Locking in firestore.rules)
        const posToSync = payload.purchaseOrders.slice(0, 40);
        for (const po of posToSync) {
          const poId = sanitizeFirestoreId(po.id, 'po');
          const poPath = `holdings/${holdingDocId}/purchaseOrders/${poId}`;
          const poRef = doc(db, 'holdings', holdingDocId, 'purchaseOrders', poId);
          const safeCompanyId = sanitizeFirestoreId(po.companyId || companiesToSync[0]?.id || 'comp_1', 'comp');
          const mappedStatus = mapPoStatusToBlueprint(po.status);

          try {
            const poSnap = await getDoc(poRef);
            if (!poSnap.exists()) {
              await setDoc(poRef, {
                id: poId,
                holdingId: holdingDocId,
                ownerId: uid,
                companyId: safeCompanyId,
                poNumber: clampString(po.poNumber || poId.toUpperCase(), 60, 'PO-001'),
                supplierName: clampString(po.supplierName || 'Vendor', 160, 'Vendor'),
                purpose: clampString(po.purpose || '', 500),
                totalAmountUSD: clampNonNegativeNumber(po.totalAmountUSD, 0),
                currency: po.currency === 'IQD' ? 'IQD' : 'USD',
                requestedBy: clampString(po.requestedBy || 'Staff', 120, 'Staff'),
                status: mappedStatus,
                ownerDecisionNote: clampString(po.holdingApproval?.comments || '', 400),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
              });
            } else {
              const existingStatus = String(poSnap.data()?.status || '');
              if (!TERMINAL_PO_STATUSES.has(existingStatus) && existingStatus !== mappedStatus) {
                await updateDoc(poRef, {
                  status: mappedStatus,
                  ownerDecisionNote: clampString(po.holdingApproval?.comments || 'Updated via SAS4ERP', 400),
                  updatedAt: serverTimestamp(),
                });
              }
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.WRITE, poPath);
          }
        }

        // 5. Append immutable audit log entry
        const logId = sanitizeFirestoreId(`log_${Date.now()}`, 'log');
        const logPath = `holdings/${holdingDocId}/activityLogs/${logId}`;
        try {
          await setDoc(doc(db, 'holdings', holdingDocId, 'activityLogs', logId), {
            id: logId,
            holdingId: holdingDocId,
            ownerId: uid,
            actorEmail: clampString(firebaseUser.email || 'user@holding.local', 160),
            action: clampString(reason, 80, 'SYNC_WORKSPACE'),
            summary: clampString(
              `Synced ${companiesToSync.length} companies, ${projectsToSync.length} projects, ${posToSync.length} POs.`,
              400
            ),
            createdAt: serverTimestamp(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, logPath);
        }

        setHasCloudHolding(true);
        setSyncState('CONNECTED');
        setLastSyncedAt(new Date().toLocaleTimeString());
        return true;
      } catch (err) {
        setSyncState('ERROR');
        setErrorMessage(parseFriendlyError(err));
        try {
          handleFirestoreError(err, OperationType.WRITE, holdingPath);
        } catch {
          // Structured error logged
        }
        return false;
      } finally {
        isSyncingRef.current = false;
      }
    },
    [firebaseUser, holdingDocId, parseFriendlyError]
  );

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        authReady,
        isConnecting,
        syncState,
        lastSyncedAt,
        errorMessage,
        quotaUpgradeUrl,
        holdingDocId,
        hasCloudHolding,
        cloudCounts: {
          companies: cloudCompanies.length,
          projects: cloudProjects.length,
          purchaseOrders: cloudPurchaseOrders.length,
        },
        cloudHolding,
        cloudCompanies,
        cloudProjects,
        cloudPurchaseOrders,
        connectWithGoogle,
        disconnectFirebase,
        syncWorkspaceToCloud,
        clearError: () => {
          setErrorMessage(null);
          setQuotaUpgradeUrl(null);
        },
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return ctx;
};
