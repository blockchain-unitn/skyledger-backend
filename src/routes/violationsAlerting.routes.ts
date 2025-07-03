import { Router, Request, Response } from 'express';
import { ViolationsAlertingService } from '../services/violationsAlerting.services';
import { ReportViolationRequest } from '../types/violationsAlerting.types';

const router = Router();

// Lazy-load the service to avoid initialization errors during module import
let violationsAlertingService: ViolationsAlertingService | null = null;

const getViolationsAlertingService = (): ViolationsAlertingService => {
  if (!violationsAlertingService) {
    violationsAlertingService = new ViolationsAlertingService();
  }
  return violationsAlertingService;
};

// Report violation (transaction - emits event)
router.post('/report', async (req: Request, res: Response) => {
  try {
    const { droneID, position }: ReportViolationRequest = req.body;

    if (!droneID || !position) {
      return res.status(400).json({
        success: false,
        error: 'droneID and position are required'
      });
    }

    const service = getViolationsAlertingService();
    const result = await service.reportViolation({
      droneID,
      position
    });

    res.status(201).json({
      success: true,
      message: 'Violation reported successfully',
      data: {
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

// Get violations count (view function)
router.get('/count', async (req: Request, res: Response) => {
  try {
    const service = getViolationsAlertingService();
    const count = await service.getViolationsCount();

    res.json({
      success: true,
      message: 'Violations count retrieved successfully',
      data: {
        count
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get violation by index (view function)
router.get('/violation/:index', async (req: Request, res: Response) => {
  try {
    const index = parseInt(req.params.index);
    
    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid non-negative index is required'
      });
    }

    const service = getViolationsAlertingService();
    const violation = await service.getViolation(index);

    res.json({
      success: true,
      message: 'Violation retrieved successfully',
      data: violation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get violations by drone (view function)
router.get('/drone/:droneID', async (req: Request, res: Response) => {
  try {
    const droneID = req.params.droneID;

    if (!droneID || droneID.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Valid drone ID is required'
      });
    }

    const service = getViolationsAlertingService();
    const violations = await service.getViolationsByDrone(droneID);

    res.json({
      success: true,
      message: 'Violations by drone retrieved successfully',
      data: violations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all violations (view function)
router.get('/all', async (req: Request, res: Response) => {
  try {
    const service = getViolationsAlertingService();
    const violations = await service.getAllViolations();

    res.json({
      success: true,
      message: 'All violations retrieved successfully',
      data: violations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
