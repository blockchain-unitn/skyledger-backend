import { Router } from 'express';
import { ZonesService } from '../services/zones.services';
import { ZoneType } from '../types/zones.types';

const router = Router();

// Helper function to get zones service with error handling
function getZonesService(): ZonesService {
  try {
    return new ZonesService();
  } catch (error) {
    throw new Error(`Failed to initialize ZonesService: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create a new zone
router.post('/', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const result = await zonesService.createZone(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Zone created successfully'
    });
  } catch (error) {
    console.error('Error creating zone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get total zones count (must come before /:id route)
router.get('/stats/total', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const total = await zonesService.getTotalZones();
    res.json({
      success: true,
      data: { total }
    });
  } catch (error) {
    console.error('Error getting total zones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zones by type (must come before /:id route)
router.get('/type/:type', async (req, res) => {
  try {
    const zoneType = req.params.type.toUpperCase();
    const activeOnly = req.query.active === 'true';

    if (!(zoneType in ZoneType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid zone type. Valid types: RURAL, URBAN, HOSPITALS, MILITARY, RESTRICTED'
      });
    }

    const zonesService = getZonesService();
    const zoneTypeEnum = ZoneType[zoneType as keyof typeof ZoneType];
    const zoneIds = activeOnly 
      ? await zonesService.getActiveZonesByType(zoneTypeEnum)
      : await zonesService.getZonesByType(zoneTypeEnum);

    res.json({
      success: true,
      data: zoneIds,
      count: zoneIds.length,
      type: zoneType,
      activeOnly
    });
  } catch (error) {
    console.error('Error getting zones by type:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all zones
router.get('/', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zones = await zonesService.getAllZones();
    res.json({
      success: true,
      data: zones,
      count: zones.length
    });
  } catch (error) {
    console.error('Error getting zones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zone by ID
router.get('/:id', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);
    if (isNaN(zoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid zone ID'
      });
    }

    const zone = await zonesService.getZone(zoneId);
    res.json({
      success: true,
      data: zone
    });
  } catch (error) {
    console.error('Error getting zone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check if zone exists
router.get('/:id/exists', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);
    if (isNaN(zoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid zone ID'
      });
    }

    const exists = await zonesService.zoneExists(zoneId);
    res.json({
      success: true,
      data: { exists, zoneId }
    });
  } catch (error) {
    console.error('Error checking zone existence:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zone boundaries
router.get('/:id/boundaries', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);
    if (isNaN(zoneId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid zone ID'
      });
    }

    const boundaries = await zonesService.getZoneBoundaries(zoneId);
    res.json({
      success: true,
      data: boundaries,
      zoneId
    });
  } catch (error) {
    console.error('Error getting zone boundaries:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;