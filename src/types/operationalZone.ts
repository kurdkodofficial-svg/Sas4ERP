export type GeoIpEnforcementPolicy = 
  | 'HYBRID_DYNAMIC_TOLERANT' // Allows dynamic IP rotations within registered carrier / governorate
  | 'STRICT_GEO_IP'           // Strict IP subnet + GPS proximity boundary
  | 'PERMISSIVE_ROAMING';     // Allows anywhere in Kurdistan & Iraq with valid holding cryptographic token

export interface OperationalZone {
  id: string;
  siteCode: string;
  nameKu: string;
  nameEn: string;
  nameAr: string;
  category: 'CEMENT_PLANT' | 'CONSTRUCTION_SITE' | 'HOLDING_HQ' | 'ENERGY_HUB' | 'LOGISTICS_GATE' | 'COMMERCIAL_OFFICE';
  governorate: 'Erbil' | 'Najaf' | 'Halabja' | 'Sulaymaniyah' | 'Duhok' | 'Zakho' | 'Baghdad';
  coordinates: {
    lat: number;
    lng: number;
    svgX: number; // Percentage on visual map 0-100
    svgY: number; // Percentage on visual map 0-100
  };
  radiusKm: number;
  allowedIpSubnets: string[];
  activeCarrierIsp: string;
  currentDetectedIp: string;
  enforcementPolicy: GeoIpEnforcementPolicy;
  status: 'ACTIVE_IN_BOUNDS' | 'ROAMING_VERIFIED' | 'OUT_OF_BOUNDS_ALERT';
  connectedLaptopsCount: number;
  activeLaptops: {
    id: string;
    name: string;
    ip: string;
    lastPing: string;
    isInsideBoundary: boolean;
  }[];
  lastSyncVerificationTime: string;
  notesKu: string;
  notesEn: string;
}
