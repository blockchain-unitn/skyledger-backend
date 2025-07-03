# SkyLedger Backend API Guide

## Table of Contents

- [API Endpoints](#api-endpoints)
- [API Endpoints - Zones contract](#api-endpoints---zones-contract)


### API Endpoints


#### Get API Status
```http
GET /
```

#### Health Check
```http
GET /health
```

#### Blockchain Status
```http
GET /api/blockchain/status
```

### API Endpoints - Zones contract

### Test the Zones API
```bash
node test-zones-api.js
```

#### Get All Zones
```http
GET /api/zones
```

#### Create Zone
```http
POST /api/zones
```

#### Get Zone by ID
```http
GET /api/zones/{id}
```

#### Get Zones by Type
```http
GET /api/zones/type/{type}
```

#### Get Zone Boundaries
```http
GET /api/zones/{id}/boundaries
```

#### Check Zone Existence
```http
GET /api/zones/{id}/exists
```

#### Get Total Zones Count
```http
GET /api/zones/stats/total
```