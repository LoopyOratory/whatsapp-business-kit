# WhatsApp Business Agency-in-a-Box

## Overview

A SaaS platform that enables small businesses in Ghana to run their entire operations through WhatsApp — catalogs, orders, payments, customer management, and broadcasts. Built for the 70%+ of Ghanaian SMEs that use WhatsApp as their primary business channel.

## Tech Stack

| Layer | Choice |
|---|---|
| Backend | **ElysiaJS** (Bun) |
| Database | **PostgreSQL / Neon** (→ dedicated later) |
| ORM | **Drizzle** + drizzle-typebox |
| Auth | **Better Auth** |
| WhatsApp | **WAHA** (WhatsApp API) |
| Payments | **Paystack** (GH₵ primary, MTN MoMo) |
| Frontend | **TanStack Start** |
| Package | **Bun only** (no npm) |

## Architecture

```
whatsapp-business-kit/
├── backend/                          # ElysiaJS API server
│   ├── src/
│   │   ├── index.ts                  # Entry point - creates Elysia app
│   │   ├── app.ts                    # App factory with all plugins/routes
│   │   ├── config/
│   │   │   └── env.ts               # Environment config
│   │   ├── database/
│   │   │   ├── schema.ts            # Drizzle schema (all tables)
│   │   │   ├── utils.ts             # drizzle-typebox utilities
│   │   │   ├── migrations/          # Drizzle Kit migrations
│   │   │   └── seed.ts              # Seed data
│   │   ├── plugins/
│   │   │   ├── auth.ts              # Better Auth plugin (macro + mount)
│   │   │   ├── cors.ts              # CORS config
│   │   │   └── swagger.ts           # OpenAPI docs
│   │   ├── modules/
│   │   │   ├── businesses/          # Business profiles & onboarding
│   │   │   │   ├── index.ts         # Routes (Elysia instance)
│   │   │   │   ├── service.ts       # Business logic
│   │   │   │   └── model.ts         # TypeBox schemas
│   │   │   ├── catalog/             # Product catalog management
│   │   │   │   ├── index.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── model.ts
│   │   │   ├── orders/              # Order intake & management
│   │   │   │   ├── index.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── model.ts
│   │   │   ├── customers/           # Customer CRM
│   │   │   │   ├── index.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── model.ts
│   │   │   ├── messages/            # WhatsApp messaging & broadcasts
│   │   │   │   ├── index.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── model.ts
│   │   │   ├── payments/            # Paystack integration
│   │   │   │   ├── index.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── model.ts
│   │   │   └── whatsapp/            # WAHA connection management
│   │   │       ├── index.ts
│   │   │       ├── service.ts
│   │   │       └── model.ts
│   │   └── shared/
│   │       ├── pagination.ts        # Pagination helpers
│   │       └── errors.ts            # Error handling
│   ├── package.json
│   ├── tsconfig.json
│   ├── bunfig.toml
│   └── drizzle.config.ts
├── frontend/                         # TanStack Start (Phase 2)
└── docs/
    ├── plan.md                       # This file
    ├── api.md                        # API documentation
    └── schema.md                     # Database schema docs
```

## Database Schema

### Tables (Drizzle ORM + PostgreSQL)

**businesses** — Tenant/business accounts
- id (uuid, PK)
- name (text)
- phone (text, unique) — WhatsApp number
- email (text)
- logo_url (text, nullable)
- address (text, nullable)
- currency (text, default 'GHS')
- settings (jsonb) — business config
- created_at (timestamp)
- updated_at (timestamp)

**users** — Platform users (business owners/staff)
- id (uuid, PK)
- business_id (uuid, FK → businesses)
- email (text, unique)
- name (text)
- role (enum: 'owner', 'admin', 'staff')
- created_at (timestamp)

**catalog_items** — Products/services
- id (uuid, PK)
- business_id (uuid, FK → businesses)
- name (text)
- description (text, nullable)
- price (numeric)
- currency (text, default 'GHS')
- category (text, nullable)
- image_url (text, nullable)
- is_available (boolean, default true)
- sort_order (integer, default 0)
- created_at (timestamp)
- updated_at (timestamp)

**orders** — Customer orders
- id (uuid, PK)
- business_id (uuid, FK → businesses)
- customer_id (uuid, FK → customers)
- status (enum: 'pending', 'confirmed', 'processing', 'completed', 'cancelled')
- total_amount (numeric)
- currency (text, default 'GHS')
- payment_status (enum: 'unpaid', 'paid', 'failed', 'refunded')
- payment_reference (text, nullable) — Paystack ref
- delivery_address (text, nullable)
- notes (text, nullable)
- source (text, default 'whatsapp') — where order came from
- created_at (timestamp)
- updated_at (timestamp)

**order_items** — Line items
- id (uuid, PK)
- order_id (uuid, FK → orders)
- catalog_item_id (uuid, FK → catalog_items, nullable)
- item_name (text)
- quantity (integer)
- unit_price (numeric)
- total_price (numeric)

**customers** — Customer profiles
- id (uuid, PK)
- business_id (uuid, FK → businesses)
- phone (text)
- name (text, nullable)
- email (text, nullable)
- total_orders (integer, default 0)
- total_spent (numeric, default 0)
- last_order_at (timestamp, nullable)
- notes (text, nullable)
- created_at (timestamp)
- updated_at (timestamp)

**messages** — WhatsApp message log
- id (uuid, PK)
- business_id (uuid, FK → businesses)
- customer_id (uuid, FK → customers, nullable)
- direction (enum: 'inbound', 'outbound')
- message_type (enum: 'text', 'image', 'catalog', 'order_confirmation', 'payment_link', 'broadcast')
- content (jsonb) — message payload
- wa_message_id (text, nullable) — WAHA message ID
- status (enum: 'sent', 'delivered', 'read', 'failed')
- created_at (timestamp)

**broadcasts** — Bulk WhatsApp campaigns
- id (uuid, PK)
- business_id (uuid, FK → businesses)
- title (text)
- content (jsonb) — message template
- audience_filter (jsonb, nullable) — customer segment criteria
- sent_count (integer, default 0)
- delivered_count (integer, default 0)
- failed_count (integer, default 0)
- status (enum: 'draft', 'sending', 'completed', 'cancelled')
- scheduled_at (timestamp, nullable)
- created_at (timestamp)

**payment_transactions** — Paystack payment records
- id (uuid, PK)
- business_id (uuid, FK → businesses)
- order_id (uuid, FK → orders)
- customer_id (uuid, FK → customers)
- amount (numeric)
- currency (text, default 'GHS')
- paystack_reference (text)
- paystack_status (text)
- channel (text) — 'card', 'mobile_money', 'bank_transfer'
- paid_at (timestamp, nullable)
- created_at (timestamp)

## API Routes

### Auth (`/api/auth`)
- POST `/api/auth/sign-up` — Register business + owner
- POST `/api/auth/sign-in` — Login
- POST `/api/auth/sign-out` — Logout
- GET `/api/auth/session` — Get current session

### Businesses (`/api/businesses`)
- GET `/api/businesses` — Get business profile
- PUT `/api/businesses` — Update business
- PUT `/api/businesses/settings` — Update settings

### Catalog (`/api/catalog`)
- GET `/api/catalog` — List items (paginated)
- POST `/api/catalog` — Create item
- GET `/api/catalog/:id` — Get item
- PUT `/api/catalog/:id` — Update item
- DELETE `/api/catalog/:id` — Delete item
- POST `/api/catalog/reorder` — Reorder items
- GET `/api/catalog/public/:businessId` — Public catalog (no auth)

### Orders (`/api/orders`)
- GET `/api/orders` — List orders (paginated, filterable)
- GET `/api/orders/:id` — Get order detail
- PUT `/api/orders/:id/status` — Update order status
- PUT `/api/orders/:id/payment` — Mark payment received
- POST `/api/orders` — Create order (from WhatsApp or dashboard)

### Customers (`/api/customers`)
- GET `/api/customers` — List customers (paginated, searchable)
- GET `/api/customers/:id` — Get customer detail
- PUT `/api/customers/:id` — Update customer notes
- GET `/api/customers/:id/orders` — Customer order history

### Messages (`/api/messages`)
- GET `/api/messages` — List messages (paginated)
- POST `/api/messages/send` — Send WhatsApp message
- POST `/api/messages/send-catalog` — Send catalog to customer
- POST `/api/messages/send-payment-link` — Send Paystack link

### Broadcasts (`/api/broadcasts`)
- GET `/api/broadcasts` — List broadcasts
- POST `/api/broadcasts` — Create broadcast
- POST `/api/broadcasts/:id/send` — Send broadcast
- GET `/api/broadcasts/:id/stats` — Broadcast stats

### Payments (`/api/payments`)
- POST `/api/payments/initialize` — Initialize Paystack payment
- GET `/api/payments/verify/:reference` — Verify payment
- POST `/api/payments/webhook` — Paystack webhook
- GET `/api/payments/history` — Payment history

### WhatsApp (`/api/whatsapp`)
- GET `/api/whatsapp/status` — WAHA connection status
- POST `/api/whatsapp/connect` — Connect WhatsApp number
- POST `/api/whatsapp/disconnect` — Disconnect
- POST `/api/whatsapp/webhook` — WAHA incoming message webhook

## Implementation Phases

### Phase 1: Backend Foundation (NOW)
1. Initialize Bun + ElysiaJS project
2. Set up Drizzle schema with all tables
3. Set up Better Auth with business multi-tenancy
4. Implement business profile CRUD
5. Implement catalog CRUD
6. Implement orders CRUD
7. Implement customers CRUD
8. Set up WAHA webhook handler
9. Implement Paystack payment integration
10. Implement WhatsApp send/receive
11. Add broadcasts
12. Add OpenAPI docs

### Phase 2: Frontend (TanStack Start)
1. Initialize TanStack Start project
2. Login/signup pages
3. Dashboard with stats
4. Catalog management UI
5. Orders management UI
6. Customer management UI
7. Broadcast composer UI
8. WhatsApp connection UI
9. Settings page
10. Payment history

### Phase 3: Polish & Deploy
1. Dockerize backend + frontend
2. Set up CI/CD
3. Production deployment
4. Monitoring & logging

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Better Auth
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# Paystack
PAYSTACK_SECRET_KEY=...
PAYSTACK_PUBLIC_KEY=...

# WAHA
WAHA_API_URL=http://localhost:3001
WAHA_API_KEY=...

# App
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```
