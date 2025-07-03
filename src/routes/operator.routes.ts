import { Router } from 'express';
import { OperatorsService } from '../services/operator.services';

const router = Router();

function getOperatorsService(): OperatorsService {
  try {
    return new OperatorsService();
  } catch (error) {
    throw new Error(`Failed to initialize OperatorsService: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Operators API root. See /add-admin, /remove-admin, /register, /spend-tokens, /penalize, /reputation/:operator, /info/:address'
  });
});

router.get('/all', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const operators = await operatorsService.getAllOperators();
    res.json({
      success: true,
      data: operators,
      message: 'All operators retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting all operators:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Add admin
router.post('/add-admin', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const { newAdmin } = req.body;

    if (!newAdmin) {
      return res.status(400).json({
        success: false,
        error: 'newAdmin address is required'
      });
    }

    const txHash = await operatorsService.addAdmin({ newAdmin });
    res.json({
      success: true,
      data: { txHash },
      message: 'Admin added successfully'
    });
  } catch (error) {
    console.error('Error adding admin:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Remove admin
router.post('/remove-admin', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const { adminToRemove } = req.body;

    if (!adminToRemove) {
      return res.status(400).json({
        success: false,
        error: 'adminToRemove address is required'
      });
    }

    const txHash = await operatorsService.removeAdmin({ adminToRemove });
    res.json({
      success: true,
      data: { txHash },
      message: 'Admin removed successfully'
    });
  } catch (error) {
    console.error('Error removing admin:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Register operator
router.post('/register', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const { operator } = req.body;

    if (!operator) {
      return res.status(400).json({
        success: false,
        error: 'operator address is required'
      });
    }

    const txHash = await operatorsService.registerOperator({ operator });
    res.json({
      success: true,
      data: { txHash },
      message: 'Operator registered successfully'
    });
  } catch (error) {
    console.error('Error registering operator:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Spend tokens
router.post('/spend-tokens', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Valid amount is required'
      });
    }

    const txHash = await operatorsService.spendTokens({ amount: amount.toString() });
    res.json({
      success: true,
      data: { txHash },
      message: 'Tokens spent successfully'
    });
  } catch (error) {
    console.error('Error spending tokens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Penalize operator
router.post('/penalize', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const { operator, penalty } = req.body;

    if (!operator || !penalty || penalty <= 0) {
      return res.status(400).json({
        success: false,
        error: 'operator address and valid penalty amount are required'
      });
    }

    const txHash = await operatorsService.penalizeOperator({ operator, penalty: penalty.toString() });
    res.json({
      success: true,
      data: { txHash },
      message: 'Operator penalized successfully'
    });
  } catch (error) {
    console.error('Error penalizing operator:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get reputation
router.get('/reputation/:operator', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const operator = req.params.operator;

    if (!operator) {
      return res.status(400).json({
        success: false,
        error: 'operator address is required'
      });
    }

    const reputation = await operatorsService.getReputation(operator);
    res.json({
      success: true,
      data: { reputation },
      message: 'Reputation retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting reputation:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get operator info
router.get('/info/:address', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const address = req.params.address;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'address is required'
      });
    }

    const operatorInfo = await operatorsService.getOperatorInfo(address);
    res.json({
      success: true,
      data: operatorInfo,
      message: 'Operator info retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting operator info:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;