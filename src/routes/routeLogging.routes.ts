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

// Log route
router.post('/log', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const {
      droneId,
      utmAuthorizer,
      zones,
      startPoint,
      endPoint,
      route,
      startTime,
      endTime,
      status
    } = req.body;

    // Validate required fields
    if (!droneId || !utmAuthorizer || !zones || !startPoint || !endPoint || !route || !startTime || !endTime || status === undefined) {
      return res.status(400).json({
        success: false,
        error: 'All route logging fields are required'
      });
    }

    const result = await routeLoggingService.logRoute({
      droneId,
      utmAuthorizer,
      zones,
      startPoint,
      endPoint,
      route,
      startTime,
      endTime,
      status
    });

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

// Get log by ID
router.get('/log/:logId', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const logId = parseInt(req.params.logId);

    if (isNaN(logId) || logId < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid log ID is required'
      });
    }

    const log = await routeLoggingService.getLog(logId);
    res.json({
      success: true,
      data: log,
      message: 'Log retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting log:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get logs count
router.get('/count', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const count = await routeLoggingService.getLogsCount();

    res.json({
      success: true,
      data: { count },
      message: 'Logs count retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting logs count:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get logs of drone
router.get('/drone/:droneId', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const droneId = parseInt(req.params.droneId);

    if (isNaN(droneId) || droneId < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid drone ID is required'
      });
    }

    const logs = await routeLoggingService.getLogsOfDrone(droneId);
    res.json({
      success: true,
      data: { logIds: logs },
      message: 'Drone logs retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting drone logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get logs of drone paginated
router.get('/drone/:droneId/paginated', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const droneId = parseInt(req.params.droneId);
    const offset = parseInt(req.query.offset as string) || 0;
    const limit = parseInt(req.query.limit as string) || 10;

    if (isNaN(droneId) || droneId < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid drone ID is required'
      });
    }

    if (offset < 0 || limit <= 0 || limit > 100) {
      return res.status(400).json({
        success: false,
        error: 'Valid offset (≥0) and limit (1-100) are required'
      });
    }

    const result = await routeLoggingService.getLogsOfDronePaginated(
      droneId,
      offset,
      limit
    );

    res.json({
      success: true,
      data: result,
      message: 'Paginated drone logs retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting paginated drone logs:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get drones authorized by UTM
router.get('/utm/:address/drones', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const utmAddress = req.params.address;

    if (!utmAddress) {
      return res.status(400).json({
        success: false,
        error: 'UTM address is required'
      });
    }

    const result = await routeLoggingService.getDronesAuthorizedByUTM(utmAddress);
    res.json({
      success: true,
      data: result,
      message: 'UTM authorized drones retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting UTM authorized drones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get drones authorized by UTM (safe version)
router.get('/utm/:address/drones/safe', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const utmAddress = req.params.address;
    const maxResults = parseInt(req.query.maxResults as string) || 20;

    if (!utmAddress) {
      return res.status(400).json({
        success: false,
        error: 'UTM address is required'
      });
    }

    if (maxResults <= 0 || maxResults > 50) {
      return res.status(400).json({
        success: false,
        error: 'maxResults must be between 1 and 50'
      });
    }

    const result = await routeLoggingService.getDronesAuthorizedByUTMSafe(
      utmAddress,
      maxResults
    );

    res.json({
      success: true,
      data: result,
      message: 'UTM authorized drones (safe) retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting UTM authorized drones (safe):', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zones of log
router.get('/zones/:logId', async (req, res) => {
  try {
    const routeLoggingService = getRouteLoggingService();
    const logId = parseInt(req.params.logId);

    if (isNaN(logId) || logId < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid log ID is required'
      });
    }

    const zones = await routeLoggingService.getZonesOfLog(logId);
    res.json({
      success: true,
      data: { zones },
      message: 'Log zones retrieved successfully'
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