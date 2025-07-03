import { ethers } from 'ethers';
import { 
  Violation,
  ReportViolationRequest,
  ViolationsByDroneResponse,
  AllViolationsResponse
} from '../types/violationsAlerting.types';

export class ViolationsAlertingService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.VIOLATIONS_ALERTING_ADDRESS;

    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_1 environment variable is required');
    }
    if (!contractAddress) {
      throw new Error('VIOLATIONS_ALERTING_ADDRESS environment variable is required');
    }

    console.log('Initializing ViolationsAlertingService with:');
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // ABI for the ViolationsAlerting contract
    const abi = [
      "function reportViolation(string memory droneID, string memory position) public",
      "function getViolationsCount() public view returns (uint256)",
      "function getViolation(uint256 index) public view returns (string memory, string memory, uint256)",
      "function getViolationsByDrone(string memory targetDroneID) public view returns (string[] memory positions, uint256[] memory timestamps)",
      "function getAllViolations() public view returns (string[] memory droneIDs, string[] memory positions, uint256[] memory timestamps)",
      "event ViolationReported(string indexed droneID, string position, uint256 timestamp)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  async reportViolation(request: ReportViolationRequest): Promise<{ txHash: string }> {
    try {
      console.log('Reporting violation:', request);

      // Validate input
      if (!request.droneID || request.droneID.trim() === '') {
        throw new Error('Valid drone ID is required');
      }
      if (!request.position || request.position.trim() === '') {
        throw new Error('Valid position is required');
      }

      console.log('Sending transaction with:', request);

      // Get the current nonce to avoid nonce conflicts
      const nonce = await this.wallet.getNonce();
      console.log('Using nonce:', nonce);

      const tx = await this.contract.reportViolation(request.droneID, request.position, {
        nonce: nonce
      });
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);

      return {
        txHash: tx.hash
      };

    } catch (error) {
      console.error('Error in reportViolation:', error);
      throw new Error(`Failed to report violation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getViolationsCount(): Promise<number> {
    try {
      console.log('Getting violations count...');
      
      const count = await this.contract.getViolationsCount();
      const result = Number(count);
      
      console.log('Violations count:', result);
      return result;

    } catch (error) {
      console.error('Error in getViolationsCount:', error);
      throw new Error(`Failed to get violations count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getViolation(index: number): Promise<Violation> {
    try {
      console.log('Getting violation at index:', index);

      if (index < 0) {
        throw new Error('Index must be non-negative');
      }

      const response = await this.contract.getViolation(index);
      console.log('Raw contract response:', response);

      const result: Violation = {
        droneID: response[0],
        position: response[1],
        timestamp: Number(response[2])
      };

      console.log('Formatted response:', result);
      return result;

    } catch (error) {
      console.error('Error in getViolation:', error);
      throw new Error(`Failed to get violation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getViolationsByDrone(droneID: string): Promise<ViolationsByDroneResponse> {
    try {
      console.log('Getting violations for drone:', droneID);

      if (!droneID || droneID.trim() === '') {
        throw new Error('Valid drone ID is required');
      }

      const response = await this.contract.getViolationsByDrone(droneID);
      console.log('Raw contract response:', response);

      const result: ViolationsByDroneResponse = {
        positions: response[0] || [],
        timestamps: (response[1] || []).map((ts: any) => Number(ts))
      };

      console.log('Formatted response:', result);
      return result;

    } catch (error) {
      console.error('Error in getViolationsByDrone:', error);
      throw new Error(`Failed to get violations by drone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getAllViolations(): Promise<AllViolationsResponse> {
    try {
      console.log('Getting all violations...');

      const response = await this.contract.getAllViolations();
      console.log('Raw contract response:', response);

      const result: AllViolationsResponse = {
        droneIDs: response[0] || [],
        positions: response[1] || [],
        timestamps: (response[2] || []).map((ts: any) => Number(ts))
      };

      console.log('Formatted response:', result);
      return result;

    } catch (error) {
      console.error('Error in getAllViolations:', error);
      throw new Error(`Failed to get all violations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
