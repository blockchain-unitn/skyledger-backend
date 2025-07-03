import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get configuration from environment
const ZONES_ADDRESS = process.env.ZONES_ADDRESS;
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

    // Check contract if address is provided
    if (ZONES_ADDRESS) {
      console.log('');
      console.log('Checking Zones contract...');
      const code = await provider.getCode(ZONES_ADDRESS);
      
      if (code === '0x') {
        console.warn('No contract found at the specified address');
      } else {
        console.log('Contract found at address');
        console.log(`Contract code size: ${code.length - 2} bytes`);
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
