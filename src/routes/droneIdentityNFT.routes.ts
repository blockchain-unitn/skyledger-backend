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

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Drone Identity NFT API root. See /mint, /drone/:tokenId, /all, /cert-hashes/:tokenId, /permitted-zones/:tokenId, /owner-history/:tokenId, /maintenance-hash/:tokenId, /status/:tokenId, /burn/:tokenId'
  });
});

// Mint new drone
router.post('/mint', async (req, res) => {
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

// Get drone data by token ID
router.get('/drone/:tokenId', async (req, res) => {
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

// Update cert hashes
router.put('/cert-hashes/:tokenId', async (req, res) => {
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
router.put('/permitted-zones/:tokenId', async (req, res) => {
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

// Update owner history
router.put('/owner-history/:tokenId', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const txHash = await dronesService.updateOwnerHistory({
      tokenId,
      ownerHistory: req.body.ownerHistory
    });

    res.json({
      success: true,
      data: { txHash },
      message: 'Owner history updated successfully'
    });
  } catch (error) {
    console.error('Error updating owner history:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update maintenance hash
router.put('/maintenance-hash/:tokenId', async (req, res) => {
  try {
    const dronesService = getDronesService();
    const tokenId = parseInt(req.params.tokenId);
    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid token ID'
      });
    }

    const txHash = await dronesService.updateMaintenanceHash({
      tokenId,
      maintenanceHash: req.body.maintenanceHash
    });

    res.json({
      success: true,
      data: { txHash },
      message: 'Maintenance hash updated successfully'
    });
  } catch (error) {
    console.error('Error updating maintenance hash:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update status
router.put('/status/:tokenId', async (req, res) => {
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

// Burn drone
router.delete('/burn/:tokenId', async (req, res) => {
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

// Get all drones
router.get('/all', async (req, res) => {
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

export default router;