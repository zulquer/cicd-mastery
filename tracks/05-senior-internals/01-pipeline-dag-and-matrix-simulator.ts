/**
 * ============================================================================
 * ☁️ AZURE DEVOPS SENIOR LAB 01: PIPELINE DAG RESOLUTION & MATRIX SIMULATOR
 * ============================================================================
 *
 * ¿QUÉ APRENDERÁS EN ESTE LABORATORIO?:
 * 1. Cómo el orquestador de Azure Pipelines resuelve dependencias entre etapas
 *    mediante un Grafo Acíclico Dirigido (DAG - Directed Acyclic Graph con `dependsOn`).
 * 2. La ejecución paralela de Matrix Jobs (pruebas en múltiples versiones de Node.js).
 * 3. La evaluación de condiciones (`succeeded()`, `failed()`) y la cancelación
 *    en cascada (Fast-Fail) cuando una compuerta o prueba falla.
 * 4. La simulación de un Manual Approval Gate antes de promover a Producción.
 *
 * EJECUCIÓN:
 *   npx tsx azure-devops/04-senior-internals/01-pipeline-dag-and-matrix-simulator.ts
 *   o: npm run azure:dag:sim
 * ============================================================================
 */

import { styleText } from 'node:util';

// ----------------------------------------------------------------------------
// 1. MODELO DE DATOS DE AZURE PIPELINES
// ----------------------------------------------------------------------------
export type StageStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'SKIPPED';

export interface PipelineStage {
  id: string;
  name: string;
  dependsOn: string[];
  status: StageStatus;
  matrix?: Record<string, any>;
  action: (context: { matrixConfig?: any }) => Promise<boolean>;
}

export class AzurePipelineEngineSimulator {
  private stages = new Map<string, PipelineStage>();

  addStage(stage: PipelineStage) {
    this.stages.set(stage.id, stage);
  }

  /**
   * Resuelve el orden de ejecución y despacha etapas en paralelo o secuencialmente
   */
  async executePipeline(): Promise<boolean> {
    console.log(styleText('bold', styleText('bgBlue', ' ☁️ AZURE PIPELINES DAG ORCHESTRATION ENGINE ')));
    console.log(styleText('gray', 'Iniciando resolución topológica de etapas y evaluación de gates.\n'));

    let hasGlobalFailure = false;

    while (true) {
      // Buscar etapas listas para ejecutarse:
      // Aquellas en estado 'PENDING' cuyas dependencias (dependsOn) ya hayan terminado
      const readyStages: PipelineStage[] = [];

      for (const stage of this.stages.values()) {
        if (stage.status !== 'PENDING') continue;

        const dependencies = stage.dependsOn.map(depId => this.stages.get(depId)!);
        const allDepsFinished = dependencies.every(
          dep => dep.status === 'SUCCEEDED' || dep.status === 'FAILED' || dep.status === 'SKIPPED'
        );

        if (allDepsFinished) {
          readyStages.push(stage);
        }
      }

      // Si no hay etapas listas, terminamos el ciclo
      if (readyStages.length === 0) break;

      // Ejecutamos las etapas listas en paralelo
      await Promise.all(
        readyStages.map(async stage => {
          const dependencies = stage.dependsOn.map(depId => this.stages.get(depId)!);
          const anyDepFailed = dependencies.some(dep => dep.status === 'FAILED' || dep.status === 'SKIPPED');

          // Regla condition: succeeded() -> Si alguna dependencia falló, se salta (SKIPPED)
          if (anyDepFailed) {
            stage.status = 'SKIPPED';
            console.log(
              `   [Stage: ${stage.name}] ${styleText('yellow', '⚠️ SKIPPED')} (Una dependencia previa falló)`
            );
            return;
          }

          stage.status = 'RUNNING';
          console.log(`\n🚀 [Stage: ${styleText('bold', stage.name)}] Iniciando ejecución...`);

          // Si la etapa define una matriz de ejecución paralela (Matrix Jobs)
          if (stage.matrix) {
            const matrixEntries = Object.entries(stage.matrix);
            console.log(styleText('cyan', `   -> Despachando ${matrixEntries.length} Matrix Jobs paralelos en agentes...`));

            const matrixResults = await Promise.all(
              matrixEntries.map(async ([jobName, config]) => {
                const jobSuccess = await stage.action({ matrixConfig: config });
                console.log(
                  `      Job [${jobName}] (Node ${config.nodeVersion}) -> ${jobSuccess ? styleText('green', '✅ PASSED') : styleText('red', '❌ FAILED')}`
                );
                return jobSuccess;
              })
            );

            const allMatrixJobsPassed = matrixResults.every(Boolean);
            stage.status = allMatrixJobsPassed ? 'SUCCEEDED' : 'FAILED';
          } else {
            // Etapa estándar o de despliegue
            const success = await stage.action({});
            stage.status = success ? 'SUCCEEDED' : 'FAILED';
          }

          if (stage.status === 'SUCCEEDED') {
            console.log(`   [Stage: ${stage.name}] ${styleText('green', '✅ SUCCEEDED')}`);
          } else {
            console.log(`   [Stage: ${stage.name}] ${styleText('red', '❌ FAILED')}`);
            hasGlobalFailure = true;
          }
        })
      );
    }

    return !hasGlobalFailure;
  }
}

// ----------------------------------------------------------------------------
// 2. DEMOSTRACIÓN PRÁCTICA DEL FLUJO DE CI/CD EMPRESARIAL
// ----------------------------------------------------------------------------
async function runDemo() {
  const pipeline = new AzurePipelineEngineSimulator();

  // Etapa 1: Pruebas con Matrix en múltiples versiones de Node
  pipeline.addStage({
    id: 'stage_ci',
    name: 'CI: Pruebas y Linter',
    dependsOn: [],
    status: 'PENDING',
    matrix: {
      'Job-Node20': { nodeVersion: '20.14.x' },
      'Job-Node22': { nodeVersion: '22.4.x' },
    },
    action: async ({ matrixConfig }) => {
      await new Promise(r => setTimeout(r, 20)); // Simula tests
      return true; // Ambos pasan
    },
  });

  // Etapa 2: Escaneo de Seguridad y Contenedor (Depende de CI)
  pipeline.addStage({
    id: 'stage_security',
    name: 'Security: Trivy Scan & Docker Build',
    dependsOn: ['stage_ci'],
    status: 'PENDING',
    action: async () => {
      console.log('      Escaneando imagen Docker en busca de vulnerabilidades CVE...');
      await new Promise(r => setTimeout(r, 15));
      return true;
    },
  });

  // Etapa 3: Despliegue en Staging (Depende de Security)
  pipeline.addStage({
    id: 'stage_staging',
    name: 'Deploy: Staging Environment',
    dependsOn: ['stage_security'],
    status: 'PENDING',
    action: async () => {
      console.log('      Desplegando en Azure Kubernetes Service (AKS) Staging...');
      await new Promise(r => setTimeout(r, 25));
      return true;
    },
  });

  // Etapa 4: Compuerta de Aprobación Manual (Approval Gate)
  pipeline.addStage({
    id: 'stage_gate',
    name: 'Approval Gate: Manual & Monitoring Checks',
    dependsOn: ['stage_staging'],
    status: 'PENDING',
    action: async () => {
      console.log(styleText('magenta', '      🛡️ Verificando alertas en Azure Monitor y aprobación del Release Manager...'));
      await new Promise(r => setTimeout(r, 15));
      console.log(styleText('green', '      Aprobación concedida (0 alertas activas).'));
      return true;
    },
  });

  // Etapa 5: Despliegue Canary a Producción (Depende de Gate)
  pipeline.addStage({
    id: 'stage_prod',
    name: 'Deploy: Production Canary (10% -> 100%)',
    dependsOn: ['stage_gate'],
    status: 'PENDING',
    action: async () => {
      console.log('      Enrutando 10% del tráfico al pod Canary...');
      await new Promise(r => setTimeout(r, 15));
      console.log('      Métricas saludables. Promoviendo al 100% del tráfico.');
      return true;
    },
  });

  const success = await pipeline.executePipeline();

  console.log(styleText('bold', '\n--- RESULTADO DE LA CANALIZACIÓN ---'));
  console.log(`Estado Global del Pipeline: ${success ? styleText('bold', styleText('green', 'EXITOSO (SUCCESS)')) : styleText('red', 'FALLIDO')}`);

  console.log(styleText('bold', styleText('cyan', '\n🎯 RESUMEN ARQUITECTÓNICO DE AZURE PIPELINES:')));
  console.log(
    '1. El grafo de dependencias (' + styleText('yellow', 'dependsOn') + ') permite paralelizar etapas independientes y serializar despliegues seguros.\n' +
    '2. Los ' + styleText('magenta', 'Matrix Jobs') + ' prueban múltiples arquitecturas o versiones de Node simultáneamente con una sola definición.\n' +
    '3. Las compuertas de ' + styleText('green', 'Environments y Canary') + ' mitigan riesgos de producción sin necesidad de intervención manual nocturna.'
  );
}

runDemo().catch(console.error);
