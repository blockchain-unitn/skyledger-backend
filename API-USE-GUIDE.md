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
npm run test:zones
```

#### - Zones API
```http
Create Zone: POST /api/zones/create
Update Zone: PUT /api/zones/update/{id}
Set Zone Status: PUT /api/zones/status/{id}
Delete Zone: DELETE /api/zones/delete/{id}
Get Zone by ID: GET /api/zones/zone/{id}
Get Zones by Type: GET /api/zones/type/{type}
Get Zone Boundaries: GET /api/zones/boundaries/{id}
Check Zone Existence: GET /api/zones/exists/{id}
Get Total Zones Count: GET /api/zones/total
```

#### - Example Usage

**Create a new zone:**
```bash
curl -X POST http://localhost:3000/api/zones/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Central Park Zone",
    "zoneType": 1,
    "boundaries": [
      {"latitude": 40.7829, "longitude": -73.9654},
      {"latitude": 40.7648, "longitude": -73.9734},
      {"latitude": 40.7505, "longitude": -73.9733}
    ],
    "maxAltitude": 500,
    "minAltitude": 0,
    "description": "Urban park area with restricted drone access"
  }'
```

**Update a zone:**
```bash
curl -X PUT http://localhost:3000/api/zones/update/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Central Park Zone",
    "boundaries": [
      {"latitude": 40.7829, "longitude": -73.9654},
      {"latitude": 40.7648, "longitude": -73.9734},
      {"latitude": 40.7505, "longitude": -73.9733},
      {"latitude": 40.7600, "longitude": -73.9800}
    ],
    "maxAltitude": 600,
    "minAltitude": 50,
    "description": "Updated urban park area description"
  }'
```

**Set zone status (activate/deactivate):**
```bash
curl -X PUT http://localhost:3000/api/zones/status/1 \
  -H "Content-Type: application/json" \
  -d '{"isActive": false}'
```

**Delete a zone:**
```bash
curl -X DELETE http://localhost:3000/api/zones/delete/1
```

**Get zone by ID:**
```bash
curl -X GET http://localhost:3000/api/zones/zone/1
```

**Get zones by type:**
```bash
curl -X GET http://localhost:3000/api/zones/type/URBAN
```

**Get active zones by type:**
```bash
curl -X GET "http://localhost:3000/api/zones/type/URBAN?active=true"
```

**Get zone boundaries:**
```bash
curl -X GET http://localhost:3000/api/zones/boundaries/1
```

**Check if zone exists:**
```bash
curl -X GET http://localhost:3000/api/zones/exists/1
```

**Get total zones count:**
```bash
curl -X GET http://localhost:3000/api/zones/total
```

**Zone Type Values:**
- `RURAL = 0`
- `URBAN = 1`
- `HOSPITALS = 2`
- `MILITARY = 3`
- `RESTRICTED = 4`

### DroneIdentityNFT contract

#### - Test the DroneIdentityNFT API
```bash
npm run test:drones
```

#### - DroneIdentityNFT API
```http
Mint Drone: POST /api/drones/mint
Get all Drones Data: GET /api/drones/all
Get Drone Data: GET /api/drones/drone/{tokenId}
Update Cert Hashes: PUT /api/drones/cert-hashes/{tokenId}
Update Permitted Zones: PUT /api/drones/permitted-zones/{tokenId}
Update Owner History: PUT /api/drones/owner-history/{tokenId}
Update Maintenance Hash: PUT /api/drones/maintenance-hash/{tokenId}
Update Status: PUT /api/drones/status/{tokenId}
Burn Drone: DELETE /api/drones/burn/{tokenId}
Get All Drones: GET /api/drones/all
```

#### - Example Usage

**Mint a new drone:**
```bash
curl -X POST http://localhost:3000/api/drones/mint \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "DRONE001",
    "model": "DJI-PHANTOM",
    "droneType": 0,
    "certHashes": ["hash1", "hash2"],
    "permittedZones": [0, 1],
    "ownerHistory": ["Owner1"],
    "maintenanceHash": "maintenanceHash1",
    "status": 0
  }'
```

**Get all drones data:**
```bash
curl -X GET http://localhost:3000/api/drones/all
```

**Get drone data:**
```bash
curl -X GET http://localhost:3000/api/drones/drone/1
```

**Update drone status:**
```bash
curl -X PUT http://localhost:3000/api/drones/status/1 \
  -H "Content-Type: application/json" \
  -d '{"status": 1}'
```

**Burn a drone:**
```bash
curl -X DELETE http://localhost:3000/api/drones/burn/1
```

**Get all drones:**
```bash
curl -X GET http://localhost:3000/api/drones/all
```

**Enum Values:**
- DroneType: MEDICAL=0, CARGO=1, SURVEILLANCE=2, AGRICULTURAL=3, RECREATIONAL=4, MAPPING=5, MILITAR=6
- ZoneType: RURAL=0, URBAN=1, HOSPITALS=2, MILITARY=3, RESTRICTED=4
- DroneStatus: ACTIVE=0, MAINTENANCE=1, INACTIVE=2

#### - Operators API
```http
Add Admin: POST /api/operators/add-admin
Remove Admin: POST /api/operators/remove-admin
Register Operator: POST /api/operators/register
Spend Tokens: POST /api/operators/spend-tokens
Penalize Operator: POST /api/operators/penalize
Get Reputation: GET /api/operators/reputation/{operator}
Get Operator Info: GET /api/operators/info/{address}
```

#### - Example Usage

**Add admin:**
```bash
curl -X POST http://localhost:3000/api/operators/add-admin \
  -H "Content-Type: application/json" \
  -d '{"newAdmin": "0x1234567890123456789012345678901234567890"}'
```

**Register operator:**
```bash
curl -X POST http://localhost:3000/api/operators/register \
  -H "Content-Type: application/json" \
  -d '{"operator": "0x1234567890123456789012345678901234567890"}'
```

**Spend tokens:**
```bash
curl -X POST http://localhost:3000/api/operators/spend-tokens \
  -H "Content-Type: application/json" \
  -d '{"amount": "1.0"}'
```

**Penalize operator:**
```bash
curl -X POST http://localhost:3000/api/operators/penalize \
  -H "Content-Type: application/json" \
  -d '{
    "operator": "0x1234567890123456789012345678901234567890",
    "penalty": "100"
  }'
```

**Get reputation:**
```bash
curl -X GET http://localhost:3000/api/operators/reputation/0x1234567890123456789012345678901234567890
```

**Get operator info:**
```bash
curl -X GET http://localhost:3000/api/operators/info/0x1234567890123456789012345678901234567890
```

### RouteLogging contract

#### - Test the RouteLogging API
```bash
npm run test:route-logging
```

#### - RouteLogging API
```http
Log Route: POST /api/route-logs/log
Get Log by ID: GET /api/route-logs/log/{logId}
Get Logs Count: GET /api/route-logs/count
Get Drone Logs: GET /api/route-logs/drone/{droneId}
Get Drone Logs (Paginated): GET /api/route-logs/drone/{droneId}/paginated
Get UTM Authorized Drones: GET /api/route-logs/utm/{address}/drones
Get UTM Authorized Drones (Safe): GET /api/route-logs/utm/{address}/drones/safe
Get Log Zones: GET /api/route-logs/zones/{logId}
```

#### - Example Usage

**Log a route:**
```bash
curl -X POST http://localhost:3000/api/route-logs/log \
  -H "Content-Type: application/json" \
  -d '{
    "droneId": 1,
    "utmAuthorizer": "0x1234567890123456789012345678901234567890",
    "zones": [1, 0],
    "startPoint": {
      "latitude": 40.7128,
      "longitude": -74.0060
    },
    "endPoint": {
      "latitude": 40.7589,
      "longitude": -73.9851
    },
    "route": [
      {"latitude": 40.7128, "longitude": -74.0060},
      {"latitude": 40.7300, "longitude": -73.9950},
      {"latitude": 40.7589, "longitude": -73.9851}
    ],
    "startTime": 1700000000,
    "endTime": 1700003600,
    "status": 0
  }'
```

**Get log by ID:**
```bash
curl -X GET http://localhost:3000/api/route-logs/log/0
```

**Get logs count:**
```bash
curl -X GET http://localhost:3000/api/route-logs/count
```

**Get logs of a specific drone:**
```bash
curl -X GET http://localhost:3000/api/route-logs/drone/1
```

**Get paginated logs of a drone:**
```bash
curl -X GET "http://localhost:3000/api/route-logs/drone/1/paginated?offset=0&limit=5"
```

**Get drones authorized by UTM:**
```bash
curl -X GET http://localhost:3000/api/route-logs/utm/0x1234567890123456789012345678901234567890/drones
```

**Get drones authorized by UTM (safe with limit):**
```bash
curl -X GET "http://localhost:3000/api/route-logs/utm/0x1234567890123456789012345678901234567890/drones/safe?maxResults=10"
```

**Get zones of a log:**
```bash
curl -X GET http://localhost:3000/api/route-logs/zones/0
```

**Route Status Values:**
- `NORMAL = 0`
- `DEVIATED = 1`

**Zone Type Values:**
- `RURAL = 0`
- `URBAN = 1`
- `HOSPITALS = 2`
- `MILITARY = 3`
- `RESTRICTED = 4`

### RoutePermission contract

#### - Test the RoutePermission API
```bash
npm run test:route-permissions
```

#### - RoutePermission API
```http
Check Route Authorization: POST /api/route-permissions/check
Request Route Authorization: POST /api/route-permissions/request
```

#### - Example Usage

**Check route authorization (view function - no gas cost):**
```bash
curl -X POST http://localhost:3000/api/route-permissions/check \
  -H "Content-Type: application/json" \
  -d '{
    "droneId": 1,
    "zones": [1, 0],
    "altitudeLimit": 500
  }'
```

**Request route authorization (transaction - costs gas, emits event):**
```bash
curl -X POST http://localhost:3000/api/route-permissions/request \
  -H "Content-Type: application/json" \
  -d '{
    "droneId": 1,
    "zones": [1, 0],
    "altitudeLimit": 500
  }'
```

**Zone Type Values:**
- `RURAL = 0`
- `URBAN = 1`
- `HOSPITALS = 2`
- `MILITARY = 3`
- `RESTRICTED = 4`

**Example with different zone combinations:**
```bash
# Valid zones (Urban + Rural)
curl -X POST http://localhost:3000/api/route-permissions/check \
  -H "Content-Type: application/json" \
  -d '{"droneId": 1, "zones": [1, 0], "altitudeLimit": 500}'

# Restricted zones (Military + Restricted)
curl -X POST http://localhost:3000/api/route-permissions/check \
  -H "Content-Type: application/json" \
  -d '{"droneId": 1, "zones": [3, 4], "altitudeLimit": 1000}'

# Mixed zones (Urban + Hospitals)
curl -X POST http://localhost:3000/api/route-permissions/check \
  -H "Content-Type: application/json" \
  -d '{"droneId": 1, "zones": [1, 2], "altitudeLimit": 750}'
```

### ViolationsAlerting contract

#### - Test the ViolationsAlerting API
```bash
npm run test:violations
```

#### - ViolationsAlerting API
```http
Report Violation: POST /api/violations/report
Get Violations Count: GET /api/violations/count
Get Violation by Index: GET /api/violations/violation/{index}
Get Violations by Drone: GET /api/violations/drone/{droneID}
Get All Violations: GET /api/violations/all
```

#### - Example Usage

**Report a violation:**
```bash
curl -X POST http://localhost:3000/api/violations/report \
  -H "Content-Type: application/json" \
  -d '{
    "droneID": "DRONE001",
    "position": "lat:45.4642,lng:9.1900"
  }'
```

**Get violations count:**
```bash
curl -X GET http://localhost:3000/api/violations/count
```

**Get specific violation by index:**
```bash
curl -X GET http://localhost:3000/api/violations/violation/0
```

**Get all violations for a specific drone:**
```bash
curl -X GET http://localhost:3000/api/violations/drone/DRONE001
```

**Get all violations:**
```bash
curl -X GET http://localhost:3000/api/violations/all
```

### ReputationToken contract

#### - Test the ReputationToken API
```bash
npm run test:reputation-tokens
```

#### - ReputationToken API
```http
Mint Tokens: POST /api/reputation-tokens/mint
Burn Tokens: POST /api/reputation-tokens/burn
Transfer Tokens: POST /api/reputation-tokens/transfer
Transfer From: POST /api/reputation-tokens/transfer-from
Approve Tokens: POST /api/reputation-tokens/approve
Get Balance: GET /api/reputation-tokens/balance/{address}
Get Allowance: GET /api/reputation-tokens/allowance/{owner}/{spender}
Get Total Supply: GET /api/reputation-tokens/total-supply
Get Token Name: GET /api/reputation-tokens/name
Get Token Symbol: GET /api/reputation-tokens/symbol
Get Token Decimals: GET /api/reputation-tokens/decimals
Get Token Info: GET /api/reputation-tokens/info
```

#### - Example Usage

**Mint tokens (owner only):**
```bash
curl -X POST http://localhost:3000/api/reputation-tokens/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "100.0"
  }'
```

**Burn tokens (owner only):**
```bash
curl -X POST http://localhost:3000/api/reputation-tokens/burn \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x1234567890123456789012345678901234567890",
    "amount": "50.0"
  }'
```

**Transfer tokens:**
```bash
curl -X POST http://localhost:3000/api/reputation-tokens/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x1234567890123456789012345678901234567890",
    "amount": "25.0"
  }'
```

**Transfer tokens from (requires allowance):**
```bash
curl -X POST http://localhost:3000/api/reputation-tokens/transfer-from \
  -H "Content-Type: application/json" \
  -d '{
    "from": "0x1234567890123456789012345678901234567890",
    "to": "0x0987654321098765432109876543210987654321",
    "amount": "10.0"
  }'
```

**Approve spender:**
```bash
curl -X POST http://localhost:3000/api/reputation-tokens/approve \
  -H "Content-Type: application/json" \
  -d '{
    "spender": "0x1234567890123456789012345678901234567890",
    "amount": "75.0"
  }'
```

**Get balance:**
```bash
curl -X GET http://localhost:3000/api/reputation-tokens/balance/0x1234567890123456789012345678901234567890
```

**Get allowance:**
```bash
curl -X GET http://localhost:3000/api/reputation-tokens/allowance/0x1234567890123456789012345678901234567890/0x0987654321098765432109876543210987654321
```

**Get total supply:**
```bash
curl -X GET http://localhost:3000/api/reputation-tokens/total-supply
```

**Get token name:**
```bash
curl -X GET http://localhost:3000/api/reputation-tokens/name
```

**Get token symbol:**
```bash
curl -X GET http://localhost:3000/api/reputation-tokens/symbol
```

**Get token decimals:**
```bash
curl -X GET http://localhost:3000/api/reputation-tokens/decimals
```

**Get complete token info:**
```bash
curl -X GET http://localhost:3000/api/reputation-tokens/info
```

**Notes:**
- All amounts are specified in Ether units (e.g., "1.0" = 1 token)
- The contract automatically handles decimal precision (typically 18 decimals)
- `mint` and `burn` functions are restricted to the contract owner
- `transferFrom` requires prior approval via the `approve` function
- All addresses must be valid Ethereum addressesS