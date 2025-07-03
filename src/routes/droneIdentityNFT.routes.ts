import { Router } from 'express';
import { DronesService } from '../services/droneIdentityNFT.services';
import { DroneType, ZoneType, DroneStatus } from '../types/droneIdentityNFT.types';

const router = Router();

function getDronesService(): DronesService {
  try {
    return new DronesService();
  } catch (error) {
    throw new Error(`Failed to initialize DronesService: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Get all drones
router.get('/', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const drones = await dronesService.getAllDrones();
    res.json({
      success: true,
      data: drones,
      count: drones.length
    });
  } catch (error) {
    console.error('Error getting drones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Mint new drone
router.post('/', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const result = await dronesService.mintDrone(req.body);
    res.status(201).json({
      success: true,
      data: result,
      message: 'Drone minted successfully'
    });
  } catch (error) {
    console.error('Error minting drone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get drone by ID
router.get('/:tokenId', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const drone = await dronesService.getDroneData(tokenId);
    res.json({
      success: true,
      data: drone
    });
  } catch (error) {
    console.error('Error getting drone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get drones by owner
router.get('/owner/:address', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const owner = req.params.address;
    const drones = await dronesService.getDronesByOwner(owner);
    res.json({
      success: true,
      data: drones,
      count: drones.length,
      owner
    });
  } catch (error) {
    console.error('Error getting drones by owner:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get total supply
router.get('/stats/total', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const total = await dronesService.getTotalSupply();
    res.json({
      success: true,
      data: { total }
    });
  } catch (error) {
    console.error('Error getting total supply:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update cert hashes
router.put('/:tokenId/cert-hashes', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const txHash = await dronesService.updateCertHashes({
      tokenId,
      certHashes: req.body.certHashes
    });

    res.json({
      success: true,
      data: { txHash },
      message: 'Cert hashes updated successfully'
    });
  } catch (error) {
    console.error('Error updating cert hashes:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update permitted zones
router.put('/:tokenId/permitted-zones', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const txHash = await dronesService.updatePermittedZones({
      tokenId,
      permittedZones: req.body.permittedZones
    });

    res.json({
      success: true,
      data: { txHash },
      message: 'Permitted zones updated successfully'
    });
  } catch (error) {
    console.error('Error updating permitted zones:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update status
router.put('/:tokenId/status', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const txHash = await dronesService.updateStatus({
      tokenId,
      status: req.body.status
    });

    res.json({
      success: true,
      data: { txHash },
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete/burn drone
router.delete('/:tokenId', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const txHash = await dronesService.burnDrone(tokenId);
    res.json({
      success: true,
      data: { txHash },
      message: 'Drone burned successfully'
    });
  } catch (error) {
    console.error('Error burning drone:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;