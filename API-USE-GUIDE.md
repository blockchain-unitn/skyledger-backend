# SkyLedger Backend API Guide

## Table of Contents

- [API Endpoints](#api-endpoints)
- [API Endpoints - Zones contract](#--zones-api)


### API Endpoints

```http
Get API Status: GET /    
Health Check: GET /health
Blockchain Status: GET /api/blockchain/status
```

### Zones contract

#### - Test the Zones API
```bash
npx tsx test/zones-api.test.ts
```

#### - Zones API
```http
Get All Zones: GET /api/zones
Create Zone: POST /api/zones
Get Zone by ID: GET /api/zones/{id}
Get Zones by Type: GET /api/zones/type/{type}
Get Zone Boundaries: GET /api/zones/{id}/boundaries
Check Zone Existence: GET /api/zones/{id}/exists
Get Total Zones Count: GET /api/zones/stats/total
```

### DroneIdentityNFT contract

#### - Test the DroneIdentityNFT API
```bash
npx tsx test/droneIdentityNFT.test.ts
```

#### - DroneIdentityNFT API
```http
Get All Drones: GET /api/drones
Mint New Drone: POST /api/drones
Get Drone by Token ID: GET /api/drones/{tokenId}
Get Drones by Owner: GET /api/drones/owner/{address}
Get Total Supply: GET /api/drones/stats/total
Update Cert Hashes: PUT /api/drones/{tokenId}/cert-hashes
Update Permitted Zones: PUT /api/drones/{tokenId}/permitted-zones
Update Owner History: PUT /api/drones/{tokenId}/owner-history
Update Maintenance Hash: PUT /api/drones/{tokenId}/maintenance-hash
Update Drone Status: PUT /api/drones/{tokenId}/status
Burn/Delete Drone: DELETE /api/drones/{tokenId}
Check Contract Ownership: GET /api/drones/debug/ownership
Validate Contract: GET /api/drones/debug/contract
```