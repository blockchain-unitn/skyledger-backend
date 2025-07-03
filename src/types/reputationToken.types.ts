export interface MintTokenRequest {
  to: string;
  amount: string;
}

export interface BurnTokenRequest {
  from: string;
  amount: string;
}

export interface TransferTokenRequest {
  to: string;
  amount: string;
}

export interface TransferFromTokenRequest {
  from: string;
  to: string;
  amount: string;
}

export interface ApproveTokenRequest {
  spender: string;
  amount: string;
}

export interface TokenResponse {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
}

export interface BalanceResponse {
  balance: string;
  address: string;
}

export interface AllowanceResponse {
  allowance: string;
  owner: string;
  spender: string;
}
