export enum PreAuthorizationStatus {
  APPROVED = 0,
  FAILED = 1
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
  GROUNDED = 2,
  RETIRED = 3
}

export interface RouteCharacteristics {
  zones: ZoneType[];
  altitudeLimit: number;
}

export interface RouteRequest {
  droneId: number;
  route: RouteCharacteristics;
}

export interface AuthorizationResponse {
  droneId: number;
  preauthorizationStatus: PreAuthorizationStatus;
  reason: string;
}

export interface CheckRouteAuthorizationRequest {
  droneId: number;
  zones: ZoneType[];
  altitudeLimit?: number;
}

export interface RequestRouteAuthorizationRequest {
  droneId: number;
  zones: ZoneType[];
  altitudeLimit?: number;
}

export interface RoutePermissionContract {
  droneNFT: string;
}

// Contract struct types (for internal use with BigInt)
export interface RouteCharacteristicsContract {
  zones: bigint[];
  altitudeLimit: bigint;
}

export interface RouteRequestContract {
  droneId: bigint;
  route: RouteCharacteristicsContract;
}

export interface AuthorizationResponseContract {
  droneId: bigint;
  preauthorizationStatus: bigint;
  reason: string;
}
