# 🔐 CI/CD Level 03: Seguridad de Secretos y Supply Chain Security

Arquitectura Zero-Secrets con OIDC Workload Identity, escaneo de dependencias (SAST/DAST), SBOM y firmas criptográficas Cosign.

---

## 🛡️ 1. La Era Zero-Secrets: OIDC Workload Identity Federation

El mayor vector de ataque en pipelines de CI/CD históricos ha sido la filtración de credenciales estáticas guardadas en variables (`AWS_ACCESS_KEY_ID`, `AZURE_CLIENT_SECRET`).

### El Flujo OIDC Moderno:
```
 [ Runner de CI/CD ]
         |
  1. Solicita Token OIDC JWT firmado por el proveedor (GitHub / GitLab / Azure)
         v
 [ Identity Provider (IdP) ]
         |
  2. Envía JWT con claims de contexto (repo: "empresa/app", ref: "refs/heads/main")
         v
 [ Cloud Provider (AWS / Azure / GCP) ]
         |
  3. Valida criptográficamente el JWT y otorga credenciales temporales de 15 minutos (AssumeRole)
```
- **Cero secretos persistentes**: No hay contraseñas que rotar, filtrar o revocar.

---

## 📦 2. Seguridad en la Cadena de Suministro (Supply Chain)

1. **SBOM (Software Bill of Materials)**:
   - Manifiesto estándar (SPDX / CycloneDX) que lista exhaustivamente cada dependencia directa y transitiva del software.
2. **Escaneo de Vulnerabilidades (Trivy / Snyk)**:
   - Bloqueo de pipeline si se detectan CVEs de severidad `CRITICAL` o `HIGH` sin parche conocido.
3. **Firmado Criptográfico de Contenedores con Sigstore / Cosign**:
   - Cada imagen de contenedor construida se firma criptográficamente en el pipeline.
   - El clúster de Kubernetes solo permite arrancar imágenes con firma verificada (Policy Admission Controller).
