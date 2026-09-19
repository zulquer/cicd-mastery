# ☁️ Azure DevOps Level 04: Senior & Staff Internals

Manifiesto de producción de alta disponibilidad y simulador ejecutable de resolución de grafos de dependencias (DAG) en Azure Pipelines.

---

## 🔬 Contenidos de este Nivel

### 1. `azure-pipelines-production.yml`:
- Manifiesto real de nivel Enterprise listo para producción:
  - **Stage 1 (CI & Quality Gate)**: Linting, Unit Tests con matrices en Node 20.x y 22.x, y auditoría de seguridad.
  - **Stage 2 (Container Build & Push)**: Construcción de imagen Docker multicapa, escaneo con Trivy y push a Azure Container Registry (ACR).
  - **Stage 3 (Staging Environment)**: Despliegue en cluster de pruebas y ejecución de tests de integración end-to-end.
  - **Stage 4 (Canary Production)**: Compuerta de aprobación (*Approval Gate*) y despliegue progresivo (*Canary 10% / 100%*) en producción con estrategia de rollback ante fallos.

### 2. `01-pipeline-dag-and-matrix-simulator.ts`:
- Simulador en TypeScript que modela el motor de ejecución de Azure Pipelines:
  - Ordenación topológica de etapas mediante **Grafos Acíclicos Dirigidos (DAG)** basados en `dependsOn`.
  - Despliegue paralelo de **Matrix Jobs** (probando múltiples versiones de runtime simultáneamente).
  - Evaluación de condiciones booleanas de ejecución (`condition: succeeded()`) y fast-fail en cascada.

---

## ⚡ Comandos Rápidos

```bash
# Ejecutar el simulador de resolución de DAG y Matrix de Azure Pipelines:
npm run azure:dag:sim
```
