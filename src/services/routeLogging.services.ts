import { ethers } from 'ethers';
import { 
  RouteLog, 
  LogRouteRequest, 
  PaginatedLogsResponse, 
  DroneAuthorizedResponse,
  RouteStatus,
  ZoneType,
  RoutePoint,
  RouteLogContract,
  RoutePointContract
} from '../types/routeLogging.types';

export class RouteLoggingService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor() {
    const rpcUrl = process.env.RPC_URL;
    const privateKey = process.env.PRIVATE_KEY_1;
    const contractAddress = process.env.ROUTE_LOGGING_ADDRESS;

    if (!rpcUrl) {
      throw new Error('RPC_URL environment variable is required');
    }
    if (!privateKey) {
      throw new Error('PRIVATE_KEY_1 environment variable is required');
    }
    if (!contractAddress) {
      throw new Error('ROUTE_LOGGING_ADDRESS environment variable is required');
    }

    console.log('Initializing RouteLoggingService with:');
    console.log(`RPC URL: ${rpcUrl}`);
    console.log(`Contract Address: ${contractAddress}`);

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    const abi = [
      "function logRoute(uint256 droneId, address utmAuthorizer, uint8[] calldata zones, (int256,int256) calldata startPoint, (int256,int256) calldata endPoint, (int256,int256)[] calldata route, uint256 startTime, uint256 endTime, uint8 status) external returns (uint256)",
      "function getLog(uint256 logId) external view returns (tuple(uint256 timestamp, uint256 droneId, address utmAuthorizer, uint8[] zones, (int256,int256) startPoint, (int256,int256) endPoint, (int256,int256)[] route, uint256 startTime, uint256 endTime, uint8 status))",
      "function getLogsCount() external view returns (uint256)",
      "function getLogsOfDrone(uint256 droneId) external view returns (uint256[] memory)",
      "function getLogsOfDronePaginated(uint256 droneId, uint256 offset, uint256 limit) external view returns (uint256[] memory logIds, uint256 total)",
      "function getDronesAuthorizedByUTM(address utm) external view returns (uint256[] memory)",
      "function getDronesAuthorizedByUTMSafe(address utm, uint256 maxResults) external view returns (uint256[] memory, bool hasMore)",
      "function getZonesOfLog(uint256 logId) external view returns (uint8[] memory)",
      "event RouteLogged(uint256 indexed logId, uint256 timestamp, uint256 droneId, address utmAuthorizer, uint8[] zones, (int256,int256) startPoint, (int256,int256) endPoint, (int256,int256)[] route, uint256 startTime, uint256 endTime, uint8 status)"
    ];

    this.contract = new ethers.Contract(contractAddress, abi, this.wallet);
  }

  private validateAddress(address: string): string {
    try {
      return ethers.getAddress(address);
    } catch (error) {
      throw new Error(`Invalid address format: ${address}`);
    }
  }

  private convertPointToContract(point: RoutePoint): RoutePointContract {
    return {
      latitude: BigInt(Math.round(point.latitude * 1000000)), // Convert to micro-degrees
      longitude: BigInt(Math.round(point.longitude * 1000000))
    };
  }

  private convertPointFromContract(point: RoutePointContract): RoutePoint {
    return {
      latitude: Number(point.latitude) / 1000000, // Convert from micro-degrees
      longitude: Number(point.longitude) / 1000000
    };
  }

  private formatLogForResponse(log: any, logId: number): RouteLog {
    // Helper function to safely convert BigInt to number
    const safeToNumber = (value: any): number => {
      if (typeof value === 'bigint') {
        return Number(value);
      }
      return typeof value === 'number' ? value : 0;
    };

    // Helper function to convert contract point to API point
    const convertPoint = (point: any): RoutePoint => {
      return {
        latitude: safeToNumber(point.latitude || point[0]) / 1000000,
        longitude: safeToNumber(point.longitude || point[1]) / 1000000
      };
    };

    // Convert zones array (handles both bigint and number)
    const zones = Array.isArray(log.zones) 
      ? log.zones.map((zone: any) => safeToNumber(zone))
      : [];

    // Convert route array
    const route = Array.isArray(log.route) 
      ? log.route.map((point: any) => convertPoint(point))
      : [];

    return {
      logId,
      timestamp: safeToNumber(log.timestamp),
      droneId: safeToNumber(log.droneId),
      utmAuthorizer: log.utmAuthorizer || '',
      zones,
      startPoint: convertPoint(log.startPoint || [0, 0]),
      endPoint: convertPoint(log.endPoint || [0, 0]),
      route,
      startTime: safeToNumber(log.startTime),
      endTime: safeToNumber(log.endTime),
      status: safeToNumber(log.status)
    };
  }

  async logRoute(logData: LogRouteRequest): Promise<{ logId: number; txHash: string }> {
    try {
      // Validate UTM authorizer address
      const formattedUtmAuthorizer = this.validateAddress(logData.utmAuthorizer);

      // Convert route points to contract format
      const startPoint = this.convertPointToContract(logData.startPoint);
      const endPoint = this.convertPointToContract(logData.endPoint);
      const route = logData.route.map(point => this.convertPointToContract(point));

      const tx = await this.contract.logRoute(
        logData.droneId,
        formattedUtmAuthorizer,
        logData.zones,
        [startPoint.latitude, startPoint.longitude],
        [endPoint.latitude, endPoint.longitude],
        route.map(point => [point.latitude, point.longitude]),
        logData.startTime,
        logData.endTime,
        logData.status
      );

      const receipt = await tx.wait();
      
      // Extract logId from event
      const routeLoggedEvent = receipt.logs.find((log: any) => 
        log.topics[0] === this.contract.interface.getEvent('RouteLogged')?.topicHash
      );
      
      let logId = 0;
      if (routeLoggedEvent) {
        const parsedEvent = this.contract.interface.parseLog(routeLoggedEvent);
        logId = Number(parsedEvent?.args[0] || 0);
      }

      return {
        logId,
        txHash: tx.hash
      };
    } catch (error) {
      throw new Error(`Failed to log route: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLog(logId: number): Promise<RouteLog> {
    try {
      const log = await this.contract.getLog(logId);
      console.log(`Raw log data for ID ${logId}:`, log); // Debug log
      return this.formatLogForResponse(log, logId);
    } catch (error) {
      throw new Error(`Failed to get log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLogsCount(): Promise<number> {
    try {
      const count = await this.contract.getLogsCount();
      return Number(count);
    } catch (error) {
      throw new Error(`Failed to get logs count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLogsOfDrone(droneId: number): Promise<number[]> {
    try {
      const logIds = await this.contract.getLogsOfDrone(droneId);
      return logIds.map((id: bigint) => Number(id));
    } catch (error) {
      throw new Error(`Failed to get logs of drone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLogsOfDronePaginated(
    droneId: number, 
    offset: number = 0, 
    limit: number = 10
  ): Promise<PaginatedLogsResponse> {
    try {
      if (limit > 100) limit = 100;
      if (limit < 1) limit = 10;

      const [logIds, total] = await this.contract.getLogsOfDronePaginated(droneId, offset, limit);
      
      return {
        logIds: logIds.map((id: any) => Number(id)),
        total: Number(total),
        offset,
        limit,
        hasMore: offset + limit < Number(total)
      };
    } catch (error) {
      throw new Error(`Failed to get paginated logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDronesAuthorizedByUTM(utm: string): Promise<DroneAuthorizedResponse> {
    try {
      const formattedUtm = this.validateAddress(utm);
      const droneIds = await this.contract.getDronesAuthorizedByUTM(formattedUtm);
      
      return {
        droneIds: droneIds.map((id: any) => Number(id)),
        utm: formattedUtm
      };
    } catch (error) {
      throw new Error(`Failed to get drones authorized by UTM: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getDronesAuthorizedByUTMSafe(
    utm: string, 
    maxResults: number = 20
  ): Promise<DroneAuthorizedResponse> {
    try {
      const formattedUtm = this.validateAddress(utm);
      if (maxResults > 50) maxResults = 50;
      if (maxResults < 1) maxResults = 20;

      const [droneIds, hasMore] = await this.contract.getDronesAuthorizedByUTMSafe(formattedUtm, maxResults);
      
      return {
        droneIds: droneIds.map((id: any) => Number(id)),
        hasMore,
        utm: formattedUtm
      };
    } catch (error) {
      throw new Error(`Failed to get drones authorized by UTM (safe): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getZonesOfLog(logId: number): Promise<ZoneType[]> {
    try {
      const zones = await this.contract.getZonesOfLog(logId);
      return zones.map((zone: any) => Number(zone));
    } catch (error) {
      throw new Error(`Failed to get zones of log: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getLogs(logIds: number[]): Promise<RouteLog[]> {
    try {
      const logs = await Promise.all(
        logIds.map(async (id) => {
          try {
            return await this.getLog(id);
          } catch (error) {
            console.error(`Error getting log ${id}:`, error);
            return null;
          }
        })
      );
      // Filter out null values (failed logs)
      return logs.filter((log): log is RouteLog => log !== null);
    } catch (error) {
      throw new Error(`Failed to get multiple logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get recent logs with pagination
  async getRecentLogs(offset: number = 0, limit: number = 10): Promise<PaginatedLogsResponse> {
    try {
      const totalCount = await this.getLogsCount();
      
      if (offset >= totalCount) {
        return {
          logIds: [],
          total: totalCount,
          offset,
          limit,
          hasMore: false
        };
      }

      const startId = Math.max(0, totalCount - offset - limit);
      const endId = totalCount - offset;
      const logIds: number[] = [];
      
      for (let i = endId - 1; i >= startId; i--) {
        logIds.push(i);
      }

      return {
        logIds,
        total: totalCount,
        offset,
        limit,
        hasMore: offset + limit < totalCount
      };
    } catch (error) {
      throw new Error(`Failed to get recent logs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}