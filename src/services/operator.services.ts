import { ethers } from 'ethers';
import { 
  OperatorInfo,
  OperatorResponse,
  RegisterOperatorRequest,
  SpendTokensRequest,
  PenalizeOperatorRequest,
  AddAdminRequest,
  RemoveAdminRequest,
  OperatorStats
} from '../types/operator.types';

export class OperatorsService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.OPERATOR_ADDRESS;

    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_1 environment variable is required');
    }
    if (!contractAddress) {
      throw new Error('OPERATOR_ADDRESS environment variable is required');
    }

    console.log('Initializing OperatorsService with:');
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const abi = [
      "function registerOperator(address payable operator) external payable",
      "function spendTokens() public payable",
      "function penalizeOperator(address payable operator, uint256 penalty) external payable",
      "function addAdmin(address newAdmin) external",
      "function removeAdmin(address adminToRemove) external",
      "function getReputation(address operator) external view returns (uint256)",
      "function getOperatorInfo(address operatorAddress) external view returns (tuple(bool registered))",
      "function operators(address) external view returns (bool registered)",
      "function reputationToken() external view returns (address)",
      "function ownerAddr() external view returns (address)",
      "function hasRole(bytes32 role, address account) external view returns (bool)",
      "function ADMIN_ROLE() external view returns (bytes32)",
      "function OWNER_ROLE() external view returns (bytes32)",
      "function DEFAULT_ADMIN_ROLE() external view returns (bytes32)",
      "function getAllOperators() external view returns (address[])",
      "event OperatorRegistered(address indexed operator)",
      "event TokensSpent(address indexed operator, uint256 amount)",
      "event OperatorPenalized(address indexed operator, uint256 penalty)",
      "event Sent(address indexed to, uint256 amount)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }
  async getAllOperators(): Promise<string[]> {
    try {
      const operators = await this.contract.getAllOperators();
      return operators;
    } catch (error) {
      console.error('Error in getAllOperators:', error);
      throw new Error(`Failed to get all operators: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateAndFormatAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch (error) {
      throw new Error(`Invalid address format: ${address}`);
    }
  }

  async checkRoles(): Promise<{ isOwner: boolean; isAdmin: boolean; address: string }> {
    try {
      const ownerRole = await this.contract.OWNER_ROLE();
      const adminRole = await this.contract.ADMIN_ROLE();
      const callerAddress = this.wallet.address;
      
      const isOwner = await this.contract.hasRole(ownerRole, callerAddress);
      const isAdmin = await this.contract.hasRole(adminRole, callerAddress);

      return {
        isOwner,
        isAdmin,
        address: callerAddress
      };
    } catch (error) {
      throw new Error(`Failed to check roles: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

    async getOperatorInfo(operatorAddress: string): Promise<OperatorResponse> {
        const formattedAddress = this.validateAndFormatAddress(operatorAddress);
        
        const operatorInfo = await this.contract.getOperatorInfo(formattedAddress);
        const reputationBalance = await this.contract.getReputation(formattedAddress);

        return {
            address: formattedAddress,
            registered: operatorInfo.registered,
            reputationBalance: reputationBalance.toString() // Convert BigInt to string
        };
    }

  async registerOperator(registerData: RegisterOperatorRequest): Promise<string> {
    const formattedAddress = this.validateAndFormatAddress(registerData.operator);
    
    const tx = await this.contract.registerOperator(formattedAddress);
    await tx.wait();
    return tx.hash;
  }

  async spendTokens(spendData: SpendTokensRequest): Promise<string> {
    const amount = ethers.parseEther(spendData.amount);
    
    const tx = await this.contract.spendTokens({ value: amount });
    await tx.wait();
    return tx.hash;
  }

  async penalizeOperator(penalizeData: PenalizeOperatorRequest): Promise<string> {
    const formattedAddress = this.validateAndFormatAddress(penalizeData.operator);
    
    // Get reputation token decimals for proper formatting
    const reputationTokenAddress = await this.contract.reputationToken();
    const tokenAbi = ["function decimals() view returns (uint8)"];
    const tokenContract = new ethers.Contract(reputationTokenAddress, tokenAbi, this.provider);
    const decimals = await tokenContract.decimals();
    
    const penaltyAmount = ethers.parseUnits(penalizeData.penalty, decimals);
    
    const tx = await this.contract.penalizeOperator(formattedAddress, penaltyAmount);
    await tx.wait();
    return tx.hash;
  }

  async addAdmin(adminData: AddAdminRequest): Promise<string> {
    const formattedAddress = this.validateAndFormatAddress(adminData.newAdmin);
    
    const tx = await this.contract.addAdmin(formattedAddress);
    await tx.wait();
    return tx.hash;
  }

  async removeAdmin(removeData: RemoveAdminRequest): Promise<string> {
    const formattedAddress = this.validateAndFormatAddress(removeData.adminToRemove);
    
    const tx = await this.contract.removeAdmin(formattedAddress);
    await tx.wait();
    return tx.hash;
  }

    async getOperatorStats(): Promise<OperatorStats> {
        try {
            // Get reputation token info
            const reputationTokenAddress = await this.contract.reputationToken();
            const ownerAddress = await this.contract.ownerAddr();
            
            const tokenAbi = [
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)"
            ];
            const tokenContract = new ethers.Contract(reputationTokenAddress, tokenAbi, this.provider);
            
            const symbol = await tokenContract.symbol();
            const decimals = await tokenContract.decimals();

            // Note: We can't easily get all registered operators without events
            // This would require querying past events or maintaining a separate list
            return {
            totalOperators: 0, // Would need event querying to get accurate count
            registeredOperators: [], // Would need event querying
            contractOwner: ownerAddress,
            reputationTokenAddress,
            reputationTokenSymbol: symbol,
            reputationTokenDecimals: Number(decimals) // Convert BigInt to number
            };
        } catch (error) {
            throw new Error(`Failed to get operator stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

async getContractBalance(): Promise<string> {
  const balance = await this.provider.getBalance(this.contract.target);
  return ethers.formatEther(balance); // This already converts to string
}
  async validateContract(): Promise<{ exists: boolean; codeSize: number; hasRequiredFunctions: boolean }> {
    try {
      const code = await this.provider.getCode(this.contract.target);
      const exists = code !== '0x';
      
      let hasRequiredFunctions = false;
      try {
        await this.contract.ownerAddr();
        hasRequiredFunctions = true;
      } catch (error) {
        // Contract might not have required functions
      }
      
      return {
        exists,
        codeSize: code.length - 2,
        hasRequiredFunctions
      };
    } catch (error) {
      throw new Error(`Contract validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  async approveReputationTokens(amount?: string): Promise<string> {
    try {
      // Get reputation token address
      const reputationTokenAddress = await this.contract.reputationToken();
      
      // ERC20 ABI for approve function
      const erc20Abi = [
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function decimals() view returns (uint8)",
        "function allowance(address owner, address spender) view returns (uint256)"
      ];
      
      const tokenContract = new ethers.Contract(reputationTokenAddress, erc20Abi, this.wallet);
      const decimals = await tokenContract.decimals();
      
      // Default to approving 1000 tokens (enough for 2 registrations)
      const approvalAmount = amount ? 
        ethers.parseUnits(amount, decimals) : 
        ethers.parseUnits("1000", decimals);
      
      const tx = await tokenContract.approve(this.contract.target, approvalAmount);
      await tx.wait();
      
      return tx.hash;
    } catch (error) {
      throw new Error(`Failed to approve tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTokenAllowance(): Promise<string> {
    try {
      const reputationTokenAddress = await this.contract.reputationToken();
      const erc20Abi = [
        "function allowance(address owner, address spender) view returns (uint256)",
        "function decimals() view returns (uint8)"
      ];
      
      const tokenContract = new ethers.Contract(reputationTokenAddress, erc20Abi, this.provider);
      const decimals = await tokenContract.decimals();
      const allowance = await tokenContract.allowance(this.wallet.address, this.contract.target);
      
      return ethers.formatUnits(allowance, decimals);
    } catch (error) {
      throw new Error(`Failed to get allowance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getReputation(operatorAddress: string): Promise<string> {
    const formattedAddress = this.validateAndFormatAddress(operatorAddress);
    
    const reputationBalance = await this.contract.getReputation(formattedAddress);
    return reputationBalance.toString();
  }
}

