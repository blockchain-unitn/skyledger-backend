import { Router } from 'express';
import { ReputationTokenService } from '../services/reputationToken.services';

const router = Router();

function getReputationTokenService(): ReputationTokenService {
  try {
    return new ReputationTokenService();
  } catch (error) {
    throw new Error(`Failed to initialize ReputationTokenService: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Mint tokens
router.post('/mint', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const { to, amount } = req.body;

    if (!to || !amount) {
      return res.status(400).json({
        success: false,
        error: 'to address and amount are required'
      });
    }

    const txHash = await reputationTokenService.mint({ to, amount });
    res.status(201).json({
      success: true,
      data: { txHash },
      message: 'Tokens minted successfully'
    });
  } catch (error) {
    console.error('Error minting tokens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Burn tokens
router.post('/burn', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const { from, amount } = req.body;

    if (!from || !amount) {
      return res.status(400).json({
        success: false,
        error: 'from address and amount are required'
      });
    }

    const txHash = await reputationTokenService.burn({ from, amount });
    res.json({
      success: true,
      data: { txHash },
      message: 'Tokens burned successfully'
    });
  } catch (error) {
    console.error('Error burning tokens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Transfer tokens
router.post('/transfer', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const { to, amount } = req.body;

    if (!to || !amount) {
      return res.status(400).json({
        success: false,
        error: 'to address and amount are required'
      });
    }

    const txHash = await reputationTokenService.transfer({ to, amount });
    res.json({
      success: true,
      data: { txHash },
      message: 'Tokens transferred successfully'
    });
  } catch (error) {
    console.error('Error transferring tokens:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Transfer tokens from
router.post('/transfer-from', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const { from, to, amount } = req.body;

    if (!from || !to || !amount) {
      return res.status(400).json({
        success: false,
        error: 'from address, to address, and amount are required'
      });
    }

    const txHash = await reputationTokenService.transferFrom({ from, to, amount });
    res.json({
      success: true,
      data: { txHash },
      message: 'Tokens transferred from successfully'
    });
  } catch (error) {
    console.error('Error transferring tokens from:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Approve tokens
router.post('/approve', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const { spender, amount } = req.body;

    if (!spender || !amount) {
      return res.status(400).json({
        success: false,
        error: 'spender address and amount are required'
      });
    }

    const txHash = await reputationTokenService.approve({ spender, amount });
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

// Get balance of address
router.get('/balance/:address', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const address = req.params.address;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'address is required'
      });
    }

    const balance = await reputationTokenService.balanceOf(address);
    res.json({
      success: true,
      data: balance,
      message: 'Balance retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting balance:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get allowance
router.get('/allowance/:owner/:spender', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const { owner, spender } = req.params;

    if (!owner || !spender) {
      return res.status(400).json({
        success: false,
        error: 'owner and spender addresses are required'
      });
    }

    const allowance = await reputationTokenService.allowance(owner, spender);
    res.json({
      success: true,
      data: allowance,
      message: 'Allowance retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting allowance:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get total supply
router.get('/total-supply', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const totalSupply = await reputationTokenService.totalSupply();
    
    res.json({
      success: true,
      data: { totalSupply },
      message: 'Total supply retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting total supply:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get token name
router.get('/name', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const name = await reputationTokenService.name();
    
    res.json({
      success: true,
      data: { name },
      message: 'Token name retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting token name:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get token symbol
router.get('/symbol', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const symbol = await reputationTokenService.symbol();
    
    res.json({
      success: true,
      data: { symbol },
      message: 'Token symbol retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting token symbol:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get token decimals
router.get('/decimals', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const decimals = await reputationTokenService.decimals();
    
    res.json({
      success: true,
      data: { decimals },
      message: 'Token decimals retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting token decimals:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get token info (aggregated view)
router.get('/info', async (req, res) => {
  try {
    const reputationTokenService = getReputationTokenService();
    const tokenInfo = await reputationTokenService.getTokenInfo();
    
    res.json({
      success: true,
      data: tokenInfo,
      message: 'Token info retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting token info:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
