export interface Violation {
  droneID: string;
  position: string;
  timestamp: number;
}

export interface ReportViolationRequest {
  droneID: string;
  position: string;
}

export interface ViolationsByDroneResponse {
  positions: string[];
  timestamps: number[];
}

export interface AllViolationsResponse {
  droneIDs: string[];
  positions: string[];
  timestamps: number[];
}
