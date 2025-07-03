import { ethers } from 'ethers';
import { 
  AuthorizationResponse, 
  PreAuthorizationStatus,
  ZoneType,
  CheckRouteAuthorizationRequest,
  RequestRouteAuthorizationRequest,
} from '../types/routePermission.types';

export class RoutePermissionService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.ROUTE_PERMISSION_ADDRESS;

    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_1 environment variable is required');
    }
    if (!contractAddress) {
      throw new Error('ROUTE_PERMISSION_ADDRESS environment variable is required');
    }

    console.log('Initializing RoutePermissionService with:');
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Updated ABI to match the actual contract structure - only the two main functions
    const abi = [
      "function checkRouteAuthorization((uint256 droneId, (uint8[] zones, uint256 altitudeLimit) route)) external view returns ((uint256 droneId, uint8 preauthorizationStatus, string reason))",
      "function requestRouteAuthorization((uint256 droneId, (uint8[] zones, uint256 altitudeLimit) route)) external returns ((uint256 droneId, uint8 preauthorizationStatus, string reason))",
      "event RouteAuthorizationRequested(uint256 indexed droneId, uint8 status)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  private validateZoneTypes(zones: ZoneType[]): void {
    for (const zone of zones) {
      if (!Object.values(ZoneType).includes(zone)) {
        throw new Error(`Invalid zone type: ${zone}`);
      }
    }
  }

  async checkRouteAuthorization(request: CheckRouteAuthorizationRequest): Promise<AuthorizationResponse> {
    try {
      console.log('Checking route authorization for request:', request);

      // Validate input
      if (!request.droneId || request.droneId < 1) {
        throw new Error('Valid drone ID is required');
      }

      if (!request.zones || request.zones.length === 0) {
        throw new Error('At least one zone must be specified');
      }

      this.validateZoneTypes(request.zones);

      // Create the request structure exactly as the contract expects
      const contractRequest = {
        droneId: request.droneId,
        route: {
          zones: request.zones,
          altitudeLimit: request.altitudeLimit || 0
        }
      };

      console.log('Calling contract with:', contractRequest);

      const response = await this.contract.checkRouteAuthorization(contractRequest);
      
      console.log('Raw contract response:', response);

      // Handle the response structure - it should be a tuple
      const result = {
        droneId: Number(response[0] || response.droneId),
        preauthorizationStatus: Number(response[1] || response.preauthorizationStatus) as PreAuthorizationStatus,
        reason: response[2] || response.reason || ''
      };

      console.log('Formatted response:', result);
      return result;

    } catch (error) {
      console.error('Error in checkRouteAuthorization:', error);
      throw new Error(`Failed to check route authorization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async requestRouteAuthorization(request: RequestRouteAuthorizationRequest): Promise<{ response: AuthorizationResponse; txHash: string }> {
    try {
      console.log('Requesting route authorization for:', request);

      // Validate input
      if (!request.droneId || request.droneId < 1) {
        throw new Error('Valid drone ID is required');
      }

      if (!request.zones || request.zones.length === 0) {
        throw new Error('At least one zone must be specified');
      }

      this.validateZoneTypes(request.zones);

      // Create the request structure
      const contractRequest = {
        droneId: request.droneId,
        route: {
          zones: request.zones,
          altitudeLimit: request.altitudeLimit || 0
        }
      };

      console.log('Sending transaction with:', contractRequest);

      // Get the current nonce to avoid nonce conflicts
      const nonce = await this.wallet.getNonce();
      console.log('Using nonce:', nonce);

      const tx = await this.contract.requestRouteAuthorization(contractRequest, {
        nonce: nonce
      });
      console.log('Transaction sent:', tx.hash);

      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt.hash);

      // Get the authorization response by calling the view function
      const response = await this.contract.checkRouteAuthorization(contractRequest);

      const result = {
        droneId: Number(response[0] || response.droneId),
        preauthorizationStatus: Number(response[1] || response.preauthorizationStatus) as PreAuthorizationStatus,
        reason: response[2] || response.reason || ''
      };

      return {
        response: result,
        txHash: tx.hash
      };

    } catch (error) {
      console.error('Error in requestRouteAuthorization:', error);
      throw new Error(`Failed to request route authorization: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
