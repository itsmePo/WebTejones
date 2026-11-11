# Informe Técnico de Desarrollo y Pruebas — Tejones Banda

> **Proyecto:** Web Oficial de Tejones Banda (MVP Coste Cero)  
> **Autor / Arquitecto:** Borja García Gómez de Segura (PandaCode)  
> **Orquestador y Entorno (Forge / OpenCode Runtime):** Orquestación multi-agente, control estricto de contexto, limitación de tokens y validación automatizada de puertas de calidad G0.  
> **Fecha de Cierre:** Noviembre de 2026

---

## 1. Resumen Ejecutivo y Enfoque Metodológico

El desarrollo de la plataforma web de **Tejones Banda** se ha ejecutado bajo estrictas directrices de ingeniería de software, arquitectura modular en **Astro**, backend serverless en **Cloudflare Pages Functions (Workers)**, y una estricta política de **puertas de calidad (G0)** basadas en la metodología **TDD (Test-Driven Development)** y **Verificación Continua**.

Para alcanzar los objetivos sin incurrir en desviaciones de alcance ni sobrecostes de tokens, todo el proceso se ha apoyado en el motor de ejecución y orquestación de **Forge (OpenCode Runtime)**, coordinando un sistema de **agentes especializados** bajo un modelo estricto de tareas atómicas y contratos de calidad.

---

## 2. Funcionamiento y Uso de Agentes en Forge / OpenCode

El núcleo operativo de Forge se basa en la delegación de responsabilidades a través de **subagentes especializados** (tales como `frontend`, `backend`, `devops`, `tester` y `reviewer`), los cuales operan bajo las siguientes reglas lógicas y de control:

1. **Aislamiento de Sesiones e Independencia de Tareas:**
   - Cada tarea del plan de implementación (`T-01` a `T-13`) se concibió como una unidad de cambio indivisible. Forge permite invocar sesiones hijas (subagentes) a las que se les suministra exclusivamente el objetivo, los criterios observables, los archivos pertinentes y las pruebas requeridas, evitando la contaminación de contexto con el historial de todo el repositorio.
2. **Propiedad Clara de Archivos y Prevención de Concurrencia:**
   - Mediante las directivas de Forge, se asignó la propiedad exclusiva de los archivos por rol (por ejemplo, `frontend` gestionando componentes visuales y scripts de cliente, `backend` manejando el Worker de Cloudflare, y `devops` estructurando las puertas de CI/CD). Esto evitó ediciones concurrentes en conflicto sobre los mismos recursos.
3. **Ciclo de Verificación Estricto (Gates G0):**
   - Una vez que un subagente finalizaba su implementación, la plataforma exigía la ejecución automática de los portales de calidad (`testing-quality-gates`). Si la cobertura de líneas/ramas caía por debajo del 90% o fallaba alguna prueba unitaria/integración en Vitest, la tarea se bloqueaba automáticamente hasta corregir la deficiencia.
4. **Optimización Estricta de Cuota de Tokens:**
   - En virtud de las restricciones de sesión configuradas (prohibición de comandos masivos como `git diff` o lecturas recursivas de todo el árbol del proyecto), Forge demostró su eficiencia al obligar a los agentes a realizar lecturas quirúrgicas (leyendo únicamente `docs/implementation-plan.md` y los archivos directamente relacionados con la tarea activa), maximizando la precisión de las modificaciones de código.

---

## 3. Desglose Lógico de las Tareas Implementadas bajo el Modelo de Agentes

### Fase 1: Andamiaje y Calidad de Base (T-01 a T-04)
- **T-01 (CI/CD y Puertas de Calidad):** Desplegado por `devops` / `tester` para configurar Vitest, Playwright, Stryker y Lighthouse CI en el pipeline.
- **T-02 (Layout y Accesibilidad Base):** Implementado por `frontend` creando el componente unificado `Layout.astro` con skip-link y metadatos centralizados.
- **T-03 (Especificación UX):** Definición formal de estados de interfaz y ratios de contraste en `docs/ux-spec.md`.
- **T-04 (Content Collections):** Esquemas Zod para validación tipada de contenidos editoriales y configuración de sitio (`src/config/site.ts`).

### Fase 2: Contenido, Secciones y Multimedia (T-05 a T-09)
- **T-05 (Portada y Hero):** Bloque de bienvenida optimizado con `astro:assets`, llamada a la acción y la tarjeta decorativa de próxima gira.
- **T-06 (Secciones Editoriales y Bolos):** Módulos de prensa, trayectoria y agenda con filtrado cronológico inyectable (`src/lib/gigs.ts`).
- **T-07 y T-08 (Vídeo YouTube con Fachada y Privacidad):** Contrato de vídeo (`src/lib/youtube.ts`) y fachada accesible (`src/scripts/video-facade.ts`) garantizando cero peticiones previas a Google (G0.9).
- **T-09 (Galería de Previsualización):** Carrusel interactivo (`ImageSlider.astro`) ampliado a **8 posiciones placeholder** funcionales, scroll horizontal suave y navegación por teclado.

### Fase 3: Backend, Seguridad y Legal (T-10 a T-12)
- **T-10 (Worker `/api/contacto` con Resend y Antispam):** Endpoint serverless (`functions/api/contacto.ts`) desarrollado por `backend` con validación Zod, honeypot anti-spam, control de velocidad temporal (< 3s), limitador de tasa por IP y pasarela Resend.
- **T-11 (Formulario Cliente Progresivo):** Formulario accesible con estados reactivos `aria-live` y consentimiento RGPD no premarcado.
- **T-12 (Páginas Legales RGPD/LSSI):** Redacción y publicación de `/privacidad/` y `/aviso-legal/`.

### Fase 4: SEO, Cierre y Mejoras de Interfaz (T-13 y C-01 a C-03)
- **T-13 (Optimizaciones y Cabeceras):** Sitemap, robots.txt, cabeceras de seguridad (`_headers`) y aislamiento verificado.
- **Mejoras UX (C-01 a C-03):** Enlaces legales permanentes en el footer, firma interactiva animada **"Made by PandaCode🐼"** con transición suave en el enlace de LinkedIn, y ampliación del slider a 8 posiciones de previsualización.

---
## 4. Conclusión del Uso de Forge

El uso de **Forge / OpenCode Runtime** ha permitido estructurar un desarrollo ágil y altamente resiliente. La división en subagentes con contextos acotados ha garantizado que el código resultante no solo cumpla estrictamente con el presupuesto de coste cero (D-015) y los estándares de privacidad europeos, sino que mantenga una cobertura de pruebas superior al 93% sin sobrecargar los recursos computacionales ni los límites de tokens de la plataforma.

---
*Informe técnico certificado y actualizado bajo la plataforma Forge / OpenCode.*
