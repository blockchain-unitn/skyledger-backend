import { expect } from 'chai';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

describe('DroneIdentityNFT API - Simple Tests', () => {
  let testTokenId: number;
  const testAddress = '0x1234567890123456789012345678901234567890';

  before(async () => {
    // Wait for server to be ready
    let serverReady = false;
    let attempts = 0;
    while (!serverReady && attempts < 10) {
      try {
        await axios.get(`${BASE_URL}/health`);
        serverReady = true;
      } catch (error) {
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    if (!serverReady) {
      throw new Error('Server not ready after 10 seconds');
    }
  });

  describe('POST /api/drones/mint - Mint Drone', () => {
    it('should mint a drone successfully', async () => {
      const droneData = {
        to: testAddress,
        serialNumber: 'TEST-001',
        model: 'DJI-TEST',
        droneType: 0, // MEDICAL
        certHashes: ['hash1', 'hash2'],
        permittedZones: [0, 1], // RURAL, URBAN
        ownerHistory: ['Owner1'],
        maintenanceHash: 'maintenance1',
        status: 0 // ACTIVE
      };

      const response = await axios.post(`${BASE_URL}/api/drones/mint`, droneData);
      
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Drone minted successfully');
      expect(response.data.data.tokenId).to.be.a('number');
      
      testTokenId = response.data.data.tokenId;
    });
  });

  describe('GET /api/drones/drone/:tokenId - Get Drone Data', () => {
    it('should retrieve drone data successfully', async () => {
      const response = await axios.get(`${BASE_URL}/api/drones/drone/${testTokenId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Drone data retrieved successfully');
      expect(response.data.data).to.have.property('serialNumber');
      expect(response.data.data).to.have.property('model');
      expect(response.data.data).to.have.property('droneType');
    });
  });

  describe('PUT /api/drones/status/:tokenId - Update Status', () => {
    it('should update drone status successfully', async () => {
      const statusData = { status: 1 }; // MAINTENANCE

      const response = await axios.put(`${BASE_URL}/api/drones/status/${testTokenId}`, statusData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Status updated successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('PUT /api/drones/cert-hashes/:tokenId - Update Certificate Hashes', () => {
    it('should update certificate hashes successfully', async () => {
      const certData = { certHashes: ['newhash1', 'newhash2', 'newhash3'] };

      const response = await axios.put(`${BASE_URL}/api/drones/cert-hashes/${testTokenId}`, certData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Cert hashes updated successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('PUT /api/drones/permitted-zones/:tokenId - Update Permitted Zones', () => {
    it('should update permitted zones successfully', async () => {
      const zoneData = { permittedZones: [0, 1, 2] }; // RURAL, URBAN, HOSPITALS

      const response = await axios.put(`${BASE_URL}/api/drones/permitted-zones/${testTokenId}`, zoneData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Permitted zones updated successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('PUT /api/drones/maintenance-hash/:tokenId - Update Maintenance Hash', () => {
    it('should update maintenance hash successfully', async () => {
      const maintenanceData = { maintenanceHash: 'newMaintenanceHash123' };

      const response = await axios.put(`${BASE_URL}/api/drones/maintenance-hash/${testTokenId}`, maintenanceData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Maintenance hash updated successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('PUT /api/drones/owner-history/:tokenId - Update Owner History', () => {
    it('should update owner history successfully', async () => {
      const historyData = { ownerHistory: ['Owner1', 'Owner2', 'Owner3'] };

      const response = await axios.put(`${BASE_URL}/api/drones/owner-history/${testTokenId}`, historyData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Owner history updated successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('GET /api/drones/all - Get All Drones', () => {
    it('should retrieve all drones successfully', async () => {
      const response = await axios.get(`${BASE_URL}/api/drones/all`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.be.an('array');
      expect(response.data.count).to.be.a('number');
      expect(response.data.data.length).to.equal(response.data.count);
    });
  });
});
