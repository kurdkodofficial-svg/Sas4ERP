export type ThrottleMode = 
  | 'UNRESTRICTED' 
  | 'BALANCED_QOS' 
  | 'AGGRESSIVE_THROTTLE' 
  | 'EMERGENCY_CRITICAL_ONLY';

export type TrafficTierId = 'MISSION_CRITICAL' | 'OPERATIONAL_SYNC' | 'BACKGROUND_ARCHIVAL';

export interface TrafficPriorityTier {
  id: TrafficTierId;
  nameEn: string;
  nameKu: string;
  descriptionEn: string;
  descriptionKu: string;
  dscpTag: string; // e.g. DSCP 46 (EF), DSCP 26 (AF31), Best Effort
  weightPercent: number; // percentage of allocated bandwidth
  guaranteedMinKbps: number;
  isThrottledDuringCongestion: boolean;
  samplePayloads: string[];
}

export interface BandwidthSitePolicy {
  siteId: string;
  siteCode: string;
  siteNameEn: string;
  siteNameKu: string;
  locationEn: string;
  locationKu: string;
  carrierIsp: string;
  connectionType: 'FIBER_FTTH' | '4G_LTE' | 'WIRELESS_TOWER' | 'SATELLITE_VSAT';
  
  // Bandwidth allocation
  allocatedBandwidthKbps: number; // current cap
  maxAvailableBandwidthKbps: number; // physical link limit
  currentUsageKbps: number;
  
  // Throttling configuration
  throttleMode: ThrottleMode;
  autoQoSEnabled: boolean;
  autoQoSLatencyThresholdMs: number; // e.g. 140ms
  currentLatencyMs: number;
  isThrottledDueToLatency: boolean;
  
  // Traffic breakdown in Kbps
  criticalUsageKbps: number;
  operationalUsageKbps: number;
  backgroundUsageKbps: number;

  // Statistics
  packetsPrioritizedCount: number;
  packetsDeferredCount: number;
  lastQoSAdjustment: string;
}

export interface FleetBandwidthSummary {
  totalCapacityKbps: number;
  totalAllocatedKbps: number;
  currentFleetUsageKbps: number;
  activeThrottledSitesCount: number;
  autoQoSEnabledSitesCount: number;
  totalPrioritizedPackets: number;
  activePresetProfile: 'BALANCED_DEFAULT' | 'PEAK_HOURS' | 'NIGHT_BACKUP' | 'EMERGENCY_DEGRADED' | 'CUSTOM';
}

export interface BandwidthEventLog {
  id: string;
  timestamp: string;
  siteId: string;
  siteName: string;
  eventType: 'AUTO_SHED_TRIGGERED' | 'CAP_UPDATED' | 'MODE_CHANGED' | 'PRESET_APPLIED' | 'CONGESTION_CLEARED';
  latencyMs: number;
  messageEn: string;
  messageKu: string;
}
