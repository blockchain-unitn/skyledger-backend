import { Router } from 'express';
import { RouteLoggingService } from '../services/routeLogging.services';
import { RouteStatus, ZoneType } from '../types/routeLogging.types';

const router = Router();

function getRouteLoggingService(): RouteLoggingService {
  try {
    return new RouteLoggingService();
  } catch (error) {
    throw new Error(`Failed to initialize RouteLoggingService: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Base route - API status
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Route Logging API is working',
      endpoints: {
        logRoute: 'POST /',
        getLog: 'GET /:logId',
        getAllLogs: 'GET /all',
        getRecentLogs: 'GET /recent',
        getLogsCount: 'GET /stats/count',
        getDroneLogs: 'GET /drone/:droneId',
        getDroneLogsPaginated: 'GET /drone/:droneId/paginated',
        getUTMDrones: 'GET /utm/:address/drones',
        getUTMDronesSafe: 'GET /utm/:address/drones/safe',
        getLogZones: 'GET /:logId/zones'
      },
      enums: {
        RouteStatus: {
          NORMAL: 0,
          DEVIATED: 1
        },
        ZoneType: {
          RURAL: 0,
          URBAN: 1,
          HOSPITALS: 2,
          MILITARY: 3,
          RESTRICTED: 4
        }
      }
    });
  } catch (error) {
    console.error('Error in route logging base route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Log a new route
router.post('/', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const result = await routeLoggingService.logRoute(req.body);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Route logged successfully'
    });
  } catch (error) {
    console.error('Error logging route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// SPECIFIC ROUTES BEFORE PARAMETERIZED ROUTES

// Get all logs (with pagination)
router.get('/all', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const totalCount = await routeLoggingService.getLogsCount();
    
    if (totalCount === 0) {
      return res.json({
        success: true,
        data: {
          logs: [],
          pagination: {
            offset,
            limit,
            total: 0,
            hasMore: false
          }
        },
        message: 'No logs found'
      });
    }
    
    const recentLogs = await routeLoggingService.getRecentLogs(offset, limit);
    
    // Get the actual log data
    const logs = await routeLoggingService.getLogs(recentLogs.logIds);
    
    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          offset,
          limit,
          total: totalCount,
          hasMore: recentLogs.hasMore
        }
      }
    });
  } catch (error) {
    console.error('Error getting all logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get recent logs
router.get('/recent', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const limit = parseInt(req.query.limit as string) || 5;
    
    const totalCount = await routeLoggingService.getLogsCount();
    
    if (totalCount === 0) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No logs found'
      });
    }
    
    const recentLogs = await routeLoggingService.getRecentLogs(0, limit);
    const logs = await routeLoggingService.getLogs(recentLogs.logIds);
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('Error getting recent logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get total logs count
router.get('/stats/count', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const count = await routeLoggingService.getLogsCount();
    
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Error getting logs count:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all logs for a specific drone
router.get('/drone/:droneId', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const droneId = parseInt(req.params.droneId);
    
    if (isNaN(droneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid drone ID'
      });
    }
    
    const logIds = await routeLoggingService.getLogsOfDrone(droneId);
    
    res.json({
      success: true,
      data: {
        droneId,
        logIds,
        count: logIds.length
      }
    });
  } catch (error) {
    console.error('Error getting drone logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get paginated logs for a specific drone
router.get('/drone/:droneId/paginated', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const droneId = parseInt(req.params.droneId);
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;
    
    if (isNaN(droneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid drone ID'
      });
    }
    
    const result = await routeLoggingService.getLogsOfDronePaginated(droneId, offset, limit);
    
    res.json({
      success: true,
      data: {
        droneId,
        ...result
      }
    });
  } catch (error) {
    console.error('Error getting paginated drone logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get drones authorized by a UTM
router.get('/utm/:address/drones', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const utmAddress = req.params.address;
    
    const result = await routeLoggingService.getDronesAuthorizedByUTM(utmAddress);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting UTM authorized drones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get drones authorized by a UTM (safe version with limit)
router.get('/utm/:address/drones/safe', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const utmAddress = req.params.address;
    const maxResults = parseInt(req.query.maxResults as string) || 20;
    
    const result = await routeLoggingService.getDronesAuthorizedByUTMSafe(utmAddress, maxResults);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error getting UTM authorized drones (safe):', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PARAMETERIZED ROUTES COME LAST

// Get specific log by ID
router.get('/:logId', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const logId = parseInt(req.params.logId);
    
    if (isNaN(logId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid log ID'
      });
    }
    
    const log = await routeLoggingService.getLog(logId);
    
    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error getting log:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zones of a specific log
router.get('/:logId/zones', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const logId = parseInt(req.params.logId);
    
    if (isNaN(logId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid log ID'
      });
    }
    
    const zones = await routeLoggingService.getZonesOfLog(logId);
    
    res.json({
      success: true,
      data: {
        logId,
        zones: zones.map(zone => ({
          id: zone,
          name: ZoneType[zone]
        }))
      }
    });
  } catch (error) {
    console.error('Error getting log zones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;