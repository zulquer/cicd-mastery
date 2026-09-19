# 🏗️ CI/CD Level 01: Arquitectura de Pipelines y Motores de Ejecución

Comparativa entre motores (GitHub Actions, Azure Pipelines, GitLab CI), modelo de ejecución en grafos DAG, matrices y optimización de caché.

---

## 🧭 1. Comparativa de Motores de CI/CD en la Industria

| Dimensión | GitHub Actions | Azure Pipelines | GitLab CI/CD |
|---|---|---|---|
| **Ecosistema** | Nativo en GitHub; marketplace masivo de Actions reutilizables. | Integrado en suite Azure DevOps; soporte corporativo multi-repo profundo. | Integrado en GitLab; fortaleza histórica en despliegues a Kubernetes y Auto-DevOps. |
| **Jerarquía** | `Workflows -> Jobs -> Steps` | `Stages -> Jobs -> Steps` | `Stages -> Jobs -> Scripts` |
| **Sintaxis** | YAML (`runs-on`, `needs`, `strategy.matrix`) | YAML (`stages`, `jobs`, `dependsOn`, `matrix`) | YAML (`stages`, `needs`, `parallel.matrix`) |
| **Agentes** | GitHub-Hosted Runners o Self-Hosted Runners (ARC en K8s). | Microsoft-Hosted o Self-Hosted Pools (KEDA autoscaler). | GitLab Shared Runners o Runners privados. |

---

## 🌐 2. La Anatomía del DAG (Directed Acyclic Graph)

Los pipelines modernos no se ejecutan como un script secuencial plano; se modelan como un **Grafo Acíclico Dirigido (DAG)**:

```
          [ Lint & Code Style ]      [ Security Scan (Trivy) ]
                   \                            /
                    v                          v
            [ Unit Tests (Matrix: Node 18, 20, 22) ]
                             |
                             v
                  [ Build OCI Container ]
                             |
                             v
                 [ Deploy to Staging Env ]
                             |
                             v
           [ Manual Approval Gate / Health Check ]
                             |
                             v
               [ Canary Deploy to Production ]
```

- Cada Job declara sus dependencias explícitas (`needs: [lint, security]`).
- El orquestador ejecuta en paralelo máximo todas las ramas sin dependencias mutuas, reduciendo el tiempo total de compilación (*Time-to-Feedback*) drásticamente.

---

## ⚡ 3. Estrategias de Caching de Capas y Dependencias

En proyectos con Node.js o contenedores, descargar `node_modules` en cada commit es un antipatrón costoso:

1. **Caché de Dependencias por Hash de Lockfile**:
   - Clave de caché: `node-cache-${{ runner.os }}-${{ hashFiles('package-lock.json') }}`.
   - Si el lockfile no cambia, la restauración de paquetes toma ~3 segundos en lugar de minutos.
2. **Caché Remoto de Capas de Docker (BuildKit / GitHub Cache)**:
   - Exportación de capas intermedias con `--cache-to=type=gha,mode=max` y `--cache-from=type=gha`.
   - Las etapas invariables de la imagen Docker (instalación de SO y dependencias fijas) se reutilizan al 100%.
