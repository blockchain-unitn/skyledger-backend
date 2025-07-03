export interface OperatorInfo {
  registered: boolean;
}

export interface OperatorResponse {
  address: string;
  registered: boolean;
  reputationBalance: string;
}

export interface RegisterOperatorRequest {
  operator: string;
}

export interface SpendTokensRequest {
  amount: string; // Amount in wei
}

export interface PenalizeOperatorRequest {
  operator: string;
  penalty: string; // Amount in reputation tokens
}

export interface AddAdminRequest {
  newAdmin: string;
}

export interface RemoveAdminRequest {
  adminToRemove: string;
}

export interface OperatorStats {
  totalOperators: number;
  registeredOperators: string[];
  contractOwner: string;
  reputationTokenAddress: string;
  reputationTokenSymbol: string;
  reputationTokenDecimals: number;
}