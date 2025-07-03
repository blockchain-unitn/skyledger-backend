import { expect } from 'chai';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

describe('Operator API - Simple Tests', () => {
  const testOperatorAddress = '0x1234567890123456789012345678901234567890';
  const testAdminAddress = '0x0987654321098765432109876543210987654321';

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

  describe('POST /api/operators/register - Register Operator', () => {
    it('should register an operator successfully', async () => {
      const operatorData = {
        operator: testOperatorAddress
      };

      const response = await axios.post(`${BASE_URL}/api/operators/register`, operatorData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Operator registered successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('GET /api/operators/info/:address - Get Operator Info', () => {
    it('should retrieve operator info successfully', async () => {
      const response = await axios.get(`${BASE_URL}/api/operators/info/${testOperatorAddress}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Operator info retrieved successfully');
      expect(response.data.data).to.be.an('object');
    });
  });

  describe('GET /api/operators/reputation/:operator - Get Reputation', () => {
    it('should retrieve operator reputation successfully', async () => {
      const response = await axios.get(`${BASE_URL}/api/operators/reputation/${testOperatorAddress}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Reputation retrieved successfully');
      expect(response.data.data).to.have.property('reputation');
      expect(response.data.data.reputation).to.be.a('string');
    });
  });

  describe('POST /api/operators/spend-tokens - Spend Tokens', () => {
    it('should spend tokens successfully', async () => {
      const tokenData = {
        amount: 1.5
      };

      const response = await axios.post(`${BASE_URL}/api/operators/spend-tokens`, tokenData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Tokens spent successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('POST /api/operators/penalize - Penalize Operator', () => {
    it('should penalize operator successfully', async () => {
      const penaltyData = {
        operator: testOperatorAddress,
        penalty: 50
      };

      const response = await axios.post(`${BASE_URL}/api/operators/penalize`, penaltyData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Operator penalized successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('POST /api/operators/add-admin - Add Admin', () => {
    it('should add admin successfully', async () => {
      const adminData = {
        newAdmin: testAdminAddress
      };

      const response = await axios.post(`${BASE_URL}/api/operators/add-admin`, adminData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Admin added successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('POST /api/operators/remove-admin - Remove Admin', () => {
    it('should remove admin successfully', async () => {
      const adminData = {
        adminToRemove: testAdminAddress
      };

      const response = await axios.post(`${BASE_URL}/api/operators/remove-admin`, adminData);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Admin removed successfully');
      expect(response.data.data.txHash).to.be.a('string');
    });
  });

  describe('Final verification', () => {
    it('should verify operator reputation after penalty', async () => {
      const response = await axios.get(`${BASE_URL}/api/operators/reputation/${testOperatorAddress}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('reputation');
      // Reputation should be a string representation of a number
      expect(response.data.data.reputation).to.be.a('string');
    });

    it('should verify operator info after all operations', async () => {
      const response = await axios.get(`${BASE_URL}/api/operators/info/${testOperatorAddress}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.be.an('object');
    });
  });
});
