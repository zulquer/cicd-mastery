# 🔄 CI/CD Level 04: GitOps y Entrega Continua Declarativa

Modelo Push vs Modelo Pull, reconciliación de drift, ArgoCD y Flux en Kubernetes.

---

## ⚖️ 1. Modelo Push Clásico vs Modelo Pull (GitOps)

| Dimensión | CI/CD Push Clásico | GitOps Declarativo (Pull) |
|---|---|---|
| **Punto de Ejecución** | El servidor de CI (GitHub/Azure) ejecuta comandos hacia el clúster. | Un agente dentro del clúster (**ArgoCD / Flux**) monitoriza el repo Git. |
| **Seguridad de Acceso** | El servidor de CI necesita credenciales de administrador de producción. | El clúster no expone puertos de administración al exterior; consulta Git mediante salida HTTPS. |
| **Reconciliación de Drift** | Si alguien modifica manualmente un recurso en K8s con `kubectl`, el cambio persiste. | ArgoCD detecta la diferencia (*Out-of-Sync*) y sobreescribe automáticamente restaurando la verdad declarada en Git. |
| **Auditoría y Rollback** | Disparar un re-despliegue manual en el pipeline. | `git revert <commit>`: el agente en el clúster detecta el commit revertido y ajusta el estado en segundos. |

---

## 🎯 2. Principios de OpenGitOps

1. **Declarativo**: El sistema completo se describe mediante manifiestos declarativos (YAML, Kustomize, Helm).
2. **Versionado e Inmutable**: La única fuente de verdad (*Single Source of Truth*) es el repositorio Git.
3. **Pillado Automático**: Los cambios confirmados en Git son aplicados automáticamente por el agente.
4. **Auto-Sanación (Self-Healing)**: Si un fallo o intervención manual altera el estado del entorno, el agente fuerza la reconciliación hacia el estado deseado.
