# 🚨 00_MASTER_RULEBOOK.md (READ FIRST - NON NEGOTIABLE)

---

# PURPOSE

This document defines **absolute rules** for building OmniCart AI.
All other documents are **extensions of this rulebook**.

---

# 🔗 DOCUMENT LINKING (MANDATORY)

You MUST read and use ALL documents together:

* 01_PRODUCT_OVERVIEW.md
* 02_SYSTEM_ARCHITECTURE.md
* 03_TECH_STACK.md
* 04_BACKEND_SPEC.md
* 05_DATABASE_SCHEMA.md
* 06_API_CONTRACTS.md
* 07_EVENT_SYSTEM.md
* 08_CONNECTORS_SPEC.md
* 09_AI_ENGINE_SPEC.md
* 10_GROWTH_LAYER_SPEC.md
* 11_FRONTEND_SPEC.md
* 12_UI_UX_GUIDELINES.md
* 13_SECURITY_SPEC.md
* 14_DEVOPS_INFRA.md
* 15_TESTING_QA.md
* 16_MONITORING_OBSERVABILITY.md
* 17_BUSINESS_LOGIC.md
* 18_ROADMAP_EXECUTION.md

---

# ❌ STRICT PROHIBITIONS

* DO NOT change tech stack
* DO NOT merge services into a monolith
* DO NOT skip caching
* DO NOT bypass validation
* DO NOT hardcode values
* DO NOT assume missing logic
* DO NOT redesign architecture

---

# ✅ MANDATORY REQUIREMENTS

* Every service must be independent
* Every API must follow contract exactly
* Every external call must have timeout + retry
* Every request must be authenticated
* Every critical operation must be logged

---

# ⚙️ EXECUTION ORDER

Follow ONLY:

1. Infrastructure setup
2. Core backend services
3. Connectors
4. Matching + Optimization
5. AI layer
6. Growth layer
7. Frontend

---

# 🧠 SYSTEM PHILOSOPHY

* Loose coupling
* High cohesion
* Fail-safe defaults
* Cache-first design
* Event-driven

---

# 🛑 FAILURE RULE

If ANY requirement is unclear:

> STOP and refer to relevant MD
> DO NOT guess.

---
