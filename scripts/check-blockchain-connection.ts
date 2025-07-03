import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get configuration from environment
const ZONES_ADDRESS = process.env.ZONES_ADDRESS;
const DRONE_NFT_ADDRESS = process.env.DRONE_IDENTITY_NFT_ADDRESS;
const ROUTE_PERMISSION_ADDRESS = process.env.ROUTE_PERMISSION_ADDRESS;
const ROUTE_LOGGING_ADDRESS = process.env.ROUTE_LOGGING_ADDRESS;
const RPC_URL = process.env.RPC_URL;
const RPC_CHAIN_ID = process.env.RPC_CHAIN_ID;

// Connect to the blockchain
const provider = new ethers.JsonRpcProvider(RPC_URL);

async function checkConnection() {
  try {
    console.log('Checking blockchain connection...');
    console.log(`RPC URL: ${RPC_URL}`);
    console.log(`Expected Chain ID: ${RPC_CHAIN_ID}`);
    console.log(`Zones Contract: ${ZONES_ADDRESS}`);
    console.log(`Drone NFT Contract: ${DRONE_NFT_ADDRESS}`);
    console.log(`Route Permission Contract: ${ROUTE_PERMISSION_ADDRESS}`);
    console.log(`Route Logging Contract: ${ROUTE_LOGGING_ADDRESS}`);
    console.log('');

    // Check provider connection
    const blockNumber = await provider.getBlockNumber();
    console.log('Connected to blockchain successfully!');
    console.log(`Current block number: ${blockNumber}`);

    // Check network
    const network = await provider.getNetwork();
    console.log(`Network Chain ID: ${network.chainId}`);
    
    if (RPC_CHAIN_ID && network.chainId.toString() !== RPC_CHAIN_ID) {
      console.warn(`Chain ID mismatch! Expected: ${RPC_CHAIN_ID}, Got: ${network.chainId}`);
    }

    // Check contracts if addresses are provided
    const contracts = [
      { name: 'Zones', address: ZONES_ADDRESS },
      { name: 'Drone NFT', address: DRONE_NFT_ADDRESS },
      { name: 'Route Permission', address: ROUTE_PERMISSION_ADDRESS },
      { name: 'Route Logging', address: ROUTE_LOGGING_ADDRESS }
    ];

    for (const contract of contracts) {
      if (contract.address) {
        console.log('');
        console.log(`Checking ${contract.name} contract...`);
        const code = await provider.getCode(contract.address);
        
        if (code === '0x') {
          console.warn(`No contract found at the specified ${contract.name} address`);
        } else {
          console.log(`${contract.name} contract found at address`);
          console.log(`Contract code size: ${code.length - 2} bytes`);
        }
      }
    }

    console.log('');
    console.log('All checks completed successfully!');
    
  } catch (err) {
    console.log('');
    console.error('Error connecting to blockchain or contract:');
    if (err instanceof Error) {
      console.error(`   ${err.message}`);
    } else {
      console.error('   Unknown error:', err);
    }
    
    process.exit(1);
  }
}

checkConnection();
