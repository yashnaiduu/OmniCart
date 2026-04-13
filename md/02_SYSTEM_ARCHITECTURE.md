# 🏗️ 02_SYSTEM_ARCHITECTURE.md

---

# OVERVIEW

OmniCart AI is a **distributed microservices system** with **event-driven communication**.

---

# ARCHITECTURE STYLE

* Microservices
* Stateless services
* Event-driven (Kafka)
* Horizontal scaling

---

# CORE FLOW

User Input
→ Input Service
→ Suggestion Engine
→ Aggregation Service
→ Matching Engine
→ Optimization Engine
→ Response

---

# SERVICE LAYERING

## Layer 1: Edge

* CDN (Cloudflare)
* API Gateway

---

## Layer 2: Core Services

* Auth Service
* User Service
* Input Service
* Suggestion Service
* Product Service
* Location Service
* Aggregation Service
* Matching Service
* Optimization Service

---

## Layer 3: Connectors

* Blinkit Connector
* Instamart Connector
* Zepto Connector
* BigBasket Connector

Each runs independently.

---

## Layer 4: Growth Layer

* Feed Service
* Deal Service
* Budget Service
* Refill Service
* Price Monitor
* Subscription Service

---

## Layer 5: Data Layer

* PostgreSQL
* Redis
* Elasticsearch
* Neo4j

---

# COMMUNICATION RULES

* REST → synchronous calls
* Kafka → async events

---

# FAULT ISOLATION

* Connector failure must NOT break system
* Growth services must NOT block core flow

---

# LATENCY TARGET

* Total response < 200ms
* Connector timeout: 300ms

---

# SCALING

* Kubernetes autoscaling
* Stateless pods
* Independent scaling per service

---
