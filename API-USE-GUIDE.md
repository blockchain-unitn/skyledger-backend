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
npm run test:drones
```

#### - DroneIdentityNFT API
```http
Mint Drone: POST /api/drones/mint
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
    "to": "0x1234567890123456789012345678901234567890",
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
Get API Status: GET /api/route-logs
Log Route: POST /api/route-logs
Get Log by ID: GET /api/route-logs/{logId}
Get All Logs: GET /api/route-logs/all
Get Recent Logs: GET /api/route-logs/recent
Get Logs Count: GET /api/route-logs/stats/count
Get Drone Logs: GET /api/route-logs/drone/{droneId}
Get Drone Logs (Paginated): GET /api/route-logs/drone/{droneId}/paginated
Get UTM Authorized Drones: GET /api/route-logs/utm/{address}/drones
Get UTM Authorized Drones (Safe): GET /api/route-logs/utm/{address}/drones/safe
Get Log Zones: GET /api/route-logs/{logId}/zones
```

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