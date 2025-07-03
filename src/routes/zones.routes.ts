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

// Create zone
router.post('/create', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const {
      name,
      zoneType,
      boundaries,
      maxAltitude,
      minAltitude,
      description
    } = req.body;

    // Validate required fields
    if (!name || zoneType === undefined || !boundaries || maxAltitude === undefined || minAltitude === undefined || !description) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: name, zoneType, boundaries, maxAltitude, minAltitude, description'
      });
    }

    if (!Array.isArray(boundaries) || boundaries.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Boundaries must be an array with at least 3 coordinate points'
      });
    }

    if (maxAltitude < minAltitude) {
      return res.status(400).json({
        success: false,
        error: 'maxAltitude must be >= minAltitude'
      });
    }

    const result = await zonesService.createZone({
      name,
      zoneType,
      boundaries,
      maxAltitude,
      minAltitude,
      description
    });

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

// Update zone
router.put('/update/:id', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);
    const {
      name,
      boundaries,
      maxAltitude,
      minAltitude,
      description
    } = req.body;

    if (isNaN(zoneId) || zoneId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid zone ID is required'
      });
    }

    // Validate required fields
    if (!name || !boundaries || maxAltitude === undefined || minAltitude === undefined || !description) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required: name, boundaries, maxAltitude, minAltitude, description'
      });
    }

    if (!Array.isArray(boundaries) || boundaries.length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Boundaries must be an array with at least 3 coordinate points'
      });
    }

    if (maxAltitude < minAltitude) {
      return res.status(400).json({
        success: false,
        error: 'maxAltitude must be >= minAltitude'
      });
    }

    const txHash = await zonesService.updateZone(zoneId, {
      name,
      boundaries,
      maxAltitude,
      minAltitude,
      description
    });

    res.json({
      success: true,
      data: { txHash },
      message: 'Zone updated successfully'
    });
  } catch (error) {
    console.error('Error updating zone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Set zone status
router.put('/status/:id', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);
    const { isActive } = req.body;

    if (isNaN(zoneId) || zoneId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid zone ID is required'
      });
    }

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive must be a boolean value'
      });
    }

    const txHash = await zonesService.setZoneStatus(zoneId, isActive);
    res.json({
      success: true,
      data: { txHash },
      message: `Zone status ${isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Error setting zone status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete zone
router.delete('/delete/:id', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);

    if (isNaN(zoneId) || zoneId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid zone ID is required'
      });
    }

    const txHash = await zonesService.deleteZone(zoneId);
    res.json({
      success: true,
      data: { txHash },
      message: 'Zone deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting zone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zone by ID
router.get('/zone/:id', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);

    if (isNaN(zoneId) || zoneId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid zone ID is required'
      });
    }

    const zone = await zonesService.getZone(zoneId);
    res.json({
      success: true,
      data: zone,
      message: 'Zone retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting zone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zones by type
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
      data: { zoneIds },
      message: `${activeOnly ? 'Active zones' : 'Zones'} by type retrieved successfully`
    });
  } catch (error) {
    console.error('Error getting zones by type:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get zone boundaries
router.get('/boundaries/:id', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);

    if (isNaN(zoneId) || zoneId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid zone ID is required'
      });
    }

    const boundaries = await zonesService.getZoneBoundaries(zoneId);
    res.json({
      success: true,
      data: { boundaries },
      message: 'Zone boundaries retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting zone boundaries:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check if zone exists
router.get('/exists/:id', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const zoneId = parseInt(req.params.id);

    if (isNaN(zoneId) || zoneId <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid zone ID is required'
      });
    }

    const exists = await zonesService.zoneExists(zoneId);
    res.json({
      success: true,
      data: { exists },
      message: 'Zone existence checked successfully'
    });
  } catch (error) {
    console.error('Error checking zone existence:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get total zones count
router.get('/total', async (req, res) => {
  try {
    const zonesService = getZonesService();
    const total = await zonesService.getTotalZones();
    res.json({
      success: true,
      data: { total },
      message: 'Total zones count retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting total zones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;