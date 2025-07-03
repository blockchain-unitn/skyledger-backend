import { Router, Request, Response } from 'express';
import { RoutePermissionService } from '../services/routePermission.services';
import { CheckRouteAuthorizationRequest, RequestRouteAuthorizationRequest } from '../types/routePermission.types';

const router = Router();

// Lazy-load the service to avoid initialization errors during module import
let routePermissionService: RoutePermissionService | null = null;

const getRoutePermissionService = (): RoutePermissionService => {
  if (!routePermissionService) {
    routePermissionService = new RoutePermissionService();
  }
  return routePermissionService;
};

// Check route authorization (view function - no transaction)
router.post('/check', async (req: Request, res: Response) => {
  try {
    const { droneId, zones, altitudeLimit }: CheckRouteAuthorizationRequest = req.body;

    if (!droneId || !zones) {
      return res.status(400).json({
        success: false,
        error: 'droneId and zones are required'
      });
    }

    const service = getRoutePermissionService();
    const result = await service.checkRouteAuthorization({
      droneId,
      zones,
      altitudeLimit
    });

    res.json({
      success: true,
      message: 'Route authorization checked successfully',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Request route authorization (transaction - emits event)
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { droneId, zones, altitudeLimit }: RequestRouteAuthorizationRequest = req.body;

    if (!droneId || !zones) {
      return res.status(400).json({
        success: false,
        error: 'droneId and zones are required'
      });
    }

    const service = getRoutePermissionService();
    const result = await service.requestRouteAuthorization({
      droneId,
      zones,
      altitudeLimit
    });

    res.status(201).json({
      success: true,
      message: 'Route authorization requested successfully',
      data: {
        authorization: result.response,
        txHash: result.txHash
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
