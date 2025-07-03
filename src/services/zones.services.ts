import { ethers } from 'ethers';
import { Zone, ZoneType, CreateZoneRequest, UpdateZoneRequest, ZoneResponse } from '../types/zones.types';

export class ZonesService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.ZONES_ADDRESS;

    // Better error messages for missing environment variables
    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_1 environment variable is required');
    }
    if (!contractAddress) {
      throw new Error('ZONES_ADDRESS environment variable is required');
    }

    console.log('Initializing ZonesService with:');
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    // Contract ABI (simplified for the main functions)
    const abi = [
      "function createZone(string memory name, uint8 zoneType, (int256,int256)[] memory boundaries, uint256 maxAltitude, uint256 minAltitude, string memory description) public returns (uint256)",
      "function updateZone(uint256 zoneId, string memory name, (int256,int256)[] memory boundaries, uint256 maxAltitude, uint256 minAltitude, string memory description) public",
      "function setZoneStatus(uint256 zoneId, bool isActive) public",
      "function deleteZone(uint256 zoneId) public",
      "function getZone(uint256 zoneId) public view returns (tuple(uint256 id, string name, uint8 zoneType, (int256,int256)[] boundaries, uint256 maxAltitude, uint256 minAltitude, bool isActive, string description, uint256 createdAt, uint256 updatedAt))",
      "function getZonesByType(uint8 zoneType) public view returns (uint256[] memory)",
      "function getZoneBoundaries(uint256 zoneId) public view returns ((int256,int256)[] memory)",
      "function zoneExists(uint256 zoneId) public view returns (bool)",
      "function getTotalZones() public view returns (uint256)",
      "function getActiveZonesByType(uint8 zoneType) public view returns (uint256[] memory)",
      "event ZoneCreated(uint256 indexed zoneId, string name, uint8 zoneType)",
      "event ZoneUpdated(uint256 indexed zoneId, string name)",
      "event ZoneStatusChanged(uint256 indexed zoneId, bool isActive)",
      "event ZoneDeleted(uint256 indexed zoneId)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  private formatZoneForResponse(zone: Zone): ZoneResponse {
    return {
      id: Number(zone.id),
      name: zone.name,
      zoneType: ZoneType[zone.zoneType],
      boundaries: zone.boundaries.map(coord => ({
        latitude: Number(coord[0]) / 1000000, // Access array elements directly
        longitude: Number(coord[1]) / 1000000  // Access array elements directly
      })),
      maxAltitude: Number(zone.maxAltitude),
      minAltitude: Number(zone.minAltitude),
      isActive: zone.isActive,
      description: zone.description,
      createdAt: Number(zone.createdAt),
      updatedAt: Number(zone.updatedAt)
    };
  }

  async createZone(zoneData: CreateZoneRequest): Promise<{ zoneId: number; txHash: string }> {
    const boundaries = zoneData.boundaries.map(coord => [
      BigInt(Math.round(coord.latitude * 1000000)), // Convert to degrees * 10^6
      BigInt(Math.round(coord.longitude * 1000000))
    ]);

    const tx = await this.contract.createZone(
      zoneData.name,
      zoneData.zoneType,
      boundaries,
      zoneData.maxAltitude,
      zoneData.minAltitude,
      zoneData.description
    );

    const receipt = await tx.wait();
    
    // Get zone ID from event
    const event = receipt.logs.find((log: any) => log.topics[0] === ethers.id('ZoneCreated(uint256,string,uint8)'));
    const zoneId = event ? Number(event.topics[1]) : 0;

    return { zoneId, txHash: tx.hash };
  }

  async getTotalZones(): Promise<number> {
    const total = await this.contract.getTotalZones();
    return Number(total);
  }

  async getAllZones(): Promise<ZoneResponse[]> {
    const totalZones = await this.getTotalZones();
    const zones: ZoneResponse[] = [];

    for (let i = 1; i <= totalZones; i++) {
      try {
        const zone = await this.getZone(i);
        zones.push(zone);
      } catch (error) {
        // Zone might have been deleted, skip it
        continue;
      }
    }

    return zones;
  }

  async getZone(zoneId: number): Promise<ZoneResponse> {
    const zone = await this.contract.getZone(zoneId);
    return this.formatZoneForResponse(zone);
  }

  async zoneExists(zoneId: number): Promise<boolean> {
    return await this.contract.zoneExists(zoneId);
  }

  async getZonesByType(zoneType: ZoneType): Promise<number[]> {
    const zoneIds = await this.contract.getZonesByType(zoneType);
    return zoneIds.map((id: bigint) => Number(id));
  }

  async getActiveZonesByType(zoneType: ZoneType): Promise<number[]> {
    const zoneIds = await this.contract.getActiveZonesByType(zoneType);
    return zoneIds.map((id: bigint) => Number(id));
  }

  async getZoneBoundaries(zoneId: number): Promise<{ latitude: number; longitude: number }[]> {
    const boundaries = await this.contract.getZoneBoundaries(zoneId);
    return boundaries.map((coord: any) => ({
      latitude: Number(coord[0]) / 1000000,
      longitude: Number(coord[1]) / 1000000
    }));
  }
}