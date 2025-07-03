export enum ZoneType {
  RURAL = 0,
  URBAN = 1,
  HOSPITALS = 2,
  MILITARY = 3,
  RESTRICTED = 4
}

export interface Coordinates {
  latitude: bigint;
  longitude: bigint;
}

export interface Zone {
  id: bigint;
  name: string;
  zoneType: ZoneType;
  boundaries: [bigint, bigint][]; // Array of tuples [lat, lng]
  maxAltitude: bigint;
  minAltitude: bigint;
  isActive: boolean;
  description: string;
  createdAt: bigint;
  updatedAt: bigint;
}

export interface CreateZoneRequest {
  name: string;
  zoneType: ZoneType;
  boundaries: {
    latitude: number;
    longitude: number;
  }[];
  maxAltitude: number;
  minAltitude: number;
  description: string;
}

export interface UpdateZoneRequest {
  zoneId: number;
  name: string;
  boundaries: {
    latitude: number;
    longitude: number;
  }[];
  maxAltitude: number;
  minAltitude: number;
  description: string;
}

export interface ZoneResponse {
  id: number;
  name: string;
  zoneType: string;
  boundaries: {
    latitude: number;
    longitude: number;
  }[];
  maxAltitude: number;
  minAltitude: number;
  isActive: boolean;
  description: string;
  createdAt: number;
  updatedAt: number;
}