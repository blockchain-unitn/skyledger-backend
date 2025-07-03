export enum DroneType {
  MEDICAL = 0,
  CARGO = 1,
  SURVEILLANCE = 2,
  AGRICULTURAL = 3,
  RECREATIONAL = 4,
  MAPPING = 5,
  MILITAR = 6
}

export enum ZoneType {
  RURAL = 0,
  URBAN = 1,
  HOSPITALS = 2,
  MILITARY = 3,
  RESTRICTED = 4
}

export enum DroneStatus {
  ACTIVE = 0,
  MAINTENANCE = 1,
  INACTIVE = 2
}

export interface Drone {
  serialNumber: string;
  model: string;
  droneType: DroneType;
  certHashes: string[];
  permittedZones: ZoneType[];
  ownerHistory: string[];
  maintenanceHash: string;
  status: DroneStatus;
}

export interface DroneResponse {
  tokenId: number;
  owner: string;
  serialNumber: string;
  model: string;
  droneType: string;
  certHashes: string[];
  permittedZones: string[];
  ownerHistory: string[];
  maintenanceHash: string;
  status: string;
}

export interface MintDroneRequest {
  to: string;
  serialNumber: string;
  model: string;
  droneType: DroneType;
  certHashes: string[];
  permittedZones: ZoneType[];
  ownerHistory: string[];
  maintenanceHash: string;
  status: DroneStatus;
}

export interface UpdateCertHashesRequest {
  tokenId: number;
  certHashes: string[];
}

export interface UpdatePermittedZonesRequest {
  tokenId: number;
  permittedZones: ZoneType[];
}

export interface UpdateOwnerHistoryRequest {
  tokenId: number;
  ownerHistory: string[];
}

export interface UpdateMaintenanceHashRequest {
  tokenId: number;
  maintenanceHash: string;
}

export interface UpdateStatusRequest {
  tokenId: number;
  status: DroneStatus;
}