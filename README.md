# 🚀 CI/CD & Delivery Engineering Mastery

Repositorio maestro de referencia técnica profunda para dominar **Integración Continua (CI), Entrega Continua (CD), GitOps, Estrategias de Despliegue en Producción y Seguridad de la Cadena de Suministro (Supply Chain Security)** a nivel **Senior / Staff / Platform Engineer**.

---

## 🎯 Preguntas de Entrevista Técnica

Para preparar entrevistas técnicas de alto nivel (**Senior DevOps, SRE, Platform Engineer y CI/CD Specialist**), este módulo incluye la guía:

👉 **[Las 100 Preguntas Más Comunes en Entrevistas Técnicas: CI/CD & Delivery Engineering](./INTERVIEW-QUESTIONS.md)** (DAGs, Matrices, Canary, Blue-Green, SLSA Level 3, SBOM, OIDC Keyless, GitOps ArgoCD/Flux, Métricas DORA, con criterios 🚩 *Red Flags* vs 🟢 *Green Flags*).

---

## 🌐 The Mastery Suite (Ecosistema Modular)

| Repositorio | Especialidad Técnica | Enlace |
|---|---|---|
| **`nodejs-ecosystem-mastery`** | 🟢 **Node.js Core, V8, Libuv, Express, NestJS, Testing & TypeScript** | [Ver Repositorio](../nodejs-ecosystem-mastery/) |
| **`python-ecosystem-mastery`** | 🐍 **CPython Internals, GIL, FastAPI, Django, PySpark & Pytest** | [Ver Repositorio](../python-ecosystem-mastery/) |
| **`php-ecosystem-mastery`** | 🐘 **Zend Engine, OPcache, JIT, Laravel, Symfony, FrankenPHP & Pest** | [Ver Repositorio](../php-ecosystem-mastery/) |
| **`backend-mastery`** | 🌐 **REST APIs RFC 9110, SQL, NoSQL, Sistemas Distribuidos & Caché** | [Ver Repositorio](../backend-mastery/) |
| **`frontend-mastery`** | ⚛️ **React 19, Angular v2-v19+, Next.js App Router & Web Performance** | [Ver Repositorio](../frontend-mastery/) |
| **`cloud-mastery`** | ☁️ **Cloud Architecture (AWS, Azure, DigitalOcean), K8s, Terraform & FinOps** | [Ver Repositorio](../cloud-mastery/) |
| **`cicd-mastery`** | 🚀 **CI/CD Universal (GitHub Actions, Azure, GitLab), GitOps & Canary** | *Este repositorio* |
| **`agile-mastery`** | 🏃 **Scrum, Kanban, Ley de Little, XP (TDD/Trunk-Based) & Cynefin** | [Ver Repositorio](../agile-mastery/) |

---

## 🏛️ Organización de los Tracks

```
cicd-mastery/
├── tracks/
│   ├── 01-pipeline-architecture-and-engines/   # GitHub Actions vs Azure Pipelines vs GitLab CI, DAGs, Matrix
│   ├── 02-deployment-strategies-and-resilience/ # Canary, Blue/Green, Rolling Updates, Feature Flags, Rollbacks
│   ├── 03-security-secrets-and-supply-chain/    # OIDC Workload Identity (Zero Secrets), Trivy, Cosign, SBOM
│   ├── 04-gitops-and-continuous-delivery/       # Push vs Pull Model, ArgoCD, Flux, Kubernetes Drift Control
│   └── 05-senior-internals/                     # Manifiestos de Producción y Laboratorios Ejecutables
│       ├── 01-pipeline-dag-and-matrix-simulator.ts  # [Lab 01: Orquestador DAG, Matrix y Approval Gates]
│       ├── 02-canary-traffic-router-and-rollback.ts # [Lab 02: Enrutador Canary Progresivo con Auto-Rollback]
│       ├── azure-pipelines-production.yml           # Manifiesto Multi-Stage Empresarial para Azure
│       └── production-github-actions.yml            # Manifiesto Multi-Job Empresarial para GitHub Actions
├── .gitignore
└── package.json
```

---

## 🧠 Matriz de Diferenciación por Seniority en CI/CD

| Dimensión | Junior | Intermediate | Senior / Staff / Platform Engineer |
|---|---|---|---|
| **Estructura de Pipeline** | Script monolítico de 400 líneas sin modularizar. | Separar en Jobs básicos de Build y Test. | **Arquitectura de Templates Reutilizables y DAGs**: Desacoplar responsabilidades (Compliance, Build, Deploy), gobernanza centralizada, matrix jobs paralelos y dependencias condicionales (`dependsOn`). |
| **Gestión de Secretos** | Guardar contraseñas y API Keys fijas en variables de entorno. | Rotar periódicamente secretos guardados en el almacén de CI. | **Arquitectura Zero-Secrets con OIDC**: Conexión nativa con AWS / Azure / GCP mediante **Workload Identity Federation** usando tokens JWT criptográficos efímeros de corta duración. Cero credenciales estáticas. |
| **Estrategia de Despliegue** | Despliegue con sobreescritura directa (*In-Place*) sufriendo caídas de servicio (*Downtime*). | Despliegue Blue/Green manual cambiando slots o puertos. | **Despliegues Progresivos (Canary)**: Inyección proporcional de tráfico real (10% -> 50% -> 100%), monitorización activa de tasas de error HTTP 5xx y latencia P99 con **Rollback automático sin intervención humana**. |
| **Filosofía de Entrega** | Pipelines "Push" directos ejecutando `kubectl apply` con credenciales de admin. | Disparar webhooks de despliegue desde el pipeline. | **GitOps Declarativo (Pull Model)**: **ArgoCD / Flux** dentro del clúster reconciliando el estado deseado en Git con el estado real, detectando y corrigiendo automáticamente desviaciones (*drift*). |

---

## 🔬 Laboratorios Ejecutables Senior (`tracks/05-senior-internals/`)

1. **`01-pipeline-dag-and-matrix-simulator.ts`**:
   - Simulación de la resolución topológica de grafos de dependencia (**DAG**) en pipelines modernos.
   - Demostración de paralelismo con matrices de ejecución (*Node 18, 20, 22*) y compuertas de aprobación con ventanas horarias.

2. **`02-canary-traffic-router-and-rollback.ts`**:
   - Simulación interactiva de un balanceador de carga ponderado ejecutando un despliegue **Canary**.
   - Inyección progresiva de tráfico (10% -> 25% -> 50% -> 100%), detección automática de un pico de errores 500 y activación instantánea de **Rollback automático al 100% de la versión estable**.

---

## ⚡ Comandos de Ejecución Rápida

```bash
npm run cicd:senior:01   # Simulador DAG, Matrix Jobs y Approval Gates
npm run cicd:senior:02   # Enrutador Canary Progresivo con Auto-Rollback
```
