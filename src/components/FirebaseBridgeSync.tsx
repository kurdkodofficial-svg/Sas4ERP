import React, { useEffect, useRef } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { useERP } from '../context/ERPContext';

/**
 * Silent bridge synchronizing ERPContext state with Firebase Firestore
 * whenever the user connects via 1-Click Google Sign-In.
 * - First-time connection (no cloud holding yet): pushes current workspace to Firestore.
 * - Returning connection (cloud holding exists): hydrates ERPContext with live Firestore updates.
 */
export const FirebaseBridgeSync: React.FC = () => {
  const {
    firebaseUser,
    authReady,
    hasCloudHolding,
    cloudHolding,
    cloudCompanies,
    cloudProjects,
    cloudPurchaseOrders,
    syncWorkspaceToCloud,
  } = useFirebase();

  const {
    holding,
    companies,
    projects,
    purchaseOrders,
    applyFirebaseSnapshot,
  } = useERP();

  const seededRef = useRef<string | null>(null);
  const lastAppliedSigRef = useRef<string>('');

  // Auto-seed brand-new Firebase workspace on first 1-click sign-in
  useEffect(() => {
    if (!authReady || !firebaseUser || hasCloudHolding !== false) return;
    if (seededRef.current === firebaseUser.uid) return;

    seededRef.current = firebaseUser.uid;
    syncWorkspaceToCloud(
      { holding, companies, projects, purchaseOrders },
      'INITIAL_CLOUD_SETUP'
    );
  }, [authReady, firebaseUser, hasCloudHolding, holding, companies, projects, purchaseOrders, syncWorkspaceToCloud]);

  // Apply live Firestore snapshots into ERPContext cleanly
  useEffect(() => {
    if (!authReady || !firebaseUser || !hasCloudHolding || !cloudHolding) return;

    const sig = JSON.stringify({
      h: cloudHolding.name,
      hk: cloudHolding.nameKu,
      hc: cloudHolding.chairmanName,
      c: cloudCompanies.map((x) => `${x.id}:${x.name}:${x.annualBudgetUSD}:${x.spentUSD}`),
      p: cloudProjects.map((x) => `${x.id}:${x.name}:${x.progress}:${x.spentUSD}`),
      po: cloudPurchaseOrders.map((x) => `${x.id}:${x.status}:${x.totalAmountUSD}`),
    });

    if (sig === lastAppliedSigRef.current) return;
    lastAppliedSigRef.current = sig;

    applyFirebaseSnapshot({
      holding: cloudHolding,
      companies: cloudCompanies,
      projects: cloudProjects,
      purchaseOrders: cloudPurchaseOrders,
    });
  }, [
    authReady,
    firebaseUser,
    hasCloudHolding,
    cloudHolding,
    cloudCompanies,
    cloudProjects,
    cloudPurchaseOrders,
    applyFirebaseSnapshot,
  ]);

  return null;
};
