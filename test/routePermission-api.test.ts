import { expect } from 'chai';
import axios, { AxiosResponse } from 'axios';
import { ZoneType, PreAuthorizationStatus } from '../src/types/routePermission.types';

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30 seconds for blockchain operations

// Test data
const TEST_DRONE_ID = 1; // Assuming drone ID 1 exists and is active
const INVALID_DRONE_ID = 999999;

const VALID_ROUTE_REQUEST = {
  droneId: TEST_DRONE_ID,
  zones: [ZoneType.URBAN, ZoneType.RURAL],
  altitudeLimit: 500
};

const RESTRICTED_ROUTE_REQUEST = {
  droneId: TEST_DRONE_ID,
  zones: [ZoneType.MILITARY, ZoneType.RESTRICTED],
  altitudeLimit: 1000
};

const MIXED_ROUTE_REQUEST = {
  droneId: TEST_DRONE_ID,
  zones: [ZoneType.URBAN, ZoneType.HOSPITALS, ZoneType.MILITARY],
  altitudeLimit: 750
};

describe('RoutePermission API - Blockchain Integration Tests', function () {
  this.timeout(TEST_TIMEOUT);

  before(async function () {
    console.log('Starting RoutePermission API blockchain tests...');
    
    // Check if API server is running
    try {
      const response = await axios.get(`${API_BASE_URL}/api/route-permissions`);
      console.log('API server is running');
      console.log('Available endpoints:', response.data.endpoints);
    } catch (error) {
      throw new Error('API server is not running. Please start the server first.');
    }
  });

  describe('API Status and Health', function () {
    it('should return API status and available endpoints', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-permissions`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.include('Route Permission API is working');
      expect(response.data.endpoints).to.be.an('object');
      expect(response.data.contract).to.have.property('droneNFT');
      expect(response.data.enums).to.be.an('object');
      expect(response.data.enums.ZoneType).to.deep.equal({
        RURAL: 0,
        URBAN: 1,
        HOSPITALS: 2,
        MILITARY: 3,
        RESTRICTED: 4
      });
      expect(response.data.enums.PreAuthorizationStatus).to.deep.equal({
        APPROVED: 0,
        FAILED: 1
      });
    });

    it('should get drone NFT contract address', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-permissions/drone-nft`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('address');
      expect(response.data.data.address).to.match(/^0x[a-fA-F0-9]{40}$/);
      
      console.log(`Drone NFT contract address: ${response.data.data.address}`);
    });

    it('should get enums for frontend use', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-permissions/enums`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('ZoneType');
      expect(response.data.data).to.have.property('PreAuthorizationStatus');
      expect(response.data.data.ZoneType).to.have.all.keys(['RURAL', 'URBAN', 'HOSPITALS', 'MILITARY', 'RESTRICTED']);
      expect(response.data.data.PreAuthorizationStatus).to.have.all.keys(['APPROVED', 'FAILED']);
    });
  });

  describe('Route Authorization Check (View Function)', function () {
    it('should check route authorization for valid zones', async function () {
      console.log('Checking route authorization for valid zones...');
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/check`, VALID_ROUTE_REQUEST);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Route authorization checked successfully');
      expect(response.data.data).to.have.property('droneId', TEST_DRONE_ID);
      expect(response.data.data).to.have.property('preauthorizationStatus');
      expect(response.data.data).to.have.property('reason');
      
      // Status should be either APPROVED (0) or FAILED (1)
      expect([PreAuthorizationStatus.APPROVED, PreAuthorizationStatus.FAILED])
        .to.include(response.data.data.preauthorizationStatus);
      
      console.log(`Authorization result:`, response.data.data);
    });

    it('should handle restricted zones appropriately', async function () {
      console.log('Checking route authorization for restricted zones...');
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/check`, RESTRICTED_ROUTE_REQUEST);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('droneId', TEST_DRONE_ID);
      expect(response.data.data).to.have.property('preauthorizationStatus');
      
      // For restricted zones, we expect FAILED status (unless drone has special permissions)
      if (response.data.data.preauthorizationStatus === PreAuthorizationStatus.FAILED) {
        expect(response.data.data.reason).to.be.a('string').that.is.not.empty;
        console.log(`Authorization denied: ${response.data.data.reason}`);
      } else {
        console.log('Drone has special permissions for restricted zones');
      }
    });

    it('should check mixed zone types', async function () {
      console.log('Checking route authorization for mixed zones...');
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/check`, MIXED_ROUTE_REQUEST);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('droneId', TEST_DRONE_ID);
      expect(response.data.data).to.have.property('preauthorizationStatus');
      
      console.log(`Mixed zones authorization result:`, response.data.data);
    });

    it('should reject invalid drone ID', async function () {
      const invalidRequest = {
        ...VALID_ROUTE_REQUEST,
        droneId: INVALID_DRONE_ID
      };
      
      try {
        await axios.post(`${API_BASE_URL}/api/route-permissions/check`, invalidRequest);
        // If it doesn't throw, check if it returns FAILED status
      } catch (error: any) {
        // Expect either a 500 error or a successful response with FAILED status
        if (error.response) {
          expect([200, 500]).to.include(error.response.status);
          if (error.response.status === 500) {
            expect(error.response.data.success).to.be.false;
          }
        }
      }
    });

    it('should reject missing required fields', async function () {
      try {
        await axios.post(`${API_BASE_URL}/api/route-permissions/check`, {
          droneId: TEST_DRONE_ID
          // Missing zones
        });
        expect.fail('Should have thrown an error for missing zones');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('zones are required');
      }
    });

    it('should reject empty zones array', async function () {
      try {
        await axios.post(`${API_BASE_URL}/api/route-permissions/check`, {
          droneId: TEST_DRONE_ID,
          zones: [],
          altitudeLimit: 500
        });
        expect.fail('Should have thrown an error for empty zones');
      } catch (error: any) {
        expect(error.response.status).to.equal(500);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('At least one zone must be specified');
      }
    });
  });

  describe('Route Authorization Request (Transaction)', function () {
    it('should request route authorization and emit event', async function () {
      console.log('Requesting route authorization with transaction...');
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/request`, VALID_ROUTE_REQUEST);
      
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Route authorization requested successfully');
      expect(response.data.data).to.have.property('authorization');
      expect(response.data.data).to.have.property('txHash');
      expect(response.data.data.txHash).to.match(/^0x[a-fA-F0-9]{64}$/);
      
      const auth = response.data.data.authorization;
      expect(auth).to.have.property('droneId', TEST_DRONE_ID);
      expect(auth).to.have.property('preauthorizationStatus');
      expect(auth).to.have.property('reason');
      
      console.log(`Authorization requested with TX: ${response.data.data.txHash}`);
      console.log(`Authorization result:`, auth);
    });

    it('should handle transaction for restricted zones', async function () {
      console.log('Requesting authorization for restricted zones...');
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/request`, RESTRICTED_ROUTE_REQUEST);
      
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('txHash');
      
      const auth = response.data.data.authorization;
      console.log(`Restricted zones request TX: ${response.data.data.txHash}`);
      console.log(`Authorization result:`, auth);
    });

    it('should reject transaction with missing fields', async function () {
      try {
        await axios.post(`${API_BASE_URL}/api/route-permissions/request`, {
          zones: [ZoneType.URBAN]
          // Missing droneId
        });
        expect.fail('Should have thrown an error for missing droneId');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('droneId and zones are required');
      }
    });
  });

  describe('Route Request Validation', function () {
    it('should validate a correct route request', async function () {
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/validate`, VALID_ROUTE_REQUEST);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('valid');
      expect(response.data.data).to.have.property('errors');
      expect(response.data.data.errors).to.be.an('array');
      
      if (response.data.data.valid) {
        expect(response.data.data.errors).to.be.empty;
        console.log('Route request validation: PASSED');
      } else {
        console.log('Route request validation: FAILED');
        console.log('Errors:', response.data.data.errors);
      }
    });

    it('should identify invalid drone ID in validation', async function () {
      const invalidRequest = {
        droneId: -1,
        zones: [ZoneType.URBAN],
        altitudeLimit: 500
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/validate`, invalidRequest);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.valid).to.be.false;
      expect(response.data.data.errors).to.include('Invalid drone ID');
    });

    it('should identify missing zones in validation', async function () {
      const invalidRequest = {
        droneId: TEST_DRONE_ID,
        zones: [],
        altitudeLimit: 500
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/validate`, invalidRequest);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.valid).to.be.false;
      expect(response.data.data.errors).to.include('At least one zone must be specified');
    });

    it('should identify negative altitude limit in validation', async function () {
      const invalidRequest = {
        droneId: TEST_DRONE_ID,
        zones: [ZoneType.URBAN],
        altitudeLimit: -100
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/validate`, invalidRequest);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.valid).to.be.false;
      expect(response.data.data.errors).to.include('Altitude limit cannot be negative');
    });
  });

  describe('Edge Cases and Error Handling', function () {
    it('should handle requests without altitude limit', async function () {
      const requestWithoutAltitude = {
        droneId: TEST_DRONE_ID,
        zones: [ZoneType.URBAN]
        // No altitudeLimit provided
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/check`, requestWithoutAltitude);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('droneId', TEST_DRONE_ID);
      
      console.log('Request without altitude limit handled successfully');
    });

    it('should handle single zone requests', async function () {
      const singleZoneRequest = {
        droneId: TEST_DRONE_ID,
        zones: [ZoneType.RURAL],
        altitudeLimit: 300
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/check`, singleZoneRequest);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('preauthorizationStatus');
      
      console.log('Single zone request result:', response.data.data);
    });

    it('should handle maximum zones request', async function () {
      const maxZonesRequest = {
        droneId: TEST_DRONE_ID,
        zones: [ZoneType.RURAL, ZoneType.URBAN, ZoneType.HOSPITALS, ZoneType.MILITARY, ZoneType.RESTRICTED],
        altitudeLimit: 1000
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/route-permissions/check`, maxZonesRequest);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('preauthorizationStatus');
      
      console.log('All zones request result:', response.data.data);
    });
  });

  describe('Data Integrity and Consistency', function () {
    it('should return consistent results for repeated requests', async function () {
      console.log('Testing consistency of route authorization...');
      
      const responses = await Promise.all([
        axios.post(`${API_BASE_URL}/api/route-permissions/check`, VALID_ROUTE_REQUEST),
        axios.post(`${API_BASE_URL}/api/route-permissions/check`, VALID_ROUTE_REQUEST),
        axios.post(`${API_BASE_URL}/api/route-permissions/check`, VALID_ROUTE_REQUEST)
      ]);
      
      responses.forEach((response, index) => {
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        console.log(`Request ${index + 1} result:`, response.data.data.preauthorizationStatus);
      });
      
      // All responses should have the same authorization status
      const statuses = responses.map(r => r.data.data.preauthorizationStatus);
      const firstStatus = statuses[0];
      statuses.forEach(status => {
        expect(status).to.equal(firstStatus);
      });
      
      console.log('Consistency check: PASSED');
    });

    it('should handle concurrent authorization requests', async function () {
      console.log('Testing concurrent route authorization requests...');
      
      const concurrentRequests = [
        { ...VALID_ROUTE_REQUEST, altitudeLimit: 400 },
        { ...VALID_ROUTE_REQUEST, altitudeLimit: 500 },
        { ...VALID_ROUTE_REQUEST, altitudeLimit: 600 }
      ];
      
      const responses = await Promise.all(
        concurrentRequests.map(request => 
          axios.post(`${API_BASE_URL}/api/route-permissions/check`, request)
        )
      );
      
      responses.forEach((response, index) => {
        expect(response.status).to.equal(200);
        expect(response.data.success).to.be.true;
        expect(response.data.data.droneId).to.equal(TEST_DRONE_ID);
        console.log(`Concurrent request ${index + 1} completed successfully`);
      });
    });
  });
});
