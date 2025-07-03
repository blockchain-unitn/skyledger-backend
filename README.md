# SkyLedger Backend

A simple Node.js server built with TypeScript and Express.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment file:
   ```bash
   cp .env.example .env
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