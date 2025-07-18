import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { ethers } from 'ethers';
import zonesRoutes from './routes/zones.routes';
import dronesRoutes from './routes/droneIdentityNFT.routes';
import operatorsRoutes from './routes/operator.routes';
import routeLoggingRoutes from './routes/routeLogging.routes';
import routePermissionRoutes from './routes/routePermission.routes';
import violationsAlertingRoutes from './routes/violationsAlerting.routes';
import reputationTokenRoutes from './routes/reputationToken.routes';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to SkyLedger Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      zones: '/api/zones',
      drones: '/api/drones',
      operators: '/api/operators',
      routeLogs: '/api/route-logs',
      routePermissions: '/api/route-permissions',
      violations: '/api/violations',
      blockchain: '/api/blockchain/status'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Blockchain status endpoint
app.get('/api/blockchain/status', async (req, res) => {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const blockNumber = await provider.getBlockNumber();
    const network = await provider.getNetwork();
    
    res.json({
      success: true,
      data: {
        connected: true,
        blockNumber,
        chainId: network.chainId.toString(),
        zonesContractAddress: process.env.ZONES_ADDRESS,
        droneNftContractAddress: process.env.DRONE_NFT_ADDRESS,
        routePermissionContractAddress: process.env.ROUTE_PERMISSION_ADDRESS
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  }
});

// API routes
app.use('/api/zones', zonesRoutes);
app.use('/api/drones', dronesRoutes);
app.use('/api/operators', operatorsRoutes);
app.use('/api/route-logs', routeLoggingRoutes);
app.use('/api/route-permissions', routePermissionRoutes);
app.use('/api/violations', violationsAlertingRoutes);
app.use('/api/reputation-tokens', reputationTokenRoutes);

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Zones API: http://localhost:${PORT}/api/zones`);
  console.log(`Drones API: http://localhost:${PORT}/api/drones`);
  console.log(`Operators API: http://localhost:${PORT}/api/operators`);
  console.log(`Route Logs API: http://localhost:${PORT}/api/route-logs`);
  console.log(`Route Permissions API: http://localhost:${PORT}/api/route-permissions`);
  console.log(`Violations API: http://localhost:${PORT}/api/violations`);
  console.log(`Reputation Tokens API: http://localhost:${PORT}/api/reputation-tokens`);
});

export default app;