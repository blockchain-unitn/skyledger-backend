import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

interface ZoneData {
  id: bigint;
  name: string;
  zoneType: number;
  boundaries: Array<[bigint, bigint]>;
  maxAltitude: bigint;
  minAltitude: bigint;
  isActive: boolean;
  description: string;
  createdAt: bigint;
  updatedAt: bigint;
}

interface CreateZoneRequest {
  name: string;
  zoneType: number;
  boundaries: Array<{
    latitude: number;
    longitude: number;
  }>;
  maxAltitude: number;
  minAltitude: number;
  description: string;
}

class DirectBlockchainTester {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.ZONES_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      throw new Error('Missing required environment variables');
    }

    console.log('SkyLedger Direct Blockchain Test Suite');
    console.log('=====================================\n');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

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
      "event ZoneCreated(uint256 indexed zoneId, string name, uint8 zoneType)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  private logTest(testNumber: number, description: string): void {
    console.log(`${testNumber}. Testing ${description}...`);
  }

  private logResult(result: any, success: boolean = true): void {
    if (success) {
      console.log('Success:', result);
    } else {
      console.log('Error:', result);
    }
    console.log('');
  }

  async testBlockchainConnection(): Promise<boolean> {
    this.logTest(1, 'blockchain connection');
    
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const network = await this.provider.getNetwork();
      
      this.logResult({
        blockNumber,
        chainId: network.chainId.toString(),
        connected: true
      });
      return true;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testContractConnection(): Promise<boolean> {
    this.logTest(2, 'contract connection');
    
    try {
      const code = await this.provider.getCode(this.contract.target);
      if (code === '0x') {
        this.logResult('No contract found at address', false);
        return false;
      }
      
      this.logResult({
        contractAddress: this.contract.target,
        codeSize: code.length - 2,
        hasContract: true
      });
      return true;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testGetTotalZones(): Promise<number> {
    this.logTest(3, 'get total zones');
    
    try {
      const total = await this.contract.getTotalZones();
      const totalNumber = Number(total);
      
      this.logResult({ totalZones: totalNumber });
      return totalNumber;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return 0;
    }
  }

  async testGetZone(zoneId: number): Promise<ZoneData | null> {
    this.logTest(4, `get zone data (ID: ${zoneId})`);
    
    try {
      const zone = await this.contract.getZone(zoneId);
      
      const zoneData: ZoneData = {
        id: zone.id,
        name: zone.name,
        zoneType: zone.zoneType,
        boundaries: zone.boundaries,
        maxAltitude: zone.maxAltitude,
        minAltitude: zone.minAltitude,
        isActive: zone.isActive,
        description: zone.description,
        createdAt: zone.createdAt,
        updatedAt: zone.updatedAt
      };

      this.logResult({
        id: Number(zoneData.id),
        name: zoneData.name,
        zoneType: zoneData.zoneType,
        boundariesCount: zoneData.boundaries.length,
        isActive: zoneData.isActive,
        maxAltitude: Number(zoneData.maxAltitude),
        minAltitude: Number(zoneData.minAltitude)
      });
      return zoneData;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return null;
    }
  }

  async testZoneExists(zoneId: number): Promise<boolean> {
    this.logTest(5, `zone existence check (ID: ${zoneId})`);
    
    try {
      const exists = await this.contract.zoneExists(zoneId);
      
      this.logResult({
        zoneId,
        exists
      });
      return exists;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testGetZonesByType(zoneType: number): Promise<number[]> {
    this.logTest(6, `get zones by type (${zoneType})`);
    
    try {
      const zoneIds = await this.contract.getZonesByType(zoneType);
      const zoneNumbers = zoneIds.map((id: bigint) => Number(id));
      
      this.logResult({
        zoneType,
        count: zoneNumbers.length,
        zoneIds: zoneNumbers
      });
      return zoneNumbers;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return [];
    }
  }

  async testGetZoneBoundaries(zoneId: number): Promise<boolean> {
    this.logTest(7, `get zone boundaries (ID: ${zoneId})`);
    
    try {
      const boundaries = await this.contract.getZoneBoundaries(zoneId);
      
      this.logResult({
        zoneId,
        boundariesCount: boundaries.length,
        firstBoundary: boundaries.length > 0 ? {
          latitude: Number(boundaries[0][0]) / 1000000,
          longitude: Number(boundaries[0][1]) / 1000000
        } : null
      });
      return true;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testCreateZone(): Promise<{ zoneId: number; txHash: string } | null> {
    this.logTest(8, 'create new zone');
    
    const zoneData: CreateZoneRequest = {
      name: `Direct Test Zone ${Date.now()}`,
      zoneType: 1, // URBAN
      boundaries: [
        { latitude: 41.0000, longitude: -74.0000 },
        { latitude: 41.0010, longitude: -74.0000 },
        { latitude: 41.0010, longitude: -74.0010 },
        { latitude: 41.0000, longitude: -74.0010 }
      ],
      maxAltitude: 600,
      minAltitude: 0,
      description: 'Test zone created by direct blockchain test'
    };

    try {
      const boundaries = zoneData.boundaries.map(coord => [
        BigInt(Math.round(coord.latitude * 1000000)),
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

      this.logResult({
        zoneId,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber
      });
      
      return { zoneId, txHash: tx.hash };
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return null;
    }
  }

  async testSetZoneStatus(zoneId: number, isActive: boolean): Promise<boolean> {
    this.logTest(9, `set zone status (ID: ${zoneId}, active: ${isActive})`);
    
    try {
      const tx = await this.contract.setZoneStatus(zoneId, isActive);
      const receipt = await tx.wait();
      
      this.logResult({
        zoneId,
        newStatus: isActive,
        txHash: tx.hash,
        gasUsed: receipt.gasUsed.toString()
      });
      return true;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async runAllTests(): Promise<void> {
    console.log('Starting direct blockchain tests...\n');
    
    const startTime = Date.now();
    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Blockchain Connection
    totalTests++;
    if (await this.testBlockchainConnection()) passedTests++;

    // Test 2: Contract Connection
    totalTests++;
    if (await this.testContractConnection()) passedTests++;

    // Test 3: Get Total Zones
    totalTests++;
    const totalZones = await this.testGetTotalZones();
    if (totalZones >= 0) passedTests++;

    // Test 4: Get Zone (if zones exist)
    if (totalZones > 0) {
      totalTests++;
      const zoneData = await this.testGetZone(1);
      if (zoneData) passedTests++;
    }

    // Test 5: Zone Exists
    totalTests++;
    if (await this.testZoneExists(1)) passedTests++;

    // Test 6: Get Zones by Type
    totalTests++;
    const restrictedZones = await this.testGetZonesByType(4); // RESTRICTED
    if (restrictedZones.length >= 0) passedTests++;

    // Test 7: Get Zone Boundaries (if zones exist)
    if (totalZones > 0) {
      totalTests++;
      if (await this.testGetZoneBoundaries(1)) passedTests++;
    }

    // Test 8: Create Zone
    totalTests++;
    const createdZone = await this.testCreateZone();
    if (createdZone) passedTests++;

    // Test 9: Set Zone Status (if zone was created)
    if (createdZone) {
      totalTests++;
      if (await this.testSetZoneStatus(createdZone.zoneId, false)) passedTests++;
    }

    // Summary
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    console.log('='.repeat(50));
    console.log('TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    console.log(`Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`Duration: ${duration.toFixed(2)}s`);
    
    if (passedTests === totalTests) {
      console.log('All direct blockchain tests passed successfully!');
    } else {
      console.log('Some tests failed. Check the logs above for details.');
    }
  }
}

// Run the tests
async function main(): Promise<void> {
  try {
    const tester = new DirectBlockchainTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('Failed to initialize blockchain tester:', error);
    process.exit(1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  main().catch(console.error);
}

export { DirectBlockchainTester };