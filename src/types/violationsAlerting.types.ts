export interface Violation {
  droneID: number;
  position: string;
  timestamp: number;
}

export interface ReportViolationRequest {
  droneID: number;
  position: string;
}

export interface ViolationsByDroneResponse {
  positions: string[];
  timestamps: number[];
}

export interface AllViolationsResponse {
  droneIDs: number[];
  positions: string[];
  timestamps: number[];
}
