import { expect } from 'chai';
import axios, { AxiosResponse } from 'axios';
import { RouteStatus, ZoneType } from '../src/types/routeLogging.types';

// Test configuration
const API_BASE_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000; // 30 seconds for blockchain operations

// Test data
const VALID_UTM_ADDRESS = '0xcE18a19756dd3172b6901CA6D822D9FD94f7a15c';
const TEST_DRONE_ID = 12345;

const SAMPLE_ROUTE_LOG = {
  droneId: TEST_DRONE_ID,
  utmAuthorizer: VALID_UTM_ADDRESS,
  zones: [ZoneType.URBAN, ZoneType.HOSPITALS],
  startPoint: {
    latitude: 40.7128,
    longitude: -74.0060
  },
  endPoint: {
    latitude: 40.7589,
    longitude: -73.9851
  },
  route: [
    { latitude: 40.7128, longitude: -74.0060 },
    { latitude: 40.7300, longitude: -73.9950 },
    { latitude: 40.7450, longitude: -73.9900 },
    { latitude: 40.7589, longitude: -73.9851 }
  ],
  startTime: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
  endTime: Math.floor(Date.now() / 1000) - 3000,   // 50 minutes ago
  status: RouteStatus.NORMAL
};

const SAMPLE_DEVIATED_ROUTE = {
  droneId: TEST_DRONE_ID + 1,
  utmAuthorizer: VALID_UTM_ADDRESS,
  zones: [ZoneType.MILITARY, ZoneType.RESTRICTED],
  startPoint: {
    latitude: 40.7000,
    longitude: -74.0100
  },
  endPoint: {
    latitude: 40.7700,
    longitude: -73.9800
  },
  route: [
    { latitude: 40.7000, longitude: -74.0100 },
    { latitude: 40.7200, longitude: -73.9980 },
    { latitude: 40.7400, longitude: -73.9920 },
    { latitude: 40.7600, longitude: -73.9850 },
    { latitude: 40.7700, longitude: -73.9800 }
  ],
  startTime: Math.floor(Date.now() / 1000) - 2400, // 40 minutes ago
  endTime: Math.floor(Date.now() / 1000) - 1800,   // 30 minutes ago
  status: RouteStatus.DEVIATED
};

describe('RouteLogging API - Blockchain Integration Tests', function () {
  this.timeout(TEST_TIMEOUT);
  
  let createdLogIds: number[] = [];

  before(async function () {
    console.log('tarting RouteLogging API blockchain tests...');
    
    // Check if API server is running
    try {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs`);
      console.log('API server is running');
      console.log('Available endpoints:', response.data.endpoints);
    } catch (error) {
      throw new Error('❌ API server is not running. Please start the server first.');
    }
  });

  after(async function () {
    console.log(`Created ${createdLogIds.length} test route logs with IDs: [${createdLogIds.join(', ')}]`);
    console.log('Test logs remain on blockchain for further inspection');
  });

  describe('API Status and Health', function () {
    it('should return API status and available endpoints', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.include('Route Logging API is working');
      expect(response.data.endpoints).to.be.an('object');
      expect(response.data.enums).to.be.an('object');
      expect(response.data.enums.RouteStatus).to.deep.equal({
        NORMAL: 0,
        DEVIATED: 1
      });
      expect(response.data.enums.ZoneType).to.deep.equal({
        RURAL: 0,
        URBAN: 1,
        HOSPITALS: 2,
        MILITARY: 3,
        RESTRICTED: 4
      });
    });
  });

  describe('Route Logging - Blockchain Write Operations', function () {
    it('should log a normal route to the blockchain', async function () {
      console.log('Logging normal route to blockchain...');
      
      const response = await axios.post(`${API_BASE_URL}/api/route-logs`, SAMPLE_ROUTE_LOG);
      
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.message).to.equal('Route logged successfully');
      expect(response.data.data).to.have.property('logId');
      expect(response.data.data).to.have.property('txHash');
      expect(response.data.data.logId).to.be.a('number');
      expect(response.data.data.txHash).to.match(/^0x[a-fA-F0-9]{64}$/);
      
      createdLogIds.push(response.data.data.logId);
      console.log(`Normal route logged with ID: ${response.data.data.logId}, TX: ${response.data.data.txHash}`);
    });

    it('should log a deviated route to the blockchain', async function () {
      console.log('Logging deviated route to blockchain...');
      
      const response = await axios.post(`${API_BASE_URL}/api/route-logs`, SAMPLE_DEVIATED_ROUTE);
      
      expect(response.status).to.equal(201);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('logId');
      expect(response.data.data).to.have.property('txHash');
      
      createdLogIds.push(response.data.data.logId);
      console.log(`Deviated route logged with ID: ${response.data.data.logId}, TX: ${response.data.data.txHash}`);
    });

    it('should reject invalid route data', async function () {
      const invalidRoute = {
        ...SAMPLE_ROUTE_LOG,
        utmAuthorizer: 'invalid-address',
        zones: []
      };
      
      try {
        await axios.post(`${API_BASE_URL}/api/route-logs`, invalidRoute);
        expect.fail('Should have thrown an error for invalid data');
      } catch (error: any) {
        expect(error.response.status).to.equal(500);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('Invalid address format');
      }
    });
  });

  describe('Route Retrieval - Blockchain Read Operations', function () {
    it('should get logs count from blockchain', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/stats/count`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('count');
      expect(response.data.data.count).to.be.a('number');
      expect(response.data.data.count).to.be.at.least(createdLogIds.length);
      
      console.log(`Total logs on blockchain: ${response.data.data.count}`);
    });

    it('should retrieve a specific log by ID from blockchain', async function () {
      if (createdLogIds.length === 0) {
        this.skip();
      }
      
      const logId = createdLogIds[0];
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/${logId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('logId', logId);
      expect(response.data.data).to.have.property('timestamp');
      expect(response.data.data).to.have.property('droneId', TEST_DRONE_ID);
      expect(response.data.data).to.have.property('utmAuthorizer', VALID_UTM_ADDRESS);
      expect(response.data.data).to.have.property('zones');
      expect(response.data.data).to.have.property('startPoint');
      expect(response.data.data).to.have.property('endPoint');
      expect(response.data.data).to.have.property('route');
      expect(response.data.data).to.have.property('startTime');
      expect(response.data.data).to.have.property('endTime');
      expect(response.data.data).to.have.property('status');
      
      // Verify coordinate conversion (should be close to original values)
      expect(response.data.data.startPoint.latitude).to.be.closeTo(SAMPLE_ROUTE_LOG.startPoint.latitude, 0.000001);
      expect(response.data.data.startPoint.longitude).to.be.closeTo(SAMPLE_ROUTE_LOG.startPoint.longitude, 0.000001);
      
      console.log(`Retrieved log ${logId} from blockchain:`, response.data.data);
    });

    it('should get recent logs from blockchain', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/recent?limit=5`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.be.an('array');
      expect(response.data.count).to.be.a('number');
      
      if (response.data.data.length > 0) {
        const firstLog = response.data.data[0];
        expect(firstLog).to.have.property('logId');
        expect(firstLog).to.have.property('timestamp');
        expect(firstLog).to.have.property('droneId');
        
        console.log(`Retrieved ${response.data.data.length} recent logs`);
      }
    });

    it('should get all logs with pagination from blockchain', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/all?offset=0&limit=3`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('logs');
      expect(response.data.data).to.have.property('pagination');
      expect(response.data.data.pagination).to.have.property('offset', 0);
      expect(response.data.data.pagination).to.have.property('limit', 3);
      expect(response.data.data.pagination).to.have.property('total');
      expect(response.data.data.pagination).to.have.property('hasMore');
      
      console.log(`Pagination info:`, response.data.data.pagination);
    });
  });

  describe('Drone-specific Operations', function () {
    it('should get logs for a specific drone from blockchain', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/drone/${TEST_DRONE_ID}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('droneId', TEST_DRONE_ID);
      expect(response.data.data).to.have.property('logIds');
      expect(response.data.data).to.have.property('count');
      expect(response.data.data.logIds).to.be.an('array');
      
      if (createdLogIds.length > 0) {
        expect(response.data.data.logIds.length).to.be.at.least(1);
        expect(response.data.data.count).to.equal(response.data.data.logIds.length);
      }
      
      console.log(`Drone ${TEST_DRONE_ID} has ${response.data.data.count} logs: [${response.data.data.logIds.join(', ')}]`);
    });

    it('should get paginated logs for a specific drone', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/drone/${TEST_DRONE_ID}/paginated?offset=0&limit=10`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('droneId', TEST_DRONE_ID);
      expect(response.data.data).to.have.property('logIds');
      expect(response.data.data).to.have.property('total');
      expect(response.data.data).to.have.property('offset', 0);
      expect(response.data.data).to.have.property('limit', 10);
      expect(response.data.data).to.have.property('hasMore');
    });

    it('should return empty results for non-existent drone', async function () {
      const nonExistentDroneId = 99999;
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/drone/${nonExistentDroneId}`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data.droneId).to.equal(nonExistentDroneId);
      expect(response.data.data.logIds).to.be.an('array').that.is.empty;
      expect(response.data.data.count).to.equal(0);
    });
  });

  describe('UTM Provider Operations', function () {
    it('should get drones authorized by UTM from blockchain', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/utm/${VALID_UTM_ADDRESS}/drones`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('utm', VALID_UTM_ADDRESS);
      expect(response.data.data).to.have.property('droneIds');
      expect(response.data.data.droneIds).to.be.an('array');
      
      if (createdLogIds.length > 0) {
        expect(response.data.data.droneIds).to.include(TEST_DRONE_ID);
      }
      
      console.log(`UTM ${VALID_UTM_ADDRESS} has authorized drones: [${response.data.data.droneIds.join(', ')}]`);
    });

    it('should get drones authorized by UTM (safe version)', async function () {
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/utm/${VALID_UTM_ADDRESS}/drones/safe?maxResults=10`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('utm', VALID_UTM_ADDRESS);
      expect(response.data.data).to.have.property('droneIds');
      expect(response.data.data).to.have.property('hasMore');
      expect(response.data.data.droneIds).to.be.an('array');
      expect(response.data.data.droneIds.length).to.be.at.most(10);
    });

    it('should reject invalid UTM address', async function () {
      try {
        await axios.get(`${API_BASE_URL}/api/route-logs/utm/invalid-address/drones`);
        expect.fail('Should have thrown an error for invalid UTM address');
      } catch (error: any) {
        expect(error.response.status).to.equal(500);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.include('Invalid address format');
      }
    });
  });

  describe('Zone Operations', function () {
    it('should get zones of a specific log from blockchain', async function () {
      if (createdLogIds.length === 0) {
        this.skip();
      }
      
      const logId = createdLogIds[0];
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/${logId}/zones`);
      
      expect(response.status).to.equal(200);
      expect(response.data.success).to.be.true;
      expect(response.data.data).to.have.property('logId', logId);
      expect(response.data.data).to.have.property('zones');
      expect(response.data.data.zones).to.be.an('array');
      
      // Verify zone data structure
      if (response.data.data.zones.length > 0) {
        const firstZone = response.data.data.zones[0];
        expect(firstZone).to.have.property('id');
        expect(firstZone).to.have.property('name');
        expect(firstZone.id).to.be.a('number');
        expect(firstZone.name).to.be.a('string');
      }
      
      console.log(`🗺️ Log ${logId} zones:`, response.data.data.zones);
    });
  });

  describe('Error Handling', function () {
    it('should handle non-existent log ID gracefully', async function () {
      const nonExistentLogId = 999999;
      
      try {
        await axios.get(`${API_BASE_URL}/api/route-logs/${nonExistentLogId}`);
        expect.fail('Should have thrown an error for non-existent log');
      } catch (error: any) {
        expect(error.response.status).to.equal(500);
        expect(error.response.data.success).to.be.false;
      }
    });

    it('should handle invalid log ID format', async function () {
      try {
        await axios.get(`${API_BASE_URL}/api/route-logs/invalid-id`);
        expect.fail('Should have thrown an error for invalid log ID');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.equal('Invalid log ID');
      }
    });

    it('should handle invalid drone ID format', async function () {
      try {
        await axios.get(`${API_BASE_URL}/api/route-logs/drone/invalid-id`);
        expect.fail('Should have thrown an error for invalid drone ID');
      } catch (error: any) {
        expect(error.response.status).to.equal(400);
        expect(error.response.data.success).to.be.false;
        expect(error.response.data.error).to.equal('Invalid drone ID');
      }
    });
  });

  describe('Data Integrity Tests', function () {
    it('should maintain coordinate precision through blockchain storage', async function () {
      if (createdLogIds.length === 0) {
        this.skip();
      }
      
      const logId = createdLogIds[0];
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/${logId}`);
      const retrievedLog = response.data.data;
      
      // Check that coordinates are within acceptable precision (6 decimal places)
      expect(retrievedLog.startPoint.latitude).to.be.closeTo(SAMPLE_ROUTE_LOG.startPoint.latitude, 0.000001);
      expect(retrievedLog.startPoint.longitude).to.be.closeTo(SAMPLE_ROUTE_LOG.startPoint.longitude, 0.000001);
      expect(retrievedLog.endPoint.latitude).to.be.closeTo(SAMPLE_ROUTE_LOG.endPoint.latitude, 0.000001);
      expect(retrievedLog.endPoint.longitude).to.be.closeTo(SAMPLE_ROUTE_LOG.endPoint.longitude, 0.000001);
      
      // Check route points
      expect(retrievedLog.route).to.have.length(SAMPLE_ROUTE_LOG.route.length);
      retrievedLog.route.forEach((point: any, index: number) => {
        expect(point.latitude).to.be.closeTo(SAMPLE_ROUTE_LOG.route[index].latitude, 0.000001);
        expect(point.longitude).to.be.closeTo(SAMPLE_ROUTE_LOG.route[index].longitude, 0.000001);
      });
      
      console.log('Coordinate precision maintained through blockchain storage');
    });

    it('should preserve all route metadata in blockchain', async function () {
      if (createdLogIds.length === 0) {
        this.skip();
      }
      
      const logId = createdLogIds[0];
      const response = await axios.get(`${API_BASE_URL}/api/route-logs/${logId}`);
      const retrievedLog = response.data.data;
      
      expect(retrievedLog.droneId).to.equal(SAMPLE_ROUTE_LOG.droneId);
      expect(retrievedLog.utmAuthorizer).to.equal(SAMPLE_ROUTE_LOG.utmAuthorizer);
      expect(retrievedLog.zones).to.deep.equal(SAMPLE_ROUTE_LOG.zones);
      expect(retrievedLog.startTime).to.equal(SAMPLE_ROUTE_LOG.startTime);
      expect(retrievedLog.endTime).to.equal(SAMPLE_ROUTE_LOG.endTime);
      expect(retrievedLog.status).to.equal(SAMPLE_ROUTE_LOG.status);
      expect(retrievedLog.timestamp).to.be.a('number');
      expect(retrievedLog.timestamp).to.be.above(0);
      
      console.log('All route metadata preserved in blockchain');
    });
  });
});
