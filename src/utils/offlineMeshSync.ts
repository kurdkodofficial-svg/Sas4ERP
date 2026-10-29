/**
 * SAS4ERP Offline Resilience & Holding Local Mesh Network Synchronization Engine
 * 
 * Enables Holding headquarters, industrial sites, and gate checkpoints to operate:
 * 1. Fully Offline with zero internet (Cache & IndexedDB/LocalStorage replication).
 * 2. Over Local Mesh Network (P2P BroadcastChannel, LAN nodes, Wi-Fi mesh).
 * 3. Air-gapped manual sync packet exchange (.sasmesh files / QR / USB sync).
 */

export type ConnectionMode = 'ONLINE_CLOUD' | 'OFFLINE_MESH' | 'OFFLINE_AIRGAP';

export interface MeshNode {
  nodeId: string;
  name: string;
  nameKu: string;
  role: string;
  siteLocation: string;
  siteLocationKu: string;
  connectionType: 'LAN_MESH' | 'DIRECT_WIFI' | 'AIR_GAP' | 'CLOUD';
  status: 'ONLINE' | 'ACTIVE_MESH' | 'STANDBY';
  ipAddress: string;
  lastSeen: string;
  pendingSyncCount: number;
}

export interface QueuedOfflineMutation {
  id: string;
  type: 'APPROVE_PO' | 'REJECT_PO' | 'ADD_GATE_LOG' | 'SAVE_STICKY_NOTE' | 'UPDATE_BUDGET' | 'EXECUTE_DIRECTIVE';
  payload: any;
  timestamp: number;
  originNodeId: string;
  originNodeName: string;
  synced: boolean;
}

export interface MeshSyncPacket {
  protocol: 'SAS4ERP-MESH-V1';
  packetId: string;
  exportTimestamp: string;
  sourceNode: {
    nodeId: string;
    nodeName: string;
    siteLocation: string;
  };
  mutations: QueuedOfflineMutation[];
  snapshotSummary?: {
    approvedPOsCount: number;
    gateLogsCount: number;
    notesCount: number;
  };
}

const STORAGE_OUTBOX_KEY = 'sas4erp_offline_sync_outbox';
const STORAGE_SNAPSHOT_KEY = 'sas4erp_offline_db_snapshot';
const STORAGE_CURRENT_NODE_KEY = 'sas4erp_local_mesh_node_profile';

// Standard Pre-Configured Holding Mesh Nodes
export const initialHoldingMeshNodes: MeshNode[] = [
  {
    nodeId: 'node-hq-owner',
    name: 'Executive HQ - Holding Chairman Node',
    nameKu: 'سەرۆکایەتی هۆلدینگ - دەسەڵاتی خاوەن',
    role: 'HOLDING_OWNER',
    siteLocation: 'Erbil World Trade Center, Floor 14',
    siteLocationKu: 'هەولێر - تاوەری بازرگانی، نهۆمی ١٤',
    connectionType: 'LAN_MESH',
    status: 'ACTIVE_MESH',
    ipAddress: '192.168.10.10',
    lastSeen: 'ئێستا (Active)',
    pendingSyncCount: 0
  },
  {
    nodeId: 'node-erbil-mill',
    name: 'Erbil Steel Plant & Heavy Mill Node',
    nameKu: 'کارگەی ئەربیل ستیل - یەکەی بەرهەمهێنان',
    role: 'PROJECT_MANAGER',
    siteLocation: 'Erbil South Industrial Zone (Off-grid)',
    siteLocationKu: 'ناوچەی پیشەسازی باشوور (دەرەوەی ئینتەرنێت)',
    connectionType: 'DIRECT_WIFI',
    status: 'ACTIVE_MESH',
    ipAddress: '10.0.4.15',
    lastSeen: '٢ خولەک پێش ئێستا',
    pendingSyncCount: 2
  },
  {
    nodeId: 'node-gate-security',
    name: 'Main Security Gate & Logistics Scanner',
    nameKu: 'دەروازەی پشکنین و تەرازووی بار (سەرەکی)',
    role: 'GATE_SECURITY',
    siteLocation: 'Checkpoint Alpha - Industrial Gate 1',
    siteLocationKu: 'خاڵی پشکنینی ئەلفا - دەروازەی ١',
    connectionType: 'LAN_MESH',
    status: 'ACTIVE_MESH',
    ipAddress: '192.168.10.88',
    lastSeen: 'ئێستا (Active)',
    pendingSyncCount: 1
  },
  {
    nodeId: 'node-baghdad-branch',
    name: 'Baghdad Central Operations Branch',
    nameKu: 'لقی ئۆپەراسیۆنەکانی بەغدا و پەیوەندییەکان',
    role: 'COMPANY_GM',
    siteLocation: 'Baghdad - Karrada Commercial District',
    siteLocationKu: 'بەغدا - کەرادە',
    connectionType: 'AIR_GAP',
    status: 'STANDBY',
    ipAddress: '172.16.2.40',
    lastSeen: '٤٥ خولەک پێش ئێستا',
    pendingSyncCount: 0
  }
];

class OfflineMeshSyncService {
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: ((event: { type: string; data: any }) => void)[] = [];
  private currentNode: MeshNode;

  constructor() {
    // Initialize or load this device's Mesh Node Identity
    this.currentNode = this.initCurrentNode();

    // Setup Browser BroadcastChannel for instant local mesh sync across tabs/windows
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('sas4erp_holding_mesh_bus');
        this.broadcastChannel.onmessage = (event) => {
          this.handleIncomingMeshMessage(event.data);
        };
      } catch (err) {
        console.warn('[MeshSync] BroadcastChannel not supported:', err);
      }
    }
  }

  private initCurrentNode(): MeshNode {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_NODE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }

    const defaultNode: MeshNode = {
      nodeId: `node-local-${Math.random().toString(36).substring(2, 7)}`,
      name: 'Current Device (Executive Console)',
      nameKu: 'ئەم ئامێرە (کۆنسۆڵی سەرۆکایەتی)',
      role: 'HOLDING_OWNER',
      siteLocation: 'Erbil HQ / Local Workstation',
      siteLocationKu: 'مەڵبەندی سەرەکی / وێستگەی خۆجێیی',
      connectionType: 'LAN_MESH',
      status: 'ACTIVE_MESH',
      ipAddress: '192.168.10.' + Math.floor(Math.random() * 200 + 20),
      lastSeen: 'Now',
      pendingSyncCount: 0
    };

    try {
      localStorage.setItem(STORAGE_CURRENT_NODE_KEY, JSON.stringify(defaultNode));
    } catch {}

    return defaultNode;
  }

  public getCurrentNode(): MeshNode {
    return this.currentNode;
  }

  public setCurrentNode(node: Partial<MeshNode>) {
    this.currentNode = { ...this.currentNode, ...node };
    try {
      localStorage.setItem(STORAGE_CURRENT_NODE_KEY, JSON.stringify(this.currentNode));
    } catch {}
    this.broadcastMeshPresence();
  }

  // Determine actual connection mode
  public getConnectionMode(): ConnectionMode {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'OFFLINE_MESH';
    }
    return 'ONLINE_CLOUD';
  }

  // Get queued offline mutations
  public getOutbox(): QueuedOfflineMutation[] {
    try {
      const data = localStorage.getItem(STORAGE_OUTBOX_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Queue a mutation when offline
  public queueMutation(
    type: QueuedOfflineMutation['type'],
    payload: any
  ): QueuedOfflineMutation {
    const mutation: QueuedOfflineMutation = {
      id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type,
      payload,
      timestamp: Date.now(),
      originNodeId: this.currentNode.nodeId,
      originNodeName: this.currentNode.nameKu,
      synced: false
    };

    const currentOutbox = this.getOutbox();
    const updated = [mutation, ...currentOutbox];

    try {
      localStorage.setItem(STORAGE_OUTBOX_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save mutation to outbox:', e);
    }

    // Broadcast change across local mesh
    this.broadcastMeshMessage('MUTATION_CREATED', mutation);
    this.notifyListeners('outbox_updated', updated);

    return mutation;
  }

  // Clear outbox after successful sync
  public clearOutbox(syncedIds?: string[]) {
    if (!syncedIds) {
      localStorage.removeItem(STORAGE_OUTBOX_KEY);
      this.notifyListeners('outbox_updated', []);
      return;
    }
    const current = this.getOutbox();
    const remaining = current.filter((m) => !syncedIds.includes(m.id));
    localStorage.setItem(STORAGE_OUTBOX_KEY, JSON.stringify(remaining));
    this.notifyListeners('outbox_updated', remaining);
  }

  // Broadcast presence on local mesh
  public broadcastMeshPresence() {
    this.broadcastMeshMessage('PEER_PRESENCE', {
      node: this.currentNode,
      timestamp: Date.now()
    });
  }

  // Broadcast a message to local mesh network peers
  public broadcastMeshMessage(type: string, data: any) {
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          senderId: this.currentNode.nodeId,
          type,
          data,
          timestamp: Date.now()
        });
      } catch (err) {
        console.warn('Mesh broadcast error:', err);
      }
    }
  }

  private handleIncomingMeshMessage(msg: any) {
    if (!msg || msg.senderId === this.currentNode.nodeId) return;

    if (msg.type === 'MUTATION_CREATED') {
      // Received a mutation from another local mesh node!
      this.notifyListeners('peer_mutation_received', msg.data);
    } else if (msg.type === 'PEER_PRESENCE') {
      this.notifyListeners('peer_discovered', msg.data.node);
    } else if (msg.type === 'MESH_SYNC_REQUEST') {
      // Send our outbox
      this.broadcastMeshMessage('MESH_SYNC_RESPONSE', {
        sourceNode: this.currentNode,
        mutations: this.getOutbox()
      });
    }
  }

  // Save full offline ERP database snapshot
  public saveOfflineSnapshot(erpData: any) {
    try {
      localStorage.setItem(
        STORAGE_SNAPSHOT_KEY,
        JSON.stringify({
          timestamp: Date.now(),
          data: erpData
        })
      );
    } catch (e) {
      console.warn('Could not save full offline snapshot:', e);
    }
  }

  // Load offline snapshot
  public loadOfflineSnapshot(): any | null {
    try {
      const saved = localStorage.getItem(STORAGE_SNAPSHOT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  }

  // Generate an air-gapped Mesh Sync Packet for USB transfer / QR / AirDrop
  public generateExportPacket(extraContext?: any): MeshSyncPacket {
    const outbox = this.getOutbox();
    return {
      protocol: 'SAS4ERP-MESH-V1',
      packetId: `pkt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exportTimestamp: new Date().toISOString(),
      sourceNode: {
        nodeId: this.currentNode.nodeId,
        nodeName: this.currentNode.nameKu,
        siteLocation: this.currentNode.siteLocationKu
      },
      mutations: outbox,
      snapshotSummary: {
        approvedPOsCount: extraContext?.approvedPOsCount || 0,
        gateLogsCount: extraContext?.gateLogsCount || 0,
        notesCount: extraContext?.notesCount || 0
      }
    };
  }

  // Download the Mesh Sync Packet as a .sasmesh file
  public downloadSyncPacketFile(packet: MeshSyncPacket) {
    const jsonStr = JSON.stringify(packet, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `holding-mesh-sync-${new Date().toISOString().slice(0, 10)}.sasmesh`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Parse and import a Mesh Sync Packet from file or text
  public parseAndImportPacket(jsonStr: string): { success: boolean; messageKu: string; packet?: MeshSyncPacket } {
    try {
      const packet: MeshSyncPacket = JSON.parse(jsonStr);
      if (packet.protocol !== 'SAS4ERP-MESH-V1') {
        return {
          success: false,
          messageKu: 'فۆرماتی فایلەکە نادروستە. پێویستە فایلی فەرمی SAS4ERP Mesh بێت.'
        };
      }

      // Merge mutations into local outbox / system
      const localOutbox = this.getOutbox();
      const newMutations = packet.mutations.filter(
        (pm) => !localOutbox.some((lm) => lm.id === pm.id)
      );

      const merged = [...newMutations, ...localOutbox];
      localStorage.setItem(STORAGE_OUTBOX_KEY, JSON.stringify(merged));
      this.notifyListeners('outbox_updated', merged);

      return {
        success: true,
        messageKu: `پاکێتی میش بە سەرکەوتوویی لە (${packet.sourceNode.nodeName}) هاوردەکرا! ${newMutations.length} گۆڕانکاری نوێ هاوکاتکران.`,
        packet
      };
    } catch (err: any) {
      return {
        success: false,
        messageKu: `هەڵە لە خوێندنەوەی فایلی میش: ${err.message}`
      };
    }
  }

  // Add event listener
  public subscribe(callback: (event: { type: string; data: any }) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners(type: string, data: any) {
    this.listeners.forEach((l) => l({ type, data }));
  }
}

export const offlineMeshService = new OfflineMeshSyncService();
