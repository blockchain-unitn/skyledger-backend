# SkyLedger Backend

The skyledger-backend provides a REST API abstraction layer that hides the complexity of interacting directly with the blockchain. This means that the UTM does not need to directly call smart contracts or interact with the blockchain itself. Instead, it communicates with the backend’s REST API, which handles all blockchain operations transparently and efficiently. 

Service Architecture:
- Smart Contract Services: Individual service classes for each contract (OperatorsService, etc.)
- Real-time Analytics: Off-chain data processing for complex queries and pattern analysis
- Transaction Management: Optimized blockchain interaction with batching and retry mechanisms
- API Gateway: Standardized REST endpoints for easy UTM integration

Performance Optimization:
- Caching Layer: Maintains cached authorization states for microsecond-level position validation
- Event Processing: Real-time blockchain event monitoring and notification systems
- Data Aggregation: Combines multiple contract data for comprehensive operational insights


Description: Node.js server built with TypeScript and Express. 

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/blockchain-unitn/skyledger-backend.git
    cd skyledger-backend
    ```
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.orig .env
   ```

4. Update the `.env` file with your configuration

### Running the Server

#### Development Mode (with hot reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm run build
npm start
```

The server will start on port 3000 by default (or the port specified in your `.env` file).

## Project Structure

```
src/
├── server.ts          # Main server file
├── routes/           # API routes (future)
├── middleware/       # Custom middleware (future)
├── types/           # TypeScript type definitions (future)
└── utils/           # Utility functions (future)
```