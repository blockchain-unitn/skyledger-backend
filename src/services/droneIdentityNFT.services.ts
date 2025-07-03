import { ethers } from 'ethers';
import { 
  Drone, 
  DroneType, 
  ZoneType, 
  DroneStatus, 
  DroneResponse, 
  MintDroneRequest,
  UpdateCertHashesRequest,
  UpdatePermittedZonesRequest,
  UpdateOwnerHistoryRequest,
  UpdateMaintenanceHashRequest,
  UpdateStatusRequest
} from '../types/droneIdentityNFT.types';

export class DronesService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.DRONE_IDENTITY_NFT_ADDRESS;

    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_1 environment variable is required');
    }
    if (!contractAddress) {
      throw new Error('DRONE_NFT_ADDRESS environment variable is required');
    }

    console.log('Initializing DronesService with:');
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const abi = [
      "function mint(address to, string memory serialNumber, string memory model, uint8 droneType, string[] memory certHashes, uint8[] memory permittedZones, string[] memory ownerHistory, string memory maintenanceHash, uint8 status) external returns (uint256)",
      "function getDroneData(uint256 tokenId) external view returns (tuple(string serialNumber, string model, uint8 droneType, string[] certHashes, uint8[] permittedZones, string[] ownerHistory, string maintenanceHash, uint8 status))",
      "function updateCertHashes(uint256 tokenId, string[] memory newCertHashes) external",
      "function updatePermittedZones(uint256 tokenId, uint8[] memory newZones) external",
      "function updateOwnerHistory(uint256 tokenId, string[] memory newOwnerHistory) external",
      "function updateMaintenanceHash(uint256 tokenId, string memory newHash) external",
      "function updateStatus(uint256 tokenId, uint8 newStatus) external",
      "function burnDrone(uint256 tokenId) external",
      "function getAllDrones() external view returns (uint256[] memory)",
      "function ownerOf(uint256 tokenId) external view returns (address)",
      "function totalSupply() external view returns (uint256)",
      "function tokenByIndex(uint256 index) external view returns (uint256)",
      "function balanceOf(address owner) external view returns (uint256)",
      "function tokenOfOwnerByIndex(address owner, uint256 index) external view returns (uint256)",
      "function transferFrom(address from, address to, uint256 tokenId) external",
      "function approve(address to, uint256 tokenId) external",
      "function getApproved(uint256 tokenId) external view returns (address)",
      "function setApprovalForAll(address operator, bool approved) external",
      "function isApprovedForAll(address owner, address operator) external view returns (bool)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }
  // Add this method to debug
    async checkContractOwnership(): Promise<{ isOwner: boolean; owner: string; caller: string }> {
        try {
            // Add owner() function to ABI temporarily
            const ownerAbi = ["function owner() public view returns (address)"];
            const ownerContract = new ethers.Contract(this.contract.target, ownerAbi, this.provider);
            
            const contractOwner = await ownerContract.owner();
            const callerAddress = this.wallet.address;
            
            return {
            isOwner: contractOwner.toLowerCase() === callerAddress.toLowerCase(),
            owner: contractOwner,
            caller: callerAddress
            };
        } catch (error) {
            throw new Error(`Failed to check ownership: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

  private formatDroneForResponse(tokenId: number, drone: Drone, owner: string): DroneResponse {
    return {
      tokenId,
      owner,
      serialNumber: drone.serialNumber,
      model: drone.model,
      droneType: DroneType[drone.droneType],
      certHashes: drone.certHashes,
      permittedZones: drone.permittedZones.map(zone => ZoneType[zone]),
      ownerHistory: drone.ownerHistory,
      maintenanceHash: drone.maintenanceHash,
      status: DroneStatus[drone.status]
    };
  }

    private validateAndFormatAddress(address: string): string {
        try {
            return ethers.getAddress(address);
        } catch (error) {
            throw new Error(`Invalid address format: ${address}`);
        }
        }

    async mintDrone(droneData: MintDroneRequest): Promise<{ tokenId: number; txHash: string }> {
    const recipientAddress = this.wallet.address;
    
    const tx = await this.contract.mint(
        recipientAddress,
        droneData.serialNumber,
        droneData.model,
        droneData.droneType,
        droneData.certHashes,
        droneData.permittedZones,
        droneData.ownerHistory,
        droneData.maintenanceHash,
        droneData.status
    );

    const receipt = await tx.wait();
    
    // Get token ID from Transfer event
    const transferEvent = receipt.logs.find((log: any) => 
        log.topics[0] === ethers.id('Transfer(address,address,uint256)')
    );
    const tokenId = transferEvent ? Number(transferEvent.topics[3]) : 0;

    return { tokenId, txHash: tx.hash };
    }

  async getDroneData(tokenId: number): Promise<DroneResponse> {
    const drone = await this.contract.getDroneData(tokenId);
    const owner = await this.contract.ownerOf(tokenId);
    
    return this.formatDroneForResponse(tokenId, drone, owner);
  }

  async getAllDrones(): Promise<DroneResponse[]> {
    const tokenIds = await this.contract.getAllDrones();
    const drones: DroneResponse[] = [];

    for (const tokenId of tokenIds) {
      try {
        const drone = await this.getDroneData(Number(tokenId));
        drones.push(drone);
      } catch (error) {
        // Token might have been burned, skip it
        continue;
      }
    }

    return drones;
  }

  async getTotalSupply(): Promise<number> {
    const total = await this.contract.totalSupply();
    return Number(total);
  }

  async getDronesByOwner(owner: string): Promise<DroneResponse[]> {
    const balance = await this.contract.balanceOf(owner);
    const drones: DroneResponse[] = [];

    for (let i = 0; i < Number(balance); i++) {
      try {
        const tokenId = await this.contract.tokenOfOwnerByIndex(owner, i);
        const drone = await this.getDroneData(Number(tokenId));
        drones.push(drone);
      } catch (error) {
        continue;
      }
    }

    return drones;
  }

  async updateCertHashes(updateData: UpdateCertHashesRequest): Promise<string> {
    const tx = await this.contract.updateCertHashes(updateData.tokenId, updateData.certHashes);
    await tx.wait();
    return tx.hash;
  }

  async updatePermittedZones(updateData: UpdatePermittedZonesRequest): Promise<string> {
    const tx = await this.contract.updatePermittedZones(updateData.tokenId, updateData.permittedZones);
    await tx.wait();
    return tx.hash;
  }

  async updateOwnerHistory(updateData: UpdateOwnerHistoryRequest): Promise<string> {
    const tx = await this.contract.updateOwnerHistory(updateData.tokenId, updateData.ownerHistory);
    await tx.wait();
    return tx.hash;
  }

  async updateMaintenanceHash(updateData: UpdateMaintenanceHashRequest): Promise<string> {
    const tx = await this.contract.updateMaintenanceHash(updateData.tokenId, updateData.maintenanceHash);
    await tx.wait();
    return tx.hash;
  }

  async updateStatus(updateData: UpdateStatusRequest): Promise<string> {
    const tx = await this.contract.updateStatus(updateData.tokenId, updateData.status);
    await tx.wait();
    return tx.hash;
  }

  async burnDrone(tokenId: number): Promise<string> {
    const tx = await this.contract.burnDrone(tokenId);
    await tx.wait();
    return tx.hash;
  }

  async transferDrone(from: string, to: string, tokenId: number): Promise<string> {
    const tx = await this.contract.transferFrom(from, to, tokenId);
    await tx.wait();
    return tx.hash;
  }

  async getOwner(tokenId: number): Promise<string> {
    return await this.contract.ownerOf(tokenId);
  }
}