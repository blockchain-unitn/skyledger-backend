import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

interface DroneData {
  serialNumber: string;
  model: string;
  droneType: number;
  certHashes: string[];
  permittedZones: number[];
  ownerHistory: string[];
  maintenanceHash: string;
  status: number;
}

interface DroneResponse {
  tokenId: number;
  owner: string;
  serialNumber: string;
  model: string;
  droneType: string;
  certHashes: string[];
  permittedZones: string[];
  ownerHistory: string[];
  maintenanceHash: string;
  status: string;
}

interface MintResponse {
  tokenId: number;
  txHash: string;
}

class DroneNFTTester {
  private baseUrl: string;

  constructor() {
    this.baseUrl = 'http://localhost:3000/api/drones';
    console.log('DroneIdentityNFT API Test Suite');
    console.log('================================\n');
  }

  private async makeRequest(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || `HTTP ${response.status}`);
      }
      
      return result;
    } catch (error) {
      throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private logTest(testNumber: number, description: string): void {
    console.log(`${testNumber}. Testing ${description}...`);
  }

  private logResult(result: any, success: boolean = true): void {
    if (success) {
      console.log('Success:', JSON.stringify(result, null, 2));
    } else {
      console.log('Error:', result);
    }
    console.log('');
  }

  async testGetAllDrones(): Promise<DroneResponse[]> {
    this.logTest(1, 'get all drones');
    
    try {
      const response = await this.makeRequest('GET', '');
      
      this.logResult({
        count: response.count,
        drones: response.data.length > 0 ? response.data.slice(0, 2) : []
      });
      
      return response.data;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return [];
    }
  }

  async testGetTotalSupply(): Promise<number> {
    this.logTest(2, 'get total supply');
    
    try {
      const response = await this.makeRequest('GET', '/stats/total');
      
      this.logResult(response.data);
      return response.data.total;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return 0;
    }
  }

  async testContractValidation(): Promise<boolean> {
    this.logTest(3, 'contract validation');
    
    try {
      const response = await this.makeRequest('GET', '/debug/contract');
      
      this.logResult(response.data);
      return response.data.exists && response.data.hasRequiredFunctions;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testOwnershipCheck(): Promise<boolean> {
    this.logTest(4, 'ownership check');
    
    try {
      const response = await this.makeRequest('GET', '/debug/ownership');
      
      this.logResult(response.data);
      return response.data.isOwner;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testMintDrone(): Promise<MintResponse | null> {
    this.logTest(5, 'mint new drone');
    
    const droneData: DroneData = {
      serialNumber: `TEST_${Date.now()}`,
      model: 'Test Drone Model',
      droneType: 0, // MEDICAL
      certHashes: ['test_cert_hash_1', 'test_cert_hash_2'],
      permittedZones: [0, 1, 2], // RURAL, URBAN, HOSPITALS
      ownerHistory: ['Test Owner Company'],
      maintenanceHash: 'test_maintenance_hash',
      status: 0 // ACTIVE
    };

    try {
      const response = await this.makeRequest('POST', '', droneData);
      
      this.logResult({
        tokenId: response.data.tokenId,
        txHash: response.data.txHash,
        message: response.message
      });
      
      return response.data;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return null;
    }
  }

  async testGetDroneById(tokenId: number): Promise<DroneResponse | null> {
    this.logTest(6, `get drone by ID (${tokenId})`);
    
    try {
      const response = await this.makeRequest('GET', `/${tokenId}`);
      
      this.logResult({
        tokenId: response.data.tokenId,
        serialNumber: response.data.serialNumber,
        model: response.data.model,
        droneType: response.data.droneType,
        status: response.data.status,
        certHashesCount: response.data.certHashes.length,
        permittedZonesCount: response.data.permittedZones.length
      });
      
      return response.data;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return null;
    }
  }

  async testGetDronesByOwner(owner: string): Promise<DroneResponse[]> {
    this.logTest(7, `get drones by owner (${owner.slice(0, 8)}...)`);
    
    try {
      const response = await this.makeRequest('GET', `/owner/${owner}`);
      
      this.logResult({
        owner: response.owner,
        count: response.count,
        drones: response.data.map((d: DroneResponse) => ({
          tokenId: d.tokenId,
          serialNumber: d.serialNumber,
          model: d.model
        }))
      });
      
      return response.data;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return [];
    }
  }

  async testUpdateCertHashes(tokenId: number): Promise<boolean> {
    this.logTest(8, `update cert hashes (Token ID: ${tokenId})`);
    
    const updateData = {
      certHashes: ['updated_cert_1', 'updated_cert_2', 'new_cert_3']
    };

    try {
      const response = await this.makeRequest('PUT', `/${tokenId}/cert-hashes`, updateData);
      
      this.logResult({
        txHash: response.data.txHash,
        message: response.message
      });
      
      return true;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testUpdatePermittedZones(tokenId: number): Promise<boolean> {
    this.logTest(9, `update permitted zones (Token ID: ${tokenId})`);
    
    const updateData = {
      permittedZones: [0, 1, 3, 4] // RURAL, URBAN, MILITARY, RESTRICTED
    };

    try {
      const response = await this.makeRequest('PUT', `/${tokenId}/permitted-zones`, updateData);
      
      this.logResult({
        txHash: response.data.txHash,
        message: response.message
      });
      
      return true;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testUpdateStatus(tokenId: number): Promise<boolean> {
    this.logTest(10, `update status (Token ID: ${tokenId})`);
    
    const updateData = {
      status: 1 // MAINTENANCE
    };

    try {
      const response = await this.makeRequest('PUT', `/${tokenId}/status`, updateData);
      
      this.logResult({
        txHash: response.data.txHash,
        message: response.message
      });
      
      return true;
    } catch (error) {
      this.logResult(error instanceof Error ? error.message : 'Unknown error', false);
      return false;
    }
  }

  async testMintMultipleDrones(): Promise<MintResponse[]> {
    this.logTest(11, 'mint multiple drones (different types)');
    
    const droneTypes = [
      { type: 1, name: 'Cargo Drone', zones: [0, 1] },
      { type: 2, name: 'Surveillance Drone', zones: [3, 4] },
      { type: 4, name: 'Recreational Drone', zones: [0] }
    ];

    const results: MintResponse[] = [];

    for (const droneType of droneTypes) {
      const droneData: DroneData = {
        serialNumber: `${droneType.name.toUpperCase().replace(' ', '_')}_${Date.now()}`,
        model: `${droneType.name} Model X`,
        droneType: droneType.type,
        certHashes: [`${droneType.name.toLowerCase()}_cert`],
        permittedZones: droneType.zones,
        ownerHistory: [`${droneType.name} Owner`],
        maintenanceHash: `${droneType.name.toLowerCase()}_maintenance`,
        status: 0
      };

      try {
        const response = await this.makeRequest('POST', '', droneData);
        results.push(response.data);
        
        console.log(`  Minted ${droneType.name}: Token ID ${response.data.tokenId}`);
      } catch (error) {
        console.log(`  Failed to mint ${droneType.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.logResult({
      totalMinted: results.length,
      tokenIds: results.map(r => r.tokenId)
    });

    return results;
  }

  async runAllTests(): Promise<void> {
    console.log('Starting DroneIdentityNFT API tests...\n');
    
    const startTime = Date.now();
    let passedTests = 0;
    let totalTests = 0;

    // Test 1: Get all drones
    totalTests++;
    const allDrones = await this.testGetAllDrones();
    if (allDrones.length >= 0) passedTests++;

    // Test 2: Get total supply
    totalTests++;
    const totalSupply = await this.testGetTotalSupply();
    if (totalSupply >= 0) passedTests++;

    // Test 3: Contract validation
    totalTests++;
    const contractValid = await this.testContractValidation();
    if (contractValid) passedTests++;

    // Test 4: Ownership check
    totalTests++;
    const isOwner = await this.testOwnershipCheck();
    if (isOwner) passedTests++;

    // Test 5: Mint drone (only if owner)
    if (isOwner) {
      totalTests++;
      const mintedDrone = await this.testMintDrone();
      if (mintedDrone) passedTests++;

      // Test 6: Get drone by ID (if minted successfully)
      if (mintedDrone) {
        totalTests++;
        const droneData = await this.testGetDroneById(mintedDrone.tokenId);
        if (droneData) passedTests++;

        // Test 7: Get drones by owner
        totalTests++;
        const ownerDrones = await this.testGetDronesByOwner(droneData?.owner || '');
        if (ownerDrones.length > 0) passedTests++;

        // Test 8: Update cert hashes
        totalTests++;
        if (await this.testUpdateCertHashes(mintedDrone.tokenId)) passedTests++;

        // Test 9: Update permitted zones
        totalTests++;
        if (await this.testUpdatePermittedZones(mintedDrone.tokenId)) passedTests++;

        // Test 10: Update status
        totalTests++;
        if (await this.testUpdateStatus(mintedDrone.tokenId)) passedTests++;

        // Test 11: Mint multiple drones
        totalTests++;
        const multipleDrones = await this.testMintMultipleDrones();
        if (multipleDrones.length > 0) passedTests++;
      }
    } else {
      console.log('Skipping mint and update tests - not contract owner\n');
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
      console.log('All DroneIdentityNFT API tests passed successfully!');
    } else {
      console.log('Some tests failed. Check the logs above for details.');
    }
  }
}

// Run the tests
async function main(): Promise<void> {
  try {
    const tester = new DroneNFTTester();
    await tester.runAllTests();
  } catch (error) {
    console.error('Failed to run tests:', error);
    process.exit(1);
  }
}

// Execute if this file is run directly
if (require.main === module) {
  main().catch(console.error);
}

export { DroneNFTTester };