# 🚀 CI/CD Level 02: Estrategias de Despliegue y Resiliencia en Producción

Canary Deployments, Blue/Green, Rolling Updates, Feature Flags, Health Checks y Rollbacks automáticos sin downtime.

---

## 🚦 1. Comparativa de Estrategias de Despliegue

| Estrategia | ¿Cómo Funciona? | Riesgo | Coste de Infraestructura | Rollback |
|---|---|---|---|---|
| **Recreate (In-Place)** | Apaga versión antigua y levanta versión nueva. | **Máximo** (Downtime garantizado). | $1\times$ (Mínimo). | Lento: requiere re-desplegar versión previa. |
| **Rolling Update** | Sustituye pods/instancias una por una de forma progresiva. | **Medio** (Coexisten versiones vieja y nueva durante minutos). | $1\times$ a $1.2\times$ (Requiere margen de capacidad). | Progresivo: debe revertir pod a pod. |
| **Blue / Green** | Levanta entorno Green 100% idéntico y conmuta el router de golpe. | **Bajo** (Pruebas de humo previas al cambio de tráfico). | $2\times$ (Duplica temporalmente la infraestructura). | Instantáneo: conmuta el router de vuelta a Blue (<1 seg). |
| **Canary Deployment** | Envía un pequeño porcentaje de tráfico real (5-10%) a la nueva versión. | **Mínimo** (Impacto acotado si hay bugs críticos). | $1.1\times$ a $1.2\times$. | Instantáneo: el balanceador redirige el 100% a la versión estable. |

---

## 🐤 2. Despliegues Progresivos (Canary) en Profundidad

El despliegue Canary es el estándar de oro en ingeniería Staff (Netflix, Google, Amazon):

1. **Fase 1 (Inyección 10%)**: Solo 1 de cada 10 peticiones HTTP reales impacta la versión Canary.
2. **Fase 2 (Monitorización Activa de Métricas de Salud)**:
   - Se monitorizan tasas de respuesta HTTP 5xx (`error_rate < 0.1%`).
   - Se monitoriza latencia de respuesta P95 y P99 (`latency_p99 < 300ms`).
3. **Fase 3 (Promoción o Aborto)**:
   - Si las métricas se mantienen saludables durante la ventana de evaluación (ej.: 15 minutos), el tráfico se incrementa a 25%, luego a 50% y finalmente al 100%.
   - **Auto-Rollback**: Si la tasa de error supera el umbral configurado, el balanceador redirige inmediatamente todo el tráfico a la versión estable sin esperar a que un ingeniero se conecte a investigar.

---

## 🚩 3. Desacoplamiento de Despliegue y Lanzamiento con Feature Flags

- **Despliegue (*Deployment*)**: Acción técnica de instalar el código nuevo en los servidores de producción.
- **Lanzamiento (*Release*)**: Acción de negocio de hacer accesible la funcionalidad a los usuarios.
- Usar plataformas de Feature Flags (LaunchDarkly, Unleash, Flipt) permite desplegar código "dormido" en producción días antes de encenderlo gradualmente para grupos selectos de usuarios (Beta testers, 5% de usuarios, etc.).
