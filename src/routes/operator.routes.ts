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

// Base route - Get all operators info
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Operators API is working',
      endpoints: {
        getOperatorInfo: 'GET /:address',
        registerOperator: 'POST /register',
        spendTokens: 'POST /spend-tokens',
        penalizeOperator: 'POST /penalize',
        addAdmin: 'POST /admin/add',
        removeAdmin: 'DELETE /admin/remove',
        getStats: 'GET /stats/overview',
        getBalance: 'GET /stats/balance',
        checkRoles: 'GET /debug/roles',
        validateContract: 'GET /debug/contract',
        approveTokens: 'POST /approve-tokens',
        getAllowance: 'GET /allowance'
      }
    });
  } catch (error) {
    console.error('Error in operators base route:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// SPECIFIC ROUTES MUST COME BEFORE PARAMETERIZED ROUTES

// Get token allowance
router.get('/allowance', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const allowance = await operatorsService.getTokenAllowance();
    
    res.json({
      success: true,
      data: { allowance }
    });
  } catch (error) {
    console.error('Error getting allowance:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Approve reputation tokens
router.post('/approve-tokens', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const txHash = await operatorsService.approveReputationTokens(req.body.amount);
    
    res.json({
      success: true,
      data: { txHash },
      message: 'Tokens approved successfully'
    });
  } catch (error) {
    console.error('Error approving tokens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Register new operator
router.post('/register', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const txHash = await operatorsService.registerOperator(req.body);
    
    res.status(201).json({
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

// Spend tokens (send native tokens to owner)
router.post('/spend-tokens', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const txHash = await operatorsService.spendTokens(req.body);
    
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
    const txHash = await operatorsService.penalizeOperator(req.body);
    
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

// Add admin
router.post('/admin/add', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const txHash = await operatorsService.addAdmin(req.body);
    
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
router.delete('/admin/remove', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const txHash = await operatorsService.removeAdmin(req.body);
    
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

// Get operator statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const stats = await operatorsService.getOperatorStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting operator stats:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get contract balance
router.get('/stats/balance', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const balance = await operatorsService.getContractBalance();
    
    res.json({
      success: true,
      data: { balance }
    });
  } catch (error) {
    console.error('Error getting contract balance:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check roles (debug)
router.get('/debug/roles', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const roles = await operatorsService.checkRoles();
    
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error checking roles:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Validate contract (debug)
router.get('/debug/contract', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const validation = await operatorsService.validateContract();
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Error validating contract:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get operator info by address
router.get('/:address', async (req, res) => {
  try {
    const operatorsService = getOperatorsService();
    const operatorInfo = await operatorsService.getOperatorInfo(req.params.address);
    
    res.json({
      success: true,
      data: operatorInfo
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