# Plan de implementación — Web de Tejones Banda

> Deriva de [`docs/plan.md`](./plan.md) **v0.3** y de [`docs/DECISIONS.md`](./DECISIONS.md) (revisión con **D-002 v3**, **D-007 descartada** y **D-015**).
> Responsable del documento: `project-planner`. Estado: **propuesto, pendiente de aprobación expresa**.
> **Cada tarea = una sesión de agente + un commit propio.** Si una tarea no cabe en una sesión, se parte en `T-xxa`/`T-xxb` sin cambiar el alcance aprobado.
> Convención: `[PENDIENTE: …]` marca un dato que solo puede aportar el dueño. No se inventan datos de la banda.

---

## 0. Estado del plan fuente y de las decisiones

| Elemento | Estado real hoy | Efecto en este backlog |
|---|---|---|
| plan.md | v0.3, borrador; §Aprobación sigue "pendiente" | Este backlog asume la aprobación transmitida en el encargo. Si el plan cambia, se revisa antes de implementar. |
| **D-002 v3** (imágenes autohospedadas + YouTube embebido con fachada) | Aprobada | Base de T-05, T-07 y T-08: el vídeo **no se aloja**, solo se guarda el `youtubeId` y una miniatura local. |
| **D-007** (R2 con subdominio de medios) | **Descartada** | **Desaparece toda la infraestructura de vídeo propia**: sin bucket, sin `media.[dominio]`, sin `Range`, sin caché de vídeo, sin tarea de aprovisionamiento en R2. |
| **D-015** (coste cero salvo dominio) | **Aprobada** | Ninguna tarea puede proponer un servicio de pago. Si una alternativa lo exige, se descarta y se documenta; cambiarla obliga a reemplazar D-015. |
| D-005, D-006, D-012, D-013 | Aprobadas | Sin cambios: Pages, Worker + Resend, sin cifras, consentimiento 6.1.a + aviso legal. |
| D-009 (content collections) | **Propuesta** | T-04 no empieza sin ratificación. |
| D-010 (tests y gates) | **Propuesta** | T-01 no empieza sin ratificación. |
| D-011 (analítica sin cookies) | **Propuesta** (gratuita, coherente con D-015) | Se incluye en T-13 solo si se ratifica. |
| D-014 (dominio canónico) | **Propuesta, sin dominio** | Bloquea T-10 (dominio verificado en Resend), el criterio canónico de T-13 y la publicación. **Ya no bloquea el vídeo ni las imágenes.** |
| Q2 (revisión legal) / Q3 (precio) | Abiertas | Bloquean publicación / dejan el precio fuera de T-06. |
| Tests y CI | No existen (`package.json` sin scripts de test) | T-01 los crea y va primero. |

### Coste (D-015)

| Concepto | Coste | Base |
|---|---|---|
| Cloudflare Pages Free | 0 € | Assets estáticos gratuitos e ilimitados |
| Pages Functions / Worker | 0 € | Free: 100.000 peticiones/día |
| Resend Free | 0 € | 3.000 emails/mes, 100/día |
| Cloudflare Web Analytics | 0 € | Incluido (si D-011 se ratifica) |
| YouTube embebido | 0 € | Sin alojamiento ni tráfico propio |
| **Total recurrente** | **0 €/mes** | Principio aprobado (D-015) |
| Dominio | **10–15 €/año** (estimación propia) | Único gasto aceptado `[PENDIENTE: registrar/renovar]` |

### Presupuesto y límites del host

- **HTML + CSS + JS inicial ≤ 300 KB** (gzip), todo incluido.
- **Portada ≤ 1,2 MB** sin contar el vídeo (no se descarga): **hero ≤ 250 KB**, miniaturas de vídeo ≤ 200 KB, **galería ≤ 200 KB por imagen**.
- **Antes del clic: 0 KB y 0 peticiones de YouTube/Google**; no hay iframe ni script de terceros en la carga inicial.
- LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms en móvil simulado (proxy de laboratorio).
- Límites de Cloudflare Pages que condicionan el trabajo: **25 MiB por archivo** y **500 builds/mes** (20.000 archivos). Ninguna imagen se acerca al límite por archivo; los builds/mes limitan la **frecuencia de despliegue**, así que se agrupan cambios.

**Decisiones técnicas que este plan NO toma y que requieren `architect`** (plan §8). Si no existen al empezar la tarea, esa sesión arranca con una consulta de alcance mínimo y la decisión se registra en `DECISIONS.md`:

1. Rate limit por IP en plan Free (KV, Durable Objects o reglas de Rate Limiting), **sin coste** → **T-10**.
2. Generación de `_headers` con `noindex` y cabeceras de seguridad por entorno → **T-13**.
3. Montaje del iframe de YouTube sin saltos de foco ni CLS → **T-08**.
4. Forma del sitemap (`@astrojs/sitemap` o ruta propia) y validación del HTML generado → **T-13**.

---

## 1. Gate común de calidad (G0)

Toda tarea cierra solo si cumple G0 sobre los archivos que toca. T-01 lo automatiza; antes de T-01 se ejecuta a mano con los mismos comandos.

| # | Puerta | Criterio verificable |
|---|---|---|
| G0.1 | Build | `npm ci` reproducible y `npm run build` sin errores ni warnings nuevos |
| G0.2 | Tipo y lint | `astro check` (o `tsc --noEmit`) y lint/format sin errores nuevos |
| G0.3 | Unitarias | Vitest: líneas **≥ 90 %** (objetivo 100 %) y ramas **≥ 90 %** (objetivo 100 %) |
| G0.4 | Integración | Vitest sobre el HTML generado; umbral combinado unitarias + integración **≥ 90 %** |
| G0.5 | Mutación | Stryker **≥ 90 %** de mutantes válidos no equivalentes **solo donde hay lógica** (`src/scripts/`, `src/config/`, `src/lib/`, `functions/_lib/`). Sin lógica → "no aplica" declarado en el commit |
| G0.6 | UI/E2E | Playwright (Chromium + WebKit móvil) verde en los escenarios del plan §4 aplicables |
| G0.7 | Rendimiento | Lighthouse CI en presupuesto: LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms, HTML+CSS+JS ≤ 300 KB, portada ≤ 1,2 MB, hero ≤ 250 KB, galería ≤ 200 KB/imagen |
| G0.8 | Accesibilidad | axe-core **0 violaciones críticas** en las rutas tocadas + checklist manual de foco/teclado/contraste en tareas de UI |
| G0.9 | Aislamiento de terceros | Antes de cualquier clic: **0 peticiones** a `youtube.com`, `youtube-nocookie.com`, `ytimg.com`, `google.com`/`googleapis.com` y **0 cookies de terceros** (Playwright interceptando red) |
| G0.10 | Revisión | `reviewer` revisa el diff: sin secretos, sin datos personales en logs, sin `[PENDIENTE` en contenido publicable, sin servicios de pago (D-015) |
| G0.11 | Trazabilidad | El commit referencia `T-xx` y el criterio de aceptación que cierra |

**Manual y no automatizable** (una vez por release): reproducción real en iOS y Android (**YouTube exige `Referer`**), subtítulos legibles, lector de pantalla (NVDA/VoiceOver).

**Secretos:** `RESEND_API_KEY` y `CONTACT_TO` solo como variables de entorno de Pages. Nunca `PUBLIC_*`, nunca en el bundle, nunca en logs.

---

## 2. Épicas, funcionalidades y tareas

| Épica | Funcionalidades del plan | Tareas |
|---|---|---|
| **E1 — Base del proyecto** | F11, D-009, D-010 | T-01, T-02, T-03, T-04 |
| **E2 — Contenido y secciones** | F1, F4, F5, F10 | T-05, T-06 |
| **E3 — Vídeo e imágenes** | F2, F3, D-002 v3 | T-07, T-08, T-09 |
| **E4 — Formulario y Worker** | F6, D-006 | T-10, T-11 |
| **E5 — Legal** | F7, D-013 | T-12 |
| **E6 — SEO, rendimiento y accesibilidad** | F8, F9 | T-13 |
| **E7 — CI y despliegue** | D-010, plan §10 | T-01 (CI + previews); go-live en la definición de terminado |
| **Contenido (transversal)** | F1–F5, F10, plan §9 | T-00 |
| Fuera de v1 | F12 (EPK), ICS, i18n, panel, pagos, cifras, **vídeo autohospedado** | No se planifican |

Trazabilidad: F1→T-05 · F2→T-07/T-08 · F3→T-09 · F4/F5→T-06 · F6→T-10/T-11 · F7→T-12 · F8→T-13 · F9→T-13 · F10→T-06 · F11→T-02.

---

## 3. Tareas

### T-00 — Contenido real de la banda *(bloquea la publicación, no la implementación)*
- **Owner:** dueño del producto (humano). `frontend` integra y valida el formato.
- **Dependencias:** ninguna. Empieza el primer día y corre en paralelo a todo el backlog.
- **Objetivo:** sustituir los `[PENDIENTE]` de contenido por material real con derechos, para publicar sin marcadores.
- **Alcance (checklist de entrega):**
  - Nombre artístico definitivo, propuesta de valor en una frase, bio breve `[PENDIENTE]`.
  - ≥ 8 fotos propias con autoría y cesión documentada + `alt` descriptivo `[PENDIENTE]`.
  - **1–3 IDs de YouTube del canal de la banda con la inserción activada**, más una **miniatura local ≤ 200 KB** por vídeo, título, duración y subtítulos si el audio importa `[PENDIENTE: canal]`.
  - Prensa: ≥ 3 menciones/hitos con fecha, lugar y permiso de logos documentado `[PENDIENTE]`.
  - ≥ 1 próximo bolo (fecha, hora, lugar, enlace) `[PENDIENTE]`.
  - Formato y repertorio: duración, número de músicos, equipo incluido/necesario, 10–15 canciones `[PENDIENTE]`.
  - Datos del responsable: nombre, NIF, domicilio, correo de contacto y de retirada de consentimiento `[PENDIENTE]`.
  - Dominio y registrador + correo de recepción (D-014) `[PENDIENTE]`.
  - URL de Instagram (canal alternativo) y decisión sobre precio (Q3).
- **Archivos previstos:** `docs/content/` (inventario con autor, permiso y fecha), `src/content/**` (alta del material). No toca componentes.
- **Criterios de aceptación:** cada pieza con autor, licencia/permiso y fecha; **cada vídeo comprobado en F0 con la inserción activa**; ningún `[PENDIENTE]` no aceptado en §9 del plan.
- **Pruebas:** la integración de T-12/T-13 verifica "0 marcadores en el HTML publicable". Sin tests unitarios.
- **Gate:** revisión humana del dueño + G0.10.

### T-01 — Andamiaje de calidad: CI, presupuestos y previews en Pages
- **Owner:** `devops`
- **Dependencias:** D-010 ratificada. Sin dependencias de código.
- **Objetivo:** que cualquier incumplimiento de G0 rompa el pipeline desde el primer commit, y que existan previews con `noindex`.
- **Archivos previstos:** `package.json` (scripts `test`, `test:coverage`, `test:e2e`, `mutation`, `gate`), `vitest.config.ts`, `playwright.config.ts`, `stryker.conf.json`, `lighthouserc.json`, `tests/unit/` + smoke, `tests/integration/`, `tests/e2e/smoke.spec.ts`, `.github/workflows/ci.yml`, `README.md` (comandos y umbrales).
- **Criterios de aceptación:**
  1. `npm ci && npm run gate` ejecuta build → typecheck → lint → unitarias → integración → mutación → E2E → Lighthouse → axe.
  2. Subir un umbral por encima de la cobertura real **hace fallar** el job (revertido en el mismo commit).
  3. Lighthouse CI aplica el presupuesto de §0 (incluidos hero ≤ 250 KB y galería ≤ 200 KB/imagen).
  4. axe-core corre contra las rutas y falla con 1 violación crítica inyectada de prueba (revertida).
  5. Proyecto de Pages conectado; previews con `X-Robots-Tag: noindex`; producción solo desde `main`; despliegues agrupados por el límite de 500 builds/mes.
  6. Umbrales documentados en `README.md`.
- **Pruebas requeridas:** smoke E2E y de integración; workflow ejecutado dos veces (verde y roja inducida).
- **Gate:** G0 completo, ya automatizado.

### T-02 — Layout único, estilos base y skip-link
- **Owner:** `frontend`
- **Dependencias:** T-01.
- **Objetivo:** una sola definición de `<head>`, idioma, metadatos base y skip-link compartida por `/`, `/privacidad` y `/aviso-legal` (F11).
- **Archivos previstos:** `src/layouts/Layout.astro` (nuevo), `src/styles/global.css`, `src/pages/index.astro`, `src/pages/privacidad.astro`.
- **Criterios de aceptación:**
  1. Ninguna página define `<head>`, `<html>` ni `<body>` propios.
  2. `<html lang="es">` y skip-link como primer elemento enfocable, funcional sin JS.
  3. Un solo `<title>` y un solo `canonical` por página (valores de T-13).
  4. Estilos globales definidos una vez (grep de duplicados = 0).
  5. Prop `noindex` centralizada en `Layout` para previews.
- **Pruebas:** integración (1 `head`, `lang`, skip-link, 1 `title`); E2E: tabulador enfoca el skip-link; mutación no aplica (declararlo).
- **Gate:** G0.1–G0.4, G0.8, G0.10.

### T-03 — Especificación UX de estados, fachada de vídeo y contraste
- **Owner:** `ux-designer`
- **Dependencias:** ninguna (lee plan §4 y §7). Entrega **antes** de T-05, T-07, T-08, T-09 y T-11.
- **Objetivo:** cerrar los entregables de diseño pendientes del plan §7 para que la UI no improvise estados ni accesibilidad.
- **Archivos previstos:** `docs/ux-spec.md` (nuevo). No modifica código.
- **Criterios de aceptación:**
  1. Estados de la **fachada de vídeo** en móvil: fachada → cargando → reproducido → error (miniatura + "ver en YouTube") → sin JS (enlace directo), con copy en español y comportamiento de foco.
  2. Estados del formulario a 360 px: inicial, error por campo, error global, validando, enviando, éxito, endpoint no configurado.
  3. Spec de galería: controles ≥ 44×44 px, teclado, sin autoavance, rejilla sin JS.
  4. Paleta con ratios de contraste calculados, incluida `#888078` sobre `#0a0a0a`, y corrección si no llega a 4,5:1.
  5. Ubicación y texto del aviso de privacidad de la fachada, visible sin JS.
- **Pruebas:** revisión por `spec-reviewer` (criterios comprobables). No aplica G0 de código.
- **Gate:** revisión documental aprobada; los criterios de UI de T-05/T-07/T-08/T-09/T-11 deben rastrearse a esta spec.

### T-04 — Content collections, esquemas y configuración de sitio
- **Owner:** `frontend`
- **Dependencias:** T-01, D-009 ratificada.
- **Objetivo:** sacar el contenido de los componentes y blindarlo con esquemas, con un único punto de configuración del sitio (D-009).
- **Archivos previstos:** `src/content.config.ts`, `src/content/{fotos,videos,hitos,bolos,textos}/`, `src/config/site.ts`, `src/config/contact.ts`, `tests/fixtures/` (datos sintéticos **no publicables**).
- **Criterios de aceptación:**
  1. El esquema rechaza foto sin `alt`, vídeo sin `poster`/`titulo`/`youtubeId`, bolo sin fecha ISO válida/hora/lugar y texto incompleto (test que espera el error).
  2. `site.ts` expone nombre, URL canónica, correo, Instagram y locale; la URL toma D-014 o un placeholder que no se publica.
  3. Colección vacía no rompe el build (sección oculta; lo consume T-06).
  4. Ningún componente contiene datos de contenido incrustados (`index.astro` e `ImageSlider` migrados o marcados para T-05/T-09).
  5. Los fixtures viven en `tests/` y nunca se emiten en `dist/`.
- **Pruebas:** unitarias de esquemas y `site.ts` 100 %; integración con colecciones vacías y con fixtures válidos; mutación ≥ 90 % en `src/config/` y esquemas.
- **Gate:** G0.1–G0.5, G0.10.

### T-05 — Portada: hero, propuesta y CTA de contratación
- **Owner:** `frontend`
- **Dependencias:** T-02, T-03, T-04.
- **Objetivo:** que en móvil, sin scroll, se entienda quién es la banda y exista una vía de contratación (F1).
- **Archivos previstos:** `src/components/Hero.astro`, `src/pages/index.astro`, `src/content/textos/`, imagen de portada en `src/assets/`.
- **Criterios de aceptación:**
  1. CTA de contratación visible sin scroll en 360×640 px y enlace funcional a `#contacto` sin JS.
  2. Nombre y propuesta desde content collections `[PENDIENTE: T-00]`.
  3. **Imagen de portada propia ≤ 250 KB**, optimizada con `astro:assets` (AVIF/WebP + `srcset`), con `width`/`height`.
  4. Contraste de texto ≥ 4,5:1 según la paleta de T-03.
  5. Cero cifras de alcance: grep de `seguidores|visualizaciones|oyentes` en `dist/` = 0 (D-012).
  6. Sin scroll horizontal a 320 px.
- **Pruebas:** integración (orden de secciones, CTA, ausencia de cifras, imagen con dimensiones); E2E 360 px + CTA por teclado; axe; Lighthouse.
- **Gate:** G0 completo (incluido hero ≤ 250 KB y portada ≤ 1,2 MB).

### T-06 — Secciones editoriales: prensa, trayectoria, formato/repertorio y próximos bolos
- **Owner:** `frontend`
- **Dependencias:** T-02, T-03, T-04. Material de T-00 para publicar.
- **Objetivo:** credibilidad verificable y agenda en lugar de cifras (F4, F5, F10; D-012).
- **Archivos previstos:** `src/components/{Press,Format,UpcomingGigs}.astro`, `src/lib/gigs.ts`, `src/content/{hitos,bolos,textos}/`.
- **Criterios de aceptación:**
  1. Cada sección se omite del HTML si su colección está vacía (sin títulos huérfanos).
  2. Hitos en orden cronológico inverso, con fecha y lugar; logos solo si `permiso: true`.
  3. `gigs.ts` oculta fechas pasadas en build con `now` inyectable; fecha y hora en formato local español.
  4. Formato: duración, músicos, equipo y 10–15 canciones; **sin franja de precio** hasta que Q3 se decida.
  5. Cero cifras de alcance en `dist/`.
- **Pruebas:** unitarias de `gigs.ts` 100 %; integración (presencia/ausencia de secciones, orden, `datetime` válido); mutación ≥ 90 %; axe.
- **Gate:** G0. Si no cabe en una sesión: `T-06a` (prensa + trayectoria) y `T-06b` (formato + bolos).

### T-07 — Integración de vídeo YouTube con fachada (contrato, contenido y política de terceros)
- **Owner:** `frontend`
- **Dependencias:** T-04. Material de T-00 para publicar.
- **Objetivo:** dejar el vídeo cableado a YouTube sin alojar nada: IDs validados en content collection, miniatura local, URL del embed sin autoplay y marco de privacidad explícito (F2, D-002 v3).
- **Archivos previstos:** `src/lib/youtube.ts` (nuevo), `src/content.config.ts` (validación de `youtubeId`), `src/content/videos/`, `src/pages/index.astro` (contenedor de la sección "en directo"), `docs/requisitos-cabeceras.md` (para T-13).
- **Criterios de aceptación:**
  1. `youtubeId` validado (formato de 11 caracteres y rechazo del resto); vídeo sin `poster` local → error de esquema.
  2. `buildEmbedUrl(id)` devuelve `https://www.youtube-nocookie.com/embed/<id>` **sin `autoplay=1`**; `watchUrl(id)` devuelve el enlace directo para el fallback.
  3. Sección "en directo" con **1–3 fachadas** (máx. 5 en total), servida sin JS y sin `<iframe>` en el HTML generado.
  4. **Ninguna imagen servida desde dominios de Google**: la miniatura es local, ≤ 200 KB, con `loading="lazy"` y `width`/`height`.
  5. Aviso de privacidad junto al botón: "Al reproducir se carga el reproductor de YouTube y se aplican sus políticas", enlazando a `/privacidad`.
  6. Requisitos documentados para T-13: `frame-src https://www.youtube-nocookie.com`, sin `img-src` de Google, `Referrer-Policy: strict-origin-when-cross-origin` (**nunca `no-referrer`**: el embed falla con error 153).
- **Pruebas:** unitarias de `youtube.ts` (`buildEmbedUrl`, `watchUrl`, validación de ID) 100 %; integración: 0 `<iframe>`, 0 referencias a `ytimg`/`googleapis`, poster con dimensiones y `lazy`, aviso presente sin JS; mutación ≥ 90 %.
- **Gate:** G0.1–G0.5, G0.8, G0.9, G0.10.

### T-08 — Fachada de vídeo accesible: clic-para-reproducir
- **Owner:** `frontend`
- **Dependencias:** T-03, T-07, decisión de `architect` sobre montaje del iframe y foco.
- **Objetivo:** que el vídeo no pese, no contacte con Google y no rompa el foco hasta que la persona lo pide (F2).
- **Archivos previstos:** `src/components/VideoFacade.astro`, `src/scripts/video-facade.ts`, `src/styles/` (ajustes).
- **Criterios de aceptación:**
  1. **Antes del clic: 0 peticiones** a `youtube.com`, `youtube-nocookie.com`, `ytimg.com`, `google.com`/`googleapis.com` y **0 cookies de terceros**; solo miniatura local (`loading="lazy"`, `width`/`height`, ≤ 200 KB).
  2. **Sin `<iframe>` ni script de YouTube en el HTML inicial.**
  3. El disparador es un `<button>` real con nombre accesible ("Reproducir vídeo: `<título>`"), no un `div`; visible y enfocable.
  4. Al activar con clic, enter o espacio se monta **un único iframe** `youtube-nocookie.com/embed/<id>` con `title` descriptivo, `allowfullscreen`, `loading="lazy"` y sin autoplay; el foco no salta de forma inesperada y escape lo devuelve al botón.
  5. Estado de error (iframe bloqueado o no disponible): se conserva la miniatura y aparece "Ver en YouTube" con `watchUrl`.
  6. Sin JS: enlace directo a YouTube visible y funcional.
  7. `prefers-reduced-motion`: sin transiciones al montar el iframe; nunca autoplay.
- **Pruebas:** unitarias de `video-facade.ts` (estados, teclado, construcción del embed delegada en `youtube.ts`, limpieza de listeners) 100 %; **E2E interceptando red**: (a) 0 peticiones y 0 cookies de terceros antes del clic, (b) tras el clic exactamente un iframe a `youtube-nocookie.com/embed/`, (c) recorrido completo con teclado, (d) sin JS funciona el enlace directo; integración: sin iframe en HTML inicial; mutación ≥ 90 %.
- **Gate:** G0 completo + prueba manual en iOS/Android (dependencia del `Referer`).

### T-09 — Galería de fotos accesible
- **Owner:** `frontend`
- **Dependencias:** T-02, T-03, T-04.
- **Objetivo:** mostrar el directo con fotos propias optimizadas, navegables y sin saltos de layout (F3).
- **Archivos previstos:** `src/components/Gallery.astro`, `src/scripts/gallery.ts` (sustituye `image-slider.ts`), `src/content/fotos/`, `src/assets/fotos/`.
- **Criterios de aceptación:**
  1. ≥ 8 fotos con `alt` descriptivo; sin fotos → la sección no se renderiza.
  2. AVIF/WebP con `srcset`/`sizes` vía `astro:assets`, **≤ 200 KB por imagen servida**, `width`/`height` explícitos; CLS ≤ 0,1.
  3. Controles ≥ 44×44 px, etiquetados en español, navegables por teclado; sin autoavance ni robo de foco.
  4. Sin JS se ve una rejilla estática con todas las fotos.
- **Pruebas:** unitarias de `gallery.ts` 100 %; integración (`srcset`, `alt`, dimensiones, rejilla sin JS, ningún `img` externo); E2E con teclado; mutación ≥ 90 %.
- **Gate:** G0 completo (galería ≤ 200 KB/imagen, portada ≤ 1,2 MB).

### T-10 — Worker `/api/contacto` con Resend y antispam
- **Owner:** `backend`
- **Dependencias:** D-014 (dominio verificado en Resend con SPF/DKIM), T-01, decisión de `architect` sobre rate limit.
- **Objetivo:** recibir, validar, frenar spam y entregar la solicitud sin exponer credenciales (F6, D-006).
- **Archivos previstos:** `functions/api/contacto.ts`, `functions/_lib/{validate.ts,origin.ts,ratelimit.ts,resend.ts}`, `docs/runbook-worker.md`, `.env.example`.
- **Criterios de aceptación:**
  1. `POST` URL-encoded al mismo origen → JSON `{ ok: true }` / `{ ok: false, error }` con 4xx/5xx; **sin JS** devuelve HTML de confirmación o de error.
  2. Validación en servidor: campos requeridos, email válido, longitudes máximas y límite de tamaño del body.
  3. Honeypot relleno → rechazo silencioso; `Origin`/`Referer` ajeno → 403; > 5 envíos/hora por IP → 429; marca de tiempo < 3 s → rechazo.
  4. Llamada a Resend con `RESEND_API_KEY` y `CONTACT_TO` del entorno; ninguna clave en respuesta, HTML ni logs.
  5. Fallo del proveedor → 5xx traducible a "usa Instagram como alternativa".
  6. Tres envíos reales recibidos en < 60 s.
  7. El rate limit usa **solo mecanismos gratuitos** (D-015); si la opción viable exige pago, se descarta, se documenta y se compensa con honeypot + origen + vigilancia.
- **Pruebas:** unitarias de `validate`, `origin`, `ratelimit` con reloj/IP inyectables 100 %; integración con runtime efímero (`wrangler dev`/Miniflare) y proveedor simulado → 200/400/403/429/5xx; E2E contra preview; mutación ≥ 90 %.
- **Gate:** G0 + revisión de secretos + cuota diaria de Resend no agotable por el límite.

### T-11 — Formulario cliente: progresivo, estados y consentimiento
- **Owner:** `frontend`
- **Dependencias:** T-03, T-10 (contrato), texto legal de T-12.
- **Objetivo:** convertir la visita en solicitud con o sin JS y con consentimiento explícito (F6, D-013).
- **Archivos previstos:** `src/components/ContactForm.astro`, `src/scripts/contact-form.ts`, `src/config/contact.ts`, anclaje `#contacto` en `index.astro`.
- **Criterios de aceptación:**
  1. Sin JS: `<form action="/api/contacto" method="post">` envía y recibe la confirmación del Worker.
  2. Checkbox de consentimiento **no premarcado** con el texto literal de D-013 y enlace a `/privacidad`.
  3. Errores por campo con `aria-live`/`role="status"` y foco en el primer campo inválido.
  4. Estados inicial/validando/enviando/éxito/error; en error global se conservan los datos y se ofrece Instagram.
  5. Endpoint no configurado → aviso visible.
  6. Todo `input` con `label`; se envían honeypot y marca de tiempo.
- **Pruebas:** unitarias de `contact-form.ts` 100 %; integración (`action`, `method`, checkbox sin `checked`, labels, `aria-live`); E2E: envío correcto, error de email, error de consentimiento, fallo del Worker conservando datos; mutación ≥ 90 %.
- **Gate:** G0 completo.

### T-12 — Política de privacidad y aviso legal
- **Owner:** `frontend` con **revisión jurídica humana obligatoria** (Q2).
- **Dependencias:** T-02, T-07 (aviso de la fachada), T-00 (datos del responsable).
- **Objetivo:** publicar las dos páginas legales completas y coherentes con el formulario, YouTube y los proveedores (F7, D-013).
- **Archivos previstos:** `src/pages/privacidad.astro`, `src/pages/aviso-legal.astro`, `src/components/Footer.astro`.
- **Criterios de aceptación:**
  1. Privacidad (art. 13 RGPD): responsable, finalidad, categorías, base jurídica **consentimiento 6.1.a**, encargados (Cloudflare, Resend), **Google/YouTube solo si el visitante reproduce** (IP y datos del reproductor), transferencias internacionales y DPA, retención **12 meses** en el buzón y la mínima de Resend (**30 días en Free**), derechos, retirada, AEPD.
  2. Aviso legal con los datos del art. 10 LSSI.
  3. **Coherencia con la fachada de vídeo**: el aviso de T-07/T-08 y la política dicen lo mismo sobre cookies y Google.
  4. Texto del checkbox de T-11 y plazos idénticos a D-013 y a la configuración del proveedor (checklist cruzada plan/repo/panel).
  5. Ambas páginas enlazadas desde el footer y el formulario; `grep "\[PENDIENTE" dist/` = 0 en contenido publicable.
- **Pruebas:** integración (0 marcadores, coincidencia de plazos/base, enlaces entrantes ≥ 2); axe sin críticas; E2E de navegación desde footer y checkbox.
- **Gate:** G0 + firma de revisión humana registrada en el PR. **Sin firma no se publica.**

### T-13 — SEO, cabeceras, aislamiento de terceros y validación final
- **Owner:** `frontend` con revisión de `devops` (cabeceras y entorno).
- **Dependencias:** T-02, T-05 a T-12, D-014 (dominio canónico), D-011 (analítica), decisiones de `architect` sobre `_headers` y sitemap.
- **Objetivo:** cerrar F8/F9 y dejar la puerta de salida del MVP en verde medible, sin ninguna dependencia de R2 (D-007 descartada).
- **Archivos previstos:** `astro.config.mjs` (`site`), `src/layouts/Layout.astro` (metadatos, OG, JSON-LD), `src/pages/sitemap.xml.ts` o integración equivalente, `public/robots.txt`, `public/_headers`, `public/og/[PENDIENTE].png`, `src/components/CookieFreeAnalytics.astro`, `lighthouserc.json`.
- **Criterios de aceptación:**
  1. `site` con el dominio canónico de D-014; `title`/`description` únicos; `canonical` absoluto.
  2. Open Graph 1200×630 con imagen real; JSON-LD `MusicGroup` válido.
  3. `sitemap.xml` con `/`, `/privacidad` y `/aviso-legal`; `robots.txt` con el sitemap.
  4. `_headers` con **`frame-src https://www.youtube-nocookie.com`**, **sin `img-src` de dominios de Google**, `Referrer-Policy: strict-origin-when-cross-origin` (**no `no-referrer`**), `X-Content-Type-Options: nosniff`, `Permissions-Policy` mínima, CSP (`script-src 'self'` + beacon) y `X-Robots-Tag: noindex` solo en previews.
  5. Beacon de Cloudflare Web Analytics solo en producción y solo si D-011 está ratificada; sin cookies ni banner.
  6. **Aislamiento verificado:** E2E que confirma 0 peticiones a dominios de YouTube/Google y 0 cookies de terceros antes del clic; iframe `youtube-nocookie` solo tras el clic.
  7. Miniaturas con `loading="lazy"` y dimensiones; Lighthouse dentro de presupuesto en las tres rutas; axe 0 críticas; checklist manual de accesibilidad y de reproducción completado.
- **Pruebas:** integración (metadatos únicos, canonical absoluto, JSON-LD parseable, sitemap con 3 rutas, `img` sin `alt` = 0, sin iframe inicial); test de build preview vs producción para `noindex` y `frame-src`; E2E de aislamiento y navegación completa; Lighthouse y axe de cierre.
- **Gate:** G0 completo + revisión de `reviewer` sobre cabeceras y CSP. Última tarea antes del go-live.

---

## 4. Dependencias y paralelización

```
T-00 ─────────────────────────────────(bloquea publicación, no implementación)
T-01 ──┬─ T-02 ─┬─ T-05 ─┐
       │        ├─ T-06 ─┤
T-03 ──┴─ T-04 ─┼─ T-07 ─┼─ T-08 ─┐
                ├─ T-09 ─┤         │
D-014 ── T-10 ── T-11 ───┤         ├─ T-13 ─ go-live
        T-12 (tras T-02 + T-07 + T-00) ─┘
```

- **Paralelizables:** T-03 con T-02/T-04 · **T-07 con T-05/T-06 en cuanto exista T-04** (el vídeo ya no depende de ningún aprovisionamiento externo) · T-08, T-09 y T-10 entre sí tras T-04 · T-12 con T-08/T-09 · T-11 tras T-10.
- **Secuenciales por contrato:** T-01 → resto · T-02 → T-05/T-06/T-09/T-12 · T-03 → T-05/T-06/T-08/T-09/T-11 · T-04 → T-05/T-06/T-07/T-09 · **T-07 → T-08** (`youtube.ts` es el único que construye URLs) · T-10 → T-11 · T-07 → T-12 · todo → T-13.
- **Ya no existen bloqueos de R2:** sin bucket, sin subdominio `media.`, sin cabeceras `Range`, sin caché de vídeo que validar. T-13 no comprueba nada de R2.
- **Bloqueos externos:** D-014 (T-10, criterio canónico de T-13, go-live), D-009 (T-04), D-010 (T-01), D-011 (criterio 5 de T-13), Q2 (publicación), T-00 (publicación), decisiones de `architect` (T-08, T-10, T-13).

## 5. Riesgos y bloqueantes

| Riesgo | Impacto | Mitigación en este plan |
|---|---|---|
| **Vídeo retirado, canal cerrado o inserción deshabilitada por el canal** | Alto: se pierde la prueba principal | ID y miniatura en content collection; sustituir y redesplegar; comprobación de inserción activa en T-00 y revisión trimestral; alternativa futura obligaría a reabrir D-002 y D-015 |
| **`Referrer-Policy: no-referrer` rompe el embed (error 153)** | Medio: el vídeo no se reproduce | `strict-origin-when-cross-origin` fijado en T-13; probado en preview y manualmente en iOS/Android (T-08) |
| **Datos e IP a Google al reproducir** | Medio (legal): mitigado, **no eliminado** | Fachada local, `youtube-nocookie`, sin autoplay, aviso junto al botón, declaración en la política (T-12); 0 cookies/peticiones antes del clic (G0.9) |
| **Dependencia de planes gratuitos (Resend, Pages, YouTube)** | Medio: cambio de condiciones rompe coste 0 | D-015 como regla; revisión trimestral; el formulario ofrece Instagram si Resend falla; el vídeo ofrece enlace directo |
| D-014 sin resolver | Alto: bloquea T-10, canonical y go-live | Previews y vídeo funcionan sin dominio; el dueño lo cierra antes de la ola 3 |
| D-009/D-010/D-011 sin ratificar | Alto: T-04, T-01 y T-13 no empiezan | Se ratifican antes de la ola 0; si se rechazan, se reescribe el alcance, no se improvisa |
| T-00 no entrega material | Alto: nada publicable | Fixtures sintéticos solo en `tests/`; el build publicable exige 0 marcadores |
| T-06 acumula 4 secciones | Medio: no cabe en una sesión | Regla de corte `T-06a`/`T-06b` sin cambiar alcance |
| Rate limit en Free no viable | Medio: T-10 sin defensa completa | Decisión de `architect` sin coste; alternativa documentada (honeypot + origen + vigilancia); nunca plan de pago (D-015) |
| Tests escritos antes de tener runner | Medio: gates falsos | T-01 va primero; cada tarea añade sus tests en el mismo commit |
| Legales sin revisión jurídica | Alto (legal) | T-12 exige firma humana; sin ella no hay publicación |
| 500 builds/mes en Pages | Bajo: no afecta al tráfico | Agrupar despliegues; previews solo cuando aporten |
| Auditoría manual de accesibilidad no automatizable | Medio | Checklist por release en la definición de terminado |

## 6. Primer grupo recomendado

**Ola 0 (paralela):** T-00 (dueño, en segundo plano) + T-01 (CI y presupuestos) + T-03 (spec UX).
**Ola 1:** T-02 → T-04.
**Ola 2:** T-05, T-06 y T-07 en paralelo (el vídeo ya no espera a ningún aprovisionamiento externo).

Motivo: T-01 hace efectivo G0 antes de escribir contenido y componentes; T-02 y T-04 eliminan la duplicación de `<head>` y de datos a fuego; T-03 fija los estados de la fachada y del formulario antes de implementarlos; T-07 en la ola 2 evita que el vídeo —la prueba de valor principal— quede al final.

## 7. Definición de terminado

**Por tarea:** criterios de aceptación marcados en el commit · G0 verde en los puntos aplicables · `reviewer` aprueba el diff · commit único que referencia `T-xx` · sin `[PENDIENTE]` en contenido publicable · sin secretos · sin servicios de pago.

**Del MVP (puerta de salida F1 del plan §14):**
1. F1–F8 y F11 cumplidas; F4/F5/F10 publicadas u ocultas según el material real de T-00.
2. G0 automatizado y verde en `main` (build, typecheck, lint, unitarias + integración ≥ 90 % con objetivo 100 %, mutación ≥ 90 %, E2E críticos, Lighthouse en presupuesto, axe 0 críticas).
3. **E2E de aislamiento de vídeo verde: 0 peticiones a YouTube/Google y 0 cookies de terceros antes del clic; iframe `youtube-nocookie` solo después.**
4. Tres envíos reales recibidos (móvil, escritorio y sin JS) con respuesta < 60 s.
5. Checklist manual de accesibilidad, de subtítulos y de reproducción en iOS/Android completado.
6. Cero marcadores en las páginas legales y en el contenido; revisión jurídica humana firmada.
7. Base jurídica, plazo, destinatarios y mención a Google idénticos en plan, repositorio, política y proveedor.
8. Previews con `noindex` verificado; rollback documentado (redeploy de la versión anterior).
9. Coste comprobado: **0 €/mes** en Pages, Worker, Resend, Web Analytics y YouTube; dominio como único gasto (D-015).
10. Trazabilidad revisada por `doc-reviewer`/`spec-reviewer` sobre plan, backlog y decisiones.

**Go-live:** lo ejecuta `devops` con visto bueno humano explícito; no se despliega a producción sin él.
