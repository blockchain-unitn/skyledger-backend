import { ethers } from 'ethers';
import { 
  MintTokenRequest, 
  BurnTokenRequest, 
  TransferTokenRequest, 
  TransferFromTokenRequest, 
  ApproveTokenRequest,
  TokenResponse,
  BalanceResponse,
  AllowanceResponse
} from '../types/reputationToken.types';

export class ReputationTokenService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.REPUTATION_TOKEN_ADDRESS;

    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_1 environment variable is required');
    }
    if (!contractAddress) {
      throw new Error('REPUTATION_TOKEN_ADDRESS environment variable is required');
    }

    console.log('Initializing ReputationTokenService with:');
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const abi = [
      // Owner functions
      "function mint(address to, uint256 amount) public",
      "function burn(address from, uint256 amount) public",
      
      // ERC20 standard functions
      "function transfer(address to, uint256 amount) public returns (bool)",
      "function transferFrom(address from, address to, uint256 amount) public returns (bool)",
      "function approve(address spender, uint256 amount) public returns (bool)",
      "function balanceOf(address account) public view returns (uint256)",
      "function allowance(address owner, address spender) public view returns (uint256)",
      "function totalSupply() public view returns (uint256)",
      "function name() public view returns (string)",
      "function symbol() public view returns (string)",
      "function decimals() public view returns (uint8)",
      
      // Events
      "event Transfer(address indexed from, address indexed to, uint256 value)",
      "event Approval(address indexed owner, address indexed spender, uint256 value)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  private validateAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch (error) {
      throw new Error(`Invalid address format: ${address}`);
    }
  }

  private validateAmount(amount: string): string {
    try {
      const parsedAmount = ethers.parseEther(amount);
      if (parsedAmount <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return parsedAmount.toString();
    } catch (error) {
      throw new Error(`Invalid amount format: ${amount}`);
    }
  }

  async mint(mintData: MintTokenRequest): Promise<string> {
    try {
      const validatedTo = this.validateAddress(mintData.to);
      const validatedAmount = this.validateAmount(mintData.amount);

      const tx = await this.contract.mint(validatedTo, validatedAmount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async burn(burnData: BurnTokenRequest): Promise<string> {
    try {
      const validatedFrom = this.validateAddress(burnData.from);
      const validatedAmount = this.validateAmount(burnData.amount);

      const tx = await this.contract.burn(validatedFrom, validatedAmount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to burn tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transfer(transferData: TransferTokenRequest): Promise<string> {
    try {
      const validatedTo = this.validateAddress(transferData.to);
      const validatedAmount = this.validateAmount(transferData.amount);

      const tx = await this.contract.transfer(validatedTo, validatedAmount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to transfer tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transferFrom(transferFromData: TransferFromTokenRequest): Promise<string> {
    try {
      const validatedFrom = this.validateAddress(transferFromData.from);
      const validatedTo = this.validateAddress(transferFromData.to);
      const validatedAmount = this.validateAmount(transferFromData.amount);

      const tx = await this.contract.transferFrom(validatedFrom, validatedTo, validatedAmount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to transfer tokens from: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async approve(approveData: ApproveTokenRequest): Promise<string> {
    try {
      const validatedSpender = this.validateAddress(approveData.spender);
      const validatedAmount = this.validateAmount(approveData.amount);

      const tx = await this.contract.approve(validatedSpender, validatedAmount);
      await tx.wait();
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to approve tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async balanceOf(address: string): Promise<BalanceResponse> {
    try {
      const validatedAddress = this.validateAddress(address);
      const balance = await this.contract.balanceOf(validatedAddress);
      
      return {
        balance: ethers.formatEther(balance),
        address: validatedAddress
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async allowance(owner: string, spender: string): Promise<AllowanceResponse> {
    try {
      const validatedOwner = this.validateAddress(owner);
      const validatedSpender = this.validateAddress(spender);
      const allowance = await this.contract.allowance(validatedOwner, validatedSpender);
      
      return {
        allowance: ethers.formatEther(allowance),
        owner: validatedOwner,
        spender: validatedSpender
      };
    } catch (error) {
      throw new Error(`Failed to get allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async totalSupply(): Promise<string> {
    try {
      const totalSupply = await this.contract.totalSupply();
      return ethers.formatEther(totalSupply);
    } catch (error) {
      throw new Error(`Failed to get total supply: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async name(): Promise<string> {
    try {
      return await this.contract.name();
    } catch (error) {
      throw new Error(`Failed to get token name: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async symbol(): Promise<string> {
    try {
      return await this.contract.symbol();
    } catch (error) {
      throw new Error(`Failed to get token symbol: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async decimals(): Promise<number> {
    try {
      const decimals = await this.contract.decimals();
      return Number(decimals);
    } catch (error) {
      throw new Error(`Failed to get token decimals: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTokenInfo(): Promise<TokenResponse> {
    try {
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        this.name(),
        this.symbol(),
        this.decimals(),
        this.totalSupply()
      ]);

      return {
        name,
        symbol,
        decimals,
        totalSupply
      };
    } catch (error) {
      throw new Error(`Failed to get token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
