/**
 * ============================================================================
 * 🚀 CI/CD SENIOR LAB 02: CANARY TRAFFIC ROUTER & AUTOMATIC ROLLBACK
 * ============================================================================
 *
 * ¿QUÉ APRENDERÁS EN ESTE LABORATORIO?:
 * 1. La mecánica de balanceo ponderado en despliegues progresivos (Canary).
 * 2. La monitorización continua de SLOs (tasa de errores HTTP 5xx y latencia).
 * 3. La ejecución de un Auto-Rollback instantáneo sin intervención humana
 *    al superar el umbral crítico de tolerancia a fallos.
 *
 * EJECUCIÓN:
 *   npx tsx tracks/05-senior-internals/02-canary-traffic-router-and-rollback.ts
 *   o: npm run cicd:senior:02
 * ============================================================================
 */

import { styleText } from 'node:util';

export interface ServiceInstance {
  version: string;
  isCanary: boolean;
  failureRate: number; // 0.0 a 1.0 probabilidad de fallo
}

export class CanaryTrafficRouter {
  public canaryWeight = 0; // Porcentaje de tráfico a Canary (0 a 100)

  constructor(
    public stable: ServiceInstance,
    public canary: ServiceInstance
  ) {}

  /**
   * Enruta una petición según la ponderación actual
   */
  handleRequest(): { targetVersion: string; success: boolean; statusCode: number } {
    const randomPercent = Math.random() * 100;
    const isTargetingCanary = randomPercent < this.canaryWeight;
    const target = isTargetingCanary ? this.canary : this.stable;

    const failed = Math.random() < target.failureRate;
    return {
      targetVersion: target.version,
      success: !failed,
      statusCode: failed ? 500 : 200
    };
  }

  /**
   * Ejecuta una ventana de evaluación de tráfico con N peticiones
   */
  simulateTrafficBatch(requestCount = 200): { total: number; errors: number; errorRatePercent: number } {
    let errors = 0;
    for (let i = 0; i < requestCount; i++) {
      const res = this.handleRequest();
      if (!res.success) errors++;
    }
    return {
      total: requestCount,
      errors,
      errorRatePercent: (errors / requestCount) * 100
    };
  }
}

async function runLab() {
  console.log(styleText('bold', styleText('bgCyan', ' 🚀 CI/CD SENIOR LAB 02: CANARY ROUTER & AUTO-ROLLBACK ')));
  console.log(styleText('gray', 'Simulando un despliegue progresivo de v1.0.0 (Stable) a v1.1.0 (Canary)...\n'));

  const stableVersion: ServiceInstance = {
    version: 'v1.0.0',
    isCanary: false,
    failureRate: 0.001 // 0.1% de error normal en producción
  };

  const canaryVersion: ServiceInstance = {
    version: 'v1.1.0-canary',
    isCanary: true,
    failureRate: 0.15 // 15% de fallos inesperados por un bug crítico de memoria
  };

  const router = new CanaryTrafficRouter(stableVersion, canaryVersion);
  const MAX_PERMISSIBLE_ERROR_RATE = 2.0; // Umbral máximo de error permitido: 2%

  // --- FASE 1: Línea Base con 100% Estable ---
  console.log(styleText('bold', '📍 FASE 1: Línea Base (100% Tráfico en v1.0.0)'));
  router.canaryWeight = 0;
  const metrics1 = router.simulateTrafficBatch(300);
  console.log(`- Tráfico en Canary: 0% | Tráfico en Stable: 100%`);
  console.log(`- Tasa de Error observada: ${metrics1.errorRatePercent.toFixed(2)}% (Saludable: < ${MAX_PERMISSIBLE_ERROR_RATE}%)\n`);

  // --- FASE 2: Inyección Inicial Canary 10% ---
  console.log(styleText('bold', '🐤 FASE 2: Despliegue Canary (10% Tráfico en v1.1.0-canary)'));
  router.canaryWeight = 10;
  const metrics2 = router.simulateTrafficBatch(300);
  console.log(`- Tráfico en Canary: 10% | Tráfico en Stable: 90%`);
  console.log(`- Tasa de Error global: ${metrics2.errorRatePercent.toFixed(2)}%`);
  console.log(styleText('yellow', '  ↳ Se detecta una ligera elevación de anomalías pero aún por debajo del límite.\n'));

  // --- FASE 3: Escalado a Canary 25% y Detección de Anomalía ---
  console.log(styleText('bold', '⚠️ FASE 3: Aumento de Carga (25% Tráfico en v1.1.0-canary)'));
  router.canaryWeight = 25;
  const metrics3 = router.simulateTrafficBatch(300);
  console.log(`- Tráfico en Canary: 25% | Tráfico en Stable: 75%`);
  console.log(`- Tasa de Error global: ${styleText(['bold', 'red'], `${metrics3.errorRatePercent.toFixed(2)}%`)}`);

  if (metrics3.errorRatePercent > MAX_PERMISSIBLE_ERROR_RATE) {
    console.log(styleText('bold', styleText('bgRed', ' 💥 ALERTA CRÍTICA: ERROR BUDGET BREACHED (> 2.0%) ')));
    console.log('El sistema detectó que v1.1.0-canary está degradando la experiencia de los usuarios.');
    console.log(styleText('red', '🚨 Disparando protocolo de AUTO-ROLLBACK instantáneo...'));

    // --- FASE 4: Auto-Rollback Inmediato ---
    router.canaryWeight = 0; // Conmutación instantánea a 0%
    console.log('\n' + styleText('bold', styleText('green', '🛡️ FASE 4: Rollback Completado con Éxito')));
    const recoveryMetrics = router.simulateTrafficBatch(300);
    console.log(`- Tráfico en Canary: ${styleText(['bold', 'green'], '0%')} (Canary completamente aislado)`);
    console.log(`- Tráfico en Stable: ${styleText(['bold', 'green'], '100%')}`);
    console.log(`- Nueva Tasa de Error post-rollback: ${styleText(['bold', 'green'], `${recoveryMetrics.errorRatePercent.toFixed(2)}%`)}`);
    console.log(styleText('cyan', '  ↳ El 100% de los usuarios vuelve a operar con normalidad en v1.0.0 sin downtime.\n'));
  }

  console.log(styleText('bold', styleText('magenta', '🎯 LECCIÓN PARA STAFF & PLATFORM ENGINEERS:')));
  console.log('El despliegue Canary con Auto-Rollback protege el 97% de los usuarios de sufrir bugs de producción.');
  console.log('Ningún ingeniero tuvo que conectarse por SSH ni esperar aprobaciones manuales para salvar el servicio.');
}

runLab();
