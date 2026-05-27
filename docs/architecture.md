# Architecture (Initial Scaffold)

This repository follows a modular monolith direction with separate deployable apps for web, API, and worker processes.

## Repository shape
- `apps/web`: customer + admin web application (planned Next.js).
- `apps/api`: backend API (planned NestJS).
- `apps/worker`: background workflows (planned BullMQ workers).
- `packages/database`: schema/migrations and DB client package.
- `packages/shared-types`: shared DTOs and contracts.
- `packages/ui`: shared UI components.
- `packages/integrations/rail`: rail provider adapter contracts.
- `packages/integrations/payments`: payment provider adapter contracts.

## Near-term milestone
Implement `/admin/rail-poc` in the web app and wire it to API endpoints for live rail fare search, booking, purchase and fulfilment retrieval once provider access is confirmed.
