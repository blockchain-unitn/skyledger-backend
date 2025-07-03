export enum RouteStatus {
  NORMAL = 0,
  DEVIATED = 1
}

export enum ZoneType {
  RURAL = 0,
  URBAN = 1,
  HOSPITALS = 2,
  MILITARY = 3,
  RESTRICTED = 4
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteLog {
  logId: number;
  timestamp: number;
  droneId: number;
  utmAuthorizer: string;
  zones: ZoneType[];
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  route: RoutePoint[];
  startTime: number;
  endTime: number;
  status: RouteStatus;
}

export interface LogRouteRequest {
  droneId: number;
  utmAuthorizer: string;
  zones: ZoneType[];
  startPoint: RoutePoint;
  endPoint: RoutePoint;
  route: RoutePoint[];
  startTime: number;
  endTime: number;
  status: RouteStatus;
}

export interface PaginatedLogsResponse {
  logIds: number[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}

export interface DroneAuthorizedResponse {
  droneIds: number[];
  hasMore?: boolean;
  utm: string;
}

// Internal contract types (with BigInt for blockchain interaction)
export interface RoutePointContract {
  latitude: bigint;
  longitude: bigint;
}

export interface RouteLogContract {
  timestamp: bigint;
  droneId: bigint;
  utmAuthorizer: string;
  zones: ZoneType[];
  startPoint: RoutePointContract;
  endPoint: RoutePointContract;
  route: RoutePointContract[];
  startTime: bigint;
  endTime: bigint;
  status: RouteStatus;
}