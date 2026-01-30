# PRD-011: REST/HTTP Server Implementation

## Overview

### The Problem
Users who don't use MQTT need a way to query sensor data. A REST API provides a simple HTTP interface compatible with Home Assistant's RESTful sensor integration and allows direct querying via curl or browser.

### Why It Matters
- **User Impact**: REST provides an alternative integration method for non-MQTT users
- **Business Impact**: Broader compatibility increases adoption
- **Technical Impact**: REST allows stateless querying and is compatible with original Awair local API format

### Context
The original Awair devices had a local REST API at `/air-data/latest`. Maintaining compatibility allows existing integrations to work. Additional endpoints for device control (relay) expand functionality.

## Out of Scope

The following are explicitly NOT part of this issue:
- Web UI for configuration
- WebSocket for real-time updates
- HTTPS/TLS support
- Authentication beyond basic auth

## Solution

### Approach
1. Integrate lightweight HTTP server (lwIP httpd or WICED httpd)
2. Implement `GET /air-data/latest` for Awair-compatible JSON
3. Implement `GET /api/v1/metrics` for full sensor data
4. Implement `POST /api/v1/relay` for relay control (Glow C)
5. Implement `GET /api/v1/status` for device health
6. Add optional HTTP Basic Auth
7. Implement request/response logging for debugging

### User Stories
- **US-1**: As a user, I want to query sensor data via HTTP
- **US-2**: As a user, I want to control my relay via REST API

### Key Implementation Notes
- JSON response format for all endpoints
- Awair-compatible response for `/air-data/latest`
- Relay endpoint accepts JSON body `{"state": "on"|"off"}`
- Basic auth optional, disabled by default
- Log requests at debug level for troubleshooting

## Technical Requirements

### Constraints
- **Must use**: Lightweight HTTP server suitable for embedded systems
- **Must implement**: Awair-compatible `/air-data/latest` endpoint
- **Must implement**: JSON request/response handling
- **Must support**: GET and POST methods

### Dependencies
- **Blocked by**: Wi-Fi driver (PRD-007), Sensor drivers (PRD-004)
- **Blocks**: Home Assistant RESTful integration
- **Related**: MQTT client (PRD-010)

### Code References
- Files to create: `firmware/src/network/http_server.c`
- Files to create: `firmware/src/network/rest_handlers.c`
- Files to create: `firmware/include/network/rest_api.h`
- TypeScript reference: `host/src/firmware/networking/rest.ts`

## Acceptance Criteria

### Endpoints
- [ ] `GET /air-data/latest` returns Awair-compatible JSON
- [ ] `GET /api/v1/metrics` returns full sensor data JSON
- [ ] `POST /api/v1/relay` accepts `{"state": "on"|"off"}` and controls relay
- [ ] `GET /api/v1/relay` returns current relay state
- [ ] `GET /api/v1/status` returns device health (uptime, wifi signal, firmware version)

### Response Format
- [ ] All responses are valid JSON
- [ ] Content-Type header is `application/json`
- [ ] Error responses include `{"error": "message"}`
- [ ] HTTP status codes are appropriate (200, 400, 404, 500)

### General
- [ ] Server starts on port 80 by default
- [ ] Optional Basic Auth protects all endpoints when enabled
- [ ] Server handles multiple concurrent connections (at least 2)
- [ ] Request logging available at debug level
- [ ] Server recovers from malformed requests without crash
- [ ] Tested with curl and browser

## Open Questions

- **Q1**: Should we support CORS for browser-based access?
  - Status: To determine
  - Decision: Add basic CORS headers for local development convenience

- **Q2**: What is the maximum number of concurrent connections?
  - Status: To determine based on memory
  - Decision: Suggest 2-4 concurrent connections

---

## AI Metadata

```json
{
  "taskId": "PRD-011",
  "complexity": "moderate",
  "phase": 2,
  "isBlocking": false,
  "estimatedEffort": "2-3 days",
  "category": "networking",
  "status": "pending",
  "createdBy": "Claude Code",
  "createdAt": "2026-01-29T00:00:00Z",
  "prdVersion": "2.0"
}
```
