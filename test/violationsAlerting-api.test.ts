import { expect } from 'chai';
import axios, { AxiosResponse } from 'axios';

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30 seconds for blockchain operations

// Test data
const TEST_VIOLATION_1 = {
  droneID: 'DRONE001',
  position: 'lat:45.4642,lng:9.1900'
};

const TEST_VIOLATION_2 = {
  droneID: 'DRONE002', 
  position: 'lat:45.4643,lng:9.1901'
};

const TEST_VIOLATION_3 = {
  droneID: 'DRONE001',
  position: 'lat:45.4644,lng:9.1902'
};

describe('ViolationsAlerting API - Blockchain Integration Tests', function () {
  this.timeout(TEST_TIMEOUT);

  before(async function () {
    console.log('Starting ViolationsAlerting API blockchain tests...');
    
    // Check if API server is running by making a request to main API
    try {
      const response = await axios.get(`${API_BASE_URL}/`);
      console.log('API server is running');
      console.log('Available endpoints:', response.data.endpoints);
    } catch (error) {
      throw new Error('API server is not running. Please start the server first.');
    }
  });

  describe('Report Violation', function () {
    it('should report a violation successfully', async function () {
      console.log('Reporting violation:', TEST_VIOLATION_1);
      
      const response = await axios.post(`${API_BASE_URL}/api/violations/report`, TEST_VIOLATION_1);
      
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.include('Violation reported successfully');
      expect(response.data.data).to.have.property('txHash');
      expect(response.data.data.txHash).to.match(/^0x[a-fA-F0-9]{64}$/);
      
      console.log('Violation reported with txHash:', response.data.data.txHash);
    });

    it('should report multiple violations', async function () {
      const violations = [TEST_VIOLATION_2, TEST_VIOLATION_3];
      
      for (const violation of violations) {
        console.log('Reporting violation:', violation);
        
        const response = await axios.post(`${API_BASE_URL}/api/violations/report`, violation);
        
        expect(response.status).to.equal(201);
        expect(response.data.success).to.be.true;
        expect(response.data.data).to.have.property('txHash');
        
        console.log('Violation reported with txHash:', response.data.data.txHash);
      }
    });

    it('should reject invalid violation (missing droneID)', async function () {
      const invalidViolation = {
        position: 'lat:45.4642,lng:9.1900'
      };

      try {
        await axios.post(`${API_BASE_URL}/api/violations/report`, invalidViolation);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('droneID and position are required');
      }
    });

    it('should reject invalid violation (missing position)', async function () {
      const invalidViolation = {
        droneID: 'DRONE001'
      };

      try {
        await axios.post(`${API_BASE_URL}/api/violations/report`, invalidViolation);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('droneID and position are required');
      }
    });
  });

  describe('Get Violations Count', function () {
    it('should get violations count', async function () {
      console.log('Getting violations count...');
      
      const response = await axios.get(`${API_BASE_URL}/api/violations/count`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.include('Violations count retrieved successfully');
      expect(response.data.data).to.have.property('count');
      expect(response.data.data.count).to.be.a('number');
      expect(response.data.data.count).to.be.at.least(3); // We reported 3 violations
      
      console.log('Total violations count:', response.data.data.count);
    });
  });

  describe('Get Violation by Index', function () {
    it('should get specific violation by index', async function () {
      console.log('Getting violation at index 0...');
      
      const response = await axios.get(`${API_BASE_URL}/api/violations/violation/0`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.include('Violation retrieved successfully');
      expect(response.data.data).to.have.property('droneID');
      expect(response.data.data).to.have.property('position');
      expect(response.data.data).to.have.property('timestamp');
      expect(response.data.data.droneID).to.be.a('string');
      expect(response.data.data.position).to.be.a('string');
      expect(response.data.data.timestamp).to.be.a('number');
      
      console.log('Violation data:', response.data.data);
    });

    it('should reject invalid index (negative)', async function () {
      try {
        await axios.get(`${API_BASE_URL}/api/violations/violation/-1`);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('Valid non-negative index is required');
      }
    });

    it('should reject invalid index (non-numeric)', async function () {
      try {
        await axios.get(`${API_BASE_URL}/api/violations/violation/abc`);
        expect.fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('Valid non-negative index is required');
      }
    });
  });

  describe('Get Violations by Drone', function () {
    it('should get violations for a specific drone', async function () {
      console.log('Getting violations for DRONE001...');
      
      const response = await axios.get(`${API_BASE_URL}/api/violations/drone/DRONE001`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.include('Violations by drone retrieved successfully');
      expect(response.data.data).to.have.property('positions');
      expect(response.data.data).to.have.property('timestamps');
      expect(response.data.data.positions).to.be.an('array');
      expect(response.data.data.timestamps).to.be.an('array');
      expect(response.data.data.positions.length).to.equal(response.data.data.timestamps.length);
      expect(response.data.data.positions.length).to.be.at.least(2); // DRONE001 had 2 violations
      
      console.log('DRONE001 violations:', {
        count: response.data.data.positions.length,
        positions: response.data.data.positions,
        timestamps: response.data.data.timestamps
      });
    });

    it('should return empty arrays for drone with no violations', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/violations/drone/NONEXISTENT`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.positions).to.be.an('array').that.is.empty;
      expect(response.data.data.timestamps).to.be.an('array').that.is.empty;
    });
  });

  describe('Get All Violations', function () {
    it('should get all violations', async function () {
      console.log('Getting all violations...');
      
      const response = await axios.get(`${API_BASE_URL}/api/violations/all`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.include('All violations retrieved successfully');
      expect(response.data.data).to.have.property('droneIDs');
      expect(response.data.data).to.have.property('positions');
      expect(response.data.data).to.have.property('timestamps');
      expect(response.data.data.droneIDs).to.be.an('array');
      expect(response.data.data.positions).to.be.an('array');
      expect(response.data.data.timestamps).to.be.an('array');
      
      const length = response.data.data.droneIDs.length;
      expect(response.data.data.positions.length).to.equal(length);
      expect(response.data.data.timestamps.length).to.equal(length);
      expect(length).to.be.at.least(3); // We reported 3 violations
      
      console.log('All violations:', {
        count: length,
        droneIDs: response.data.data.droneIDs,
        positions: response.data.data.positions,
        timestamps: response.data.data.timestamps
      });
    });
  });

  describe('Data Consistency', function () {
    it('should return consistent data across different endpoints', async function () {
      console.log('Testing data consistency...');
      
      // Get count
      const countResponse = await axios.get(`${API_BASE_URL}/api/violations/count`);
      const totalCount = countResponse.data.data.count;
      
      // Get all violations
      const allResponse = await axios.get(`${API_BASE_URL}/api/violations/all`);
      const allViolations = allResponse.data.data;
      
      // Verify consistency
      expect(allViolations.droneIDs.length).to.equal(totalCount);
      expect(allViolations.positions.length).to.equal(totalCount);
      expect(allViolations.timestamps.length).to.equal(totalCount);
      
      console.log('Data consistency verified:', {
        countFromEndpoint: totalCount,
        countFromAllViolations: allViolations.droneIDs.length
      });
    });
  });
});
