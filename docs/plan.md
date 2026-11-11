# Plan de producto — Web de Tejones Banda

> Estado: **Borrador vivo (v0.3)**, pendiente de aprobación del dueño.
> Última actualización: 2026-11-11. Responsable: product-analyst.
> Registro de decisiones: [`docs/DECISIONS.md`](./DECISIONS.md).
> Todo lo marcado `[PENDIENTE: …]` lo debe resolver el dueño. Cualquier límite o cifra sin fuente citada es **estimación propia**.

**Cambios de la v0.3:** vídeo pasa a **YouTube incrustado** con fachada clic-para-reproducir (D-002 redefine la decisión; D-007 descartada), imágenes autohospedadas y optimizadas con `astro:assets`, principio de coste cero salvo dominio (D-015) y eliminación de toda la infraestructura de vídeo propia.

---

## 1. Resumen ejecutivo

- **Idea:** una web de una sola página, en español, que presente a la banda, enseñe cómo suena y cómo se ve en directo, y convierta visitas en solicitudes de contratación.
- **Propuesta de valor para quien contrata:** ver en menos de un minuto que la banda es seria (vídeo real, fotos reales, trayectoria y prensa) y pedir disponibilidad sin fricción.
- **Problema:** hoy la banda depende de Instagram para enseñar su directo; quien organiza un evento no encuentra ficha, repertorio, formato ni una vía clara de contacto, y la conversación se pierde en mensajes directos.
- **Público principal:** ayuntamientos y comisiones de fiestas, empresas de eventos y particulares (bodas, aniversarios) en `[PENDIENTE: zona geográfica de actuación]`.
- **Alcance de la v1:** portada, vídeo de YouTube, galería, prensa y trayectoria, próximos bolos, formato y repertorio, formulario de contratación, política de privacidad y aviso legal. Sin cifras de alcance, sin panel, sin cuentas, sin pagos.
- **Estado de aprobación:** borrador. Aprobadas D-001, D-002 (v3), D-003 (superada), D-004, D-005, D-006, D-012, D-013 y D-015. Descartadas D-007 y D-008. Siguen como propuesta D-009, D-010, D-011 y D-014 (dominio).

## 2. Visión, objetivos y principios

- **Visión:** que la web resuelva la duda de "¿esta banda llena el escenario?" y sea el punto de entrada único para contratar.
- **Objetivos medibles** (solo con las herramientas decididas):
  1. **≥ 8 solicitudes de contratación cualificadas al mes** (conteo manual, sin spam ni duplicados).
  2. **Primera respuesta < 48 h** en el 90 % de las solicitudes (registro manual).
  3. **Rendimiento de laboratorio:** LCP ≤ 2,5 s, CLS ≤ 0,1 e INP ≤ 200 ms en móvil simulado (Lighthouse CI).
  4. **Aislamiento del vídeo:** 0 peticiones a dominios de YouTube y 0 cookies de terceros antes del clic (verificado en E2E).
  5. **Accesibilidad:** 0 violaciones críticas de axe-core y checklist manual completo en las tres páginas.
  6. **Coste:** único gasto, el dominio; 0 € de servicios recurrentes.
- **Principios:** una sola página, directa; el vídeo se pide, no se impone; el contenido crítico y el envío funcionan sin JavaScript; ningún dato personal sin base jurídica y plazo; **todo gratuito salvo el dominio** (D-015).
- **Fuera de objetivo:** portal de la escena musical, venta de entradas, gestión de riders, blog, newsletter, multiidioma (`/en/` incluido), tienda, vídeo autohospedado.

## 3. Público objetivo y escenarios

| Segmento | Necesidad principal | Qué mira primero |
|---|---|---|
| Ayuntamiento / comisión de fiestas | Encaje con público familiar y presupuesto cerrado | Vídeo en directo, formato, trayectoria, referencias de otros eventos |
| Empresa / agencia de eventos | Fiabilidad, factura, montaje | Formato técnico, trayectoria, respuesta rápida |
| Particular (boda, cumpleaños) | Emoción y disponibilidad | Fotos, vídeo, precio orientativo, facilidad de contacto |

- **Escenarios de uso:**
  1. Llega desde Instagram en el móvil y en 20 s quiere oír cómo suena → pulsa una fachada con miniatura y se reproduce el clip.
  2. Responsable de fiestas que compara tres bandas en el portátil → busca formato, repertorio y experiencia previa sin scroll infinito.
  3. Ya decidido, quiere saber si hay hueco el 15 de agosto → formulario con fecha y lugar.
- **Supuestos por validar (no hechos):** (a) la decisión se toma tras ver vídeo; (b) el formulario convierte mejor que un DM de Instagram; (c) prensa y trayectoria convencen más que cifras de seguidores.

## 4. Funcionalidades, alcance y criterios de aceptación

Prioridad: **P0** imprescindible en v1, **P1** deseable, **P2** fase posterior.

| # | Funcionalidad | Fase | Prioridad | Criterios de aceptación medibles | Estado |
|---|---|---|---|---|---|
| F1 | Portada con nombre, propuesta y CTA | v1 | P0 | CTA visible sin scroll en 360×640 px; nombre real `[PENDIENTE: nombre artístico definitivo]`; imagen de portada ≤ 250 KB; contraste ≥ 4,5:1; sin cifras de alcance | Parcial (existe base) |
| F2 | Vídeo de YouTube con fachada | v1 | P0 | **Antes del clic: 0 peticiones a dominios de YouTube y 0 cookies de terceros**, solo una miniatura local y un botón; **tras el clic se usa `youtube-nocookie.com`**, sin autoplay, con `title` descriptivo y `allowfullscreen`; 1–3 vídeos visibles (máx. 5 en total), guardados como ID en la content collection; teclado completo; estado de error con enlace a YouTube; aviso de privacidad junto al botón; **si el clip lleva audio, subtítulos o transcripción obligatorios**; checklist manual (foco, contraste, teclado, subtítulos) además de axe | Pendiente |
| F3 | Galería de fotos | v1 | P0 | ≥ 8 fotos reales con `alt` descriptivo; AVIF/WebP con `srcset`; **≤ 200 KB por imagen**, muy por debajo del límite de 25 MiB por archivo del host; `width`/`height` explícitos; CLS ≤ 0,1; teclado completo y controles ≥ 44×44 px; sin fotos → sección oculta | Parcial (slider sin imágenes reales) |
| F4 | Prensa y trayectoria | v1 | P1 | ≥ 3 hitos con fecha y lugar `[PENDIENTE: datos reales]`; logos y menciones solo con permiso documentado; sin cifras de seguidores ni visualizaciones; sin material → sección oculta | Pendiente |
| F5 | Formato y repertorio | v1 | P1 | Duración del bolo, número de músicos, equipo incluido/necesario y 10–15 canciones `[PENDIENTE: datos reales]`; franja de precio `[PENDIENTE: decidir]` | Pendiente |
| F6 | Formulario → Worker → Resend | v1 | P0 | Envío real en < 60 s; validación accesible con `aria-live`; funciona sin JS mediante POST nativo al Worker; checkbox de consentimiento **no premarcado** con el texto de D-013; estados inicial/validando/enviando/éxito/error; **ninguna credencial en HTML ni en el bundle**; fallo → mensaje claro y alternativa por Instagram | Parcial (validación hecha, endpoint sin conectar) |
| F7 | Privacidad y aviso legal | v1 | P0 | Base jurídica única (consentimiento, art. 6.1.a), retirada explicada, **12 meses en el buzón** y mínimo en Resend con el mismo texto en plan, repositorio y proveedor; destinatarios (Cloudflare, Resend) y mención a YouTube solo al reproducir; derechos y AEPD; aviso legal con datos del art. 10 LSSI; sin marcadores | Parcial (borrador, solo privacidad) |
| F8 | SEO, dominio y cabeceras | v1 | P0 | `site` fijado en `astro.config` (D-014); `title`/`description` únicos; `canonical` absoluto; Open Graph 1200×630; JSON-LD `MusicGroup`; `sitemap.xml` con las tres páginas; `robots.txt` con sitemap; `_headers` con `noindex` en previews; **miniaturas de vídeo con `loading="lazy"` y dimensiones explícitas** (locales, para no romper F2) | Pendiente |
| F9 | Analítica sin cookies | v1 | P1 | Beacon de Cloudflare Web Analytics solo en producción; sin cookies de terceros; sin banner si la revisión legal lo confirma | Pendiente (D-011) |
| F10 | Próximos bolos (fechas manuales) | v1 | P1 | ≥ 1 fecha con lugar y hora; fechas pasadas ocultas en build; sin fechas → sección oculta; formato local español | Pendiente |
| F11 | Layout compartido | v1 | P0 | Una sola definición de `<head>` (idioma, metadatos, canonical, OG, skip-link, noindex de preview) usada por `/`, `/privacidad` y `/aviso-legal`; sin duplicar estilos globales | Pendiente |
| F12 | EPK descargable y galería ampliada | v2 | P2 | PDF de prensa con foto, bio, formato y contacto; enlazado desde prensa | Fuera de v1 |

- **MVP:** F1, F2, F3, F6, F7, F8, F11 (+ F4, F5, F10 si hay contenido; F9 si la revisión legal lo permite).
- **Fases posteriores:** F12, fechas desde un calendario (ICS) en build.
- **Fuera de alcance (no reabrir sin decisión nueva):** panel, cuentas, pagos o señal, reserva en calendario, multiidioma, blog, newsletter, comentarios, **sección de cifras** (D-012) y **vídeo autohospedado** (D-002 v3 / D-007 descartada).

### Estrategia de pruebas y puertas automáticas

Hoy no hay tests ni CI (D-010). Se propone, con **npm**:

- **Unitarias (Vitest + jsdom):** `src/scripts/contact-form.ts`, `src/scripts/image-slider.ts` y `src/scripts/video-facade.ts` (estado antes/después del clic, construcción de la URL `youtube-nocookie`, teclado) más `src/config/*.ts`. Cobertura de líneas y ramas: **objetivo 100 %, mínimo 90 %**.
- **Integración:** `npm run build` y validación del HTML generado: formulario con `action`, `method` y consentimiento sin `checked`; todo `input` con `label`; `lang="es"`; `canonical` absoluto; JSON-LD parseable; ningún `img` sin `alt` ni sin `width`/`height`; **ningún `<iframe>` de YouTube en el HTML inicial**. Cobertura del código compartido: **objetivo 100 %, mínimo 90 %**.
- **Combinado:** reporte agregado unitarias + integración con el mismo umbral; el pipeline falla por debajo.
- **Mutación (Stryker):** sobre `src/scripts/` y `src/config/`; **objetivo 100 %, mínimo 90 %** de mutantes válidos no equivalentes.
- **UI/E2E (Playwright, Chromium y WebKit móvil):** (1) envío correcto; (2) error de email y consentimiento con foco y mensaje anunciado; (3) fallo del Worker/Resend → error visible y datos conservados; (4) **ninguna petición a `youtube.com`, `youtube-nocookie.com`, `ytimg.com` ni `google.com` antes del clic** (interceptando `request`); (5) tras el clic, el iframe apunta a `youtube-nocookie.com/embed/…` y no hay cookies de esos dominios antes; (6) reproducción accesible con teclado; (7) navegación completa de la galería; (8) 360 px sin scroll horizontal; (9) privacidad y aviso legal enlazados desde el formulario.
- **Manuales (una vez por release):** reproducción real en iOS y Android (YouTube bloquea embeds sin `Referer`; no endurecer `Referrer-Policy` a `no-referrer`), subtítulos legibles y lectura con lector de pantalla.
- **Build/CI (GitHub Actions):** `npm ci` → `npm run build` → typecheck → lint → unitarias con cobertura → integración → mutación → E2E → Lighthouse CI → axe-core. Cualquier umbral incumplido bloquea el despliegue.
- **No se exige** preproducción ni validación con usuarios reales en este flujo.

### Presupuesto de rendimiento (único y verificable)

- **HTML + CSS + JS inicial ≤ 300 KB** transferidos (gzip), todo incluido.
- **Portada ≤ 1,2 MB sin contar el vídeo**, que no se descarga: imagen de portada ≤ 250 KB y miniaturas ≤ 200 KB.
- **El reproductor no pesa hasta que se pide:** no hay iframe ni script de YouTube en la carga inicial.
- LCP ≤ 2,5 s, CLS ≤ 0,1, INP ≤ 200 ms en móvil simulado.
- Cero fuentes externas o una sola con `font-display: swap`.
- Medido con Lighthouse CI en laboratorio; se etiqueta como **proxy de laboratorio**.

**Restricciones del host que condicionan los assets (hechos, docs Cloudflare Pages 2026-09-05):** **25 MiB por archivo**, **500 builds/mes**, 20.000 archivos. Las imágenes quedan dos órdenes de magnitud por debajo del tamaño máximo; los builds/mes limitan cuántas veces se sube material nuevo, no el tráfico.

## 5. Gamificación e incentivos
No aplica. No hay progresión, puntos ni usuarios registrados.

## 6. Confianza, moderación y antifraude

- **Contenido que requiere control:** fotos y vídeos propios `[PENDIENTE: canal de YouTube y cesión del fotógrafo]`; logos de prensa y eventos `[PENDIENTE: permiso]`.
- **Amenazas del formulario:** spam y agotamiento de la cuota de Resend.
- **Defensas (D-006):** honeypot; verificación de `Origin`/`Referer`; **rate limit en el Worker** por IP (5 envíos/hora, valor inicial); rechazo si la marca de tiempo indica menos de 3 s (solo con JS).
- **Vídeo:** el contenido es de un tercero; no se modera, solo se elige qué ID se publica.
- **Moderación:** no hay contenido de usuarios; revisión manual del buzón (S-04).

## 7. Guía funcional de UI/UX

> Borrador de product-analyst a partir del código actual. **No revisado por `ux-designer`** (subagentes anidados no disponibles). **No validado con usuarios.**

- **Principios:** columna narrativa única en móvil; jerarquía tipográfica marcada; estética oscura con acento dorado ya existente; el vídeo se pide, no se impone.
- **Mapa de pantallas:** `/` (portada → en directo/vídeo → galería → prensa y trayectoria → próximos bolos → formato → contacto → pie), `/privacidad` y `/aviso-legal`.
- **Flujos:**
  1. **Descubrir:** aterrizaje → portada → fachada de vídeo → clic → reproductor.
  2. **Convencer:** galería → prensa y trayectoria → formato/repertorio → próximos bolos.
  3. **Contratar:** CTA → formulario → validación → éxito; si falla, alternativa por Instagram.
- **Estados requeridos:**
  - **Vídeo:** fachada (miniatura + botón + aviso de privacidad) → cargando (sustitución por el iframe) → error (se conserva la miniatura y se ofrece "ver en YouTube") → sin JS: enlace directo a YouTube.
  - **Formulario:** inicial; error por campo; error global; enviando (botón deshabilitado, "ENVIANDO…"); éxito con resumen; aviso si el endpoint no está configurado (ya existe).
  - **Galería:** carga, imagen visible, sin fotos → sección oculta.
  - **Prensa/trayectoria:** sin material → sección oculta; con material, orden cronológico inverso.
  - **Próximos bolos:** con fechas; sin fechas → oculto; fecha pasada → no se muestra.
- **Accesibilidad (WCAG 2.2 AA):** contraste ≥ 4,5:1 (revisar `#888078` sobre `#0a0a0a`, en el límite); foco visible; `prefers-reduced-motion` respetado; el botón de la fachada es un `<button>` real con nombre accesible, no un `div`; tras cargar el iframe, el foco no salta de forma inesperada; subtítulos si el audio es relevante; errores con `role="status"`; enlace "saltar al contenido"; el iframe lleva `title` descriptivo.
- **Entregables de diseño pendientes:** estados de la fachada en móvil, especificación del consentimiento en el formulario y revisión de contraste.
- **i18n:** no aplica (D-004).

## 8. Arquitectura técnica (propuesta, sujeta a `architect`)

| Área | Opción aprobada/propuesta | Alternativas | Motivo | Estado |
|---|---|---|---|---|
| Framework | Astro 7, salida estática | Next/Vite SPA | Ya está; cero JS por defecto | Verificado |
| Hosting | **Cloudflare Pages Free** | Netlify, GitHub Pages | Assets gratuitos e ilimitados | **Aprobada (D-005)** |
| Vídeo | **YouTube embebido con fachada y `youtube-nocookie`** | Autohospedado, Stream | Coste 0 y sin transcodificar | **Aprobada (D-002 v3)** |
| Imágenes | **`astro:assets` + `<Image>`, AVIF/WebP, en el despliegue** | CDN externa | Coste 0 y optimización en build | **Aprobada (D-002 v3)** |
| Formulario | **Worker propio (Pages Functions) → Resend** | Web3Forms, Formspree, Netlify Forms | Clave en secreto; 3.000 emails/mes | **Aprobada (D-006)** |
| Dominio | Propio, canónico único | `*.pages.dev` | Requisito de Resend y SEO | **Propuesta (D-014)** |
| Contenido | Content collections (`fotos`, `videos` con `youtubeId` y `poster`, `hitos`, `bolos`, `textos`) | Datos en componentes | Evita tocar maquetación | Propuesta (D-009) |
| Layout | `src/layouts/Layout.astro` único | Duplicar `<head>` | Hoy se repite por página | Tarea F11 |
| Analítica | Cloudflare Web Analytics (sin cookies) | GA4, ninguna | Sin banner; bajo peso | Propuesta (D-011) |
| Gestor de paquetes | npm | pnpm/yarn | Coherente con el repo | Fijado |

- **Componentes:** `Layout`, `Hero`, `VideoFacade` (botón + miniatura local + aviso; monta el iframe al clic), `Gallery`, `Press`, `UpcomingGigs`, `Format`, `ContactForm`, `Footer`, `CookieFreeAnalytics`.
- **Contrato del formulario:** `POST` URL-encoded a `/api/contacto` (mismo origen); el Worker valida campos, origen, honeypot y rate limit; llama a `POST https://api.resend.com/emails` con `RESEND_API_KEY` desde el secreto; responde `{ ok: true }` o `{ ok: false, error }` con 4xx/5xx; el cliente traduce a español. Sin JS, POST nativo con respuesta HTML.
- **Secretos:** `RESEND_API_KEY` y `CONTACT_TO` como variables de entorno de Pages (producción y preview), nunca en `PUBLIC_*`.
- **Seguridad y cabeceras:** CSP con `script-src 'self'` + beacon, `connect-src 'self'` + `api.resend.com` (solo servidor), `frame-src https://www.youtube-nocookie.com`, **sin `img-src` de dominios de Google**; `Referrer-Policy: strict-origin-when-cross-origin` (no `no-referrer`: YouTube exige `Referer` y devuelve error 153 sin él); `X-Content-Type-Options: nosniff`; `Permissions-Policy` mínima; sin `innerHTML` con datos del usuario; límite de tamaño del body en el Worker.
- **Decisiones que requieren `architect`:** rate limit por IP en plan Free (KV, Durable Objects o reglas de Rate Limiting de Cloudflare); cómo generar `_headers` con `noindex` solo en previews; montaje del iframe sin saltos de foco ni CLS; validación de HTML generado sin acoplarse al marcado.

## 9. Datos, fuentes y calidad

- **Contenido:** fotos propias `[PENDIENTE: relación y autoría]`; **IDs de YouTube y miniatura local por vídeo** `[PENDIENTE: canal y clips]`; hitos de trayectoria `[PENDIENTE: fechas y lugares]`; prensa `[PENDIENTE: menciones y permisos]`; próximos bolos `[PENDIENTE]`; formato y repertorio `[PENDIENTE]`; contacto y redes `[PENDIENTE: correo, Instagram]`.
- **Datos personales:** nombre, email, teléfono, tipo/fecha/lugar del evento, mensaje y consentimiento (fecha y versión de la política). Sin cookies ni datos de navegación propios.
- **Datos de terceros:** al pulsar reproducir, Google recibe IP y datos del reproductor; declarado en la política (D-013).
- **Modelo conceptual:** `Video` (id, título, poster, duración, subtítulos), `Foto` (src, alt, créditos), `Bolo` (fecha, lugar, hora), `Solicitud` (en buzón y logs de Resend).
- **Licencias:** fotos con permiso del fotógrafo; clips sin fonogramas de terceros sin licencia `[PENDIENTE: verificar]`; la inserción de YouTube está permitida si el canal no la desactiva (condiciones de YouTube, 2026-11-11).
- **Calidad:** los esquemas rechazan fotos sin `alt`, vídeos sin `poster` o sin `youtubeId` válido, y bolos sin lugar/fecha.

## 10. Infraestructura, operación y coste

- **Entornos:** local (`astro dev`), previews de Pages y producción. Sin staging dedicado.
- **Despliegue:** push a `main` → build → tests → publicación; rollback por redeploy anterior. Previews con `noindex`.
- **Assets:** imágenes generadas en build dentro de `_astro/`; sin CDN externa.
- **Vídeo:** no se aloja nada; solo IDs y miniaturas locales. Si un vídeo deja de estar disponible, se cambia el ID en la content collection y se redespliega.
- **Worker:** ruta `/api/contacto`; secreto rotable; logs revisados ante quejas.
- **Monitorización:** revisión semanal del buzón; **solicitud de prueba mensual** para confirmar Worker + Resend; revisión trimestral de que los vídeos siguen disponibles.
- **Coste (2026-11-11; dominio es estimación propia):**

  | Concepto | Coste | Base |
  |---|---|---|
  | Cloudflare Pages Free | 0 € | Assets estáticos gratuitos e ilimitados (docs) |
  | Pages Functions / Worker | 0 € | Free: 100.000 peticiones/día (docs) |
  | Resend Free | 0 € | 3.000 emails/mes, 100/día (docs) |
  | Cloudflare Web Analytics | 0 € | Incluido |
  | YouTube embebido | 0 € | Sin coste de alojamiento ni tráfico |
  | Dominio | 10–15 €/año (**estimación propia**) | `[PENDIENTE: registrar/renovar]` |
  | **Total** | **≈ 1 €/mes** | Único gasto aceptado (D-015) |

- **Continuidad:** si Resend o el Worker fallan, el formulario muestra error y ofrece Instagram; si YouTube falla, queda la miniatura y el enlace directo.

## 11. Escalado y evolución

| Señal medida | Umbral | Cambio posible |
|---|---|---|
| Envíos/mes en Resend | > 2.500 | Revisar antispam o replantear el plan (requiere decisión, D-015) |
| Builds/mes en Pages | > 400 | Agrupar cambios; el límite es de despliegues, no de tráfico |
| Tamaño de imagen | > 500 KB | Revisar el pipeline de `astro:assets` |
| Bolos editados a mano | > 3 cambios/mes | Automatizar desde un calendario ICS en build |
| Peticiones de otros idiomas | ≥ 10 correos | Añadir `/en/` (decisión nueva) |

- **Evitar anticipar complejidad sin señal:** sin CMS, sin i18n, sin base de datos, sin infraestructura de vídeo.
- **Si en el futuro el embed deja de servir** (canal cerrado, condiciones), la alternativa sería alojar el vídeo nosotros mismos, lo que obligaría a reabrir D-002 y D-015.

## 12. Modelo de negocio y sostenibilidad

- **Quién obtiene valor:** la banda (contratos) y quien contrata (decisión rápida).
- **Quién paga:** la banda; **único gasto el dominio** (10–15 €/año, estimación propia). Servicios en plan gratuito.
- **Riesgos:** si un proveedor cambia su plan gratuito, hay que reevaluar (D-015); el mantenimiento es tiempo de una persona.
- **Estado:** aplicable solo como coste operativo.

## 13. Lanzamiento y primeros usuarios

- **Segmento inicial:** ayuntamientos y comisiones de fiestas de `[PENDIENTE: comarcas/ciudades]`.
- **Canales:** enlace en la biografía de Instagram, firma de correo, QR en carteles y tarjeta física.
- **Preparación:** contenido real (fotos, IDs de vídeo, miniaturas, prensa, trayectoria, bolos, formato), tres envíos reales desde móvil y escritorio y **textos legales revisados por una persona con criterio jurídico**.
- **Riesgos de arranque (hipótesis):** vídeo sin subir o con inserción desactivada; buzón sin revisar; prensa publicada sin permiso.

## 14. Hoja de ruta y puertas

| Fase | Resultado | Puerta de salida | Decisión al cierre |
|---|---|---|---|
| **F0 — Contenido y pendientes** | Resueltos los `[PENDIENTE]`: dominio y correo (D-014), fotos con derechos, IDs de vídeo con inserción activa, textos de formato/repertorio, prensa, bolos y datos del responsable | Cada `[PENDIENTE]` resuelto o aceptado explícitamente; sin marcadores en contenido publicable | Iniciar F1 |
| **F1 — MVP** | Página completa con vídeo, galería, prensa/trayectoria, bolos, formato, formulario real y legales | F1–F8 y F11 cumplidas; presupuesto de rendimiento y axe en verde; **E2E de cero peticiones a YouTube antes del clic**; 3 envíos de prueba recibidos; legales sin marcadores y coherentes con plan y proveedor | Publicar |
| **F2 — Pulido** | Analítica (si se aprueba), SEO fino, revisión manual de accesibilidad | 30 días de visitas; sin incidencias de entrega; checklist manual completo | Mantener o iterar |
| **F3 — Opcional** | Fechas desde ICS y EPK descargable | Petición explícita y evidencia de que el trabajo manual duele | Construir o descartar |

- **Dependencias:** F1 depende de F0; D-014 bloquea F6 y F8. D-009, D-010 y D-011 pendientes de aprobación.
- **Fechas:** `[PENDIENTE: fecha objetivo de publicación]`.

## 15. Métricas de éxito

| Métrica | Definición | Cómo se mide | Objetivo |
|---|---|---|---|
| Solicitudes recibidas | Envíos válidos al mes | Conteo manual en el buzón | ≥ 8/mes |
| Tiempo de respuesta | Horas hasta la primera respuesta | Registro manual | < 48 h en el 90 % |
| Rendimiento | LCP/CLS/INP | Lighthouse CI | LCP ≤ 2,5 s; CLS ≤ 0,1; INP ≤ 200 ms |
| Peso | HTML+CSS+JS y portada | Lighthouse CI | ≤ 300 KB y ≤ 1,2 MB |
| Aislamiento del vídeo | Peticiones y cookies de terceros antes del clic | Playwright (intercepción de red) | 0 |
| Accesibilidad | Violaciones y checklist | axe-core + manual | 0 críticas |
| Coste | Facturación | Panel de proveedores | 0 € + dominio |

> Limitación declarada: sin cookies ni eventos personalizados no se mide conversión de formulario, origen del tráfico ni reproducciones.

## 16. Riesgos, seguridad, legal y privacidad

| Riesgo | Impacto | Mitigación | Estado |
|---|---|---|---|
| YouTube retira el vídeo o cierra el canal | Alto | ID y miniatura en content collection; sustituir y redesplegar; revisión trimestral | Aceptado (D-002) |
| Inserción desactivada por el canal | Medio | Comprobación en F0 y en cada sustitución | Aceptado |
| Cookies o datos a Google antes de tiempo | Alto (legal) | Fachada local, sin iframe en el HTML inicial, `youtube-nocookie`, sin autoplay, aviso, CSP | Aprobado (D-002/D-013) |
| `Referrer-Policy` demasiado estricta rompe el embed | Medio | Mantener `strict-origin-when-cross-origin`; probar en iOS y Android | Previsto |
| Worker o Resend no entregan | Alto | Estados de error, alternativa Instagram, prueba mensual | Previsto |
| Spam agota la cuota de Resend | Medio | Honeypot + origen + rate limit + vigilancia | Aprobado (D-006) |
| Legales incompletos o incoherentes | Alto (legal) | Base única consentimiento, plazos idénticos, aviso legal, revisión humana | Abierto |
| Cambio de planes gratuitos | Medio | Reevaluar contra D-015 | Aceptado |
| Fotos o logos sin derechos | Medio | Cesión y permisos documentados | Abierto |

- **Datos personales:** responsable `[PENDIENTE: nombre/NIF/dirección]`; **base jurídica única: consentimiento (art. 6.1.a RGPD)**; finalidad: responder a la solicitud; destinatarios: Cloudflare y Resend como encargados, y Google/YouTube **solo si el visitante reproduce**; conservación **12 meses** en el buzón; derechos, retirada y reclamación ante la AEPD.
- **Consentimiento:** checkbox vacío, texto de D-013, registro de fecha y versión de la política.
- **Transferencias internacionales:** Cloudflare, Resend y Google (al reproducir) tienen sede en EE. UU.; documentar DPA y cláusulas contractuales tipo. **Requiere verificación legal humana.**
- **Cookies:** propias y de terceros ausentes hasta el clic; `youtube-nocookie` reduce pero no elimina la relación con Google al reproducir. Cloudflare Web Analytics no usa cookies (docs 2026-07-14), pendiente de confirmar la exención con la guía de la AEPD (mayo 2024).
- **Seguridad:** CSP con `frame-src` acotado, cabeceras en `_headers`, secretos solo en entorno, honeypot, sin HTML dinámico con datos de usuario.
- **Asesoramiento pendiente:** privacidad, aviso legal y DPA. Este plan no lo sustituye.

## 17. Experimentos y funciones opcionales

- **Hipótesis 1:** la fachada con miniatura real convierte más que un enlace de texto a YouTube. Experimento: 30 días con cada variante. Criterio: +20 % de clics en reproducir.
- **Hipótesis 2:** publicar "desde X €" filtra solicitudes no cualificadas y mejora el cierre. Criterio: menos solicitudes, mismo número de contratos. Requiere decisión del dueño.
- **Hipótesis 3:** prensa y trayectoria convencen más que una sección de cifras. Comparación por periodos, sin medición automática.
- **Hipótesis 4:** mostrar una transcripción corta del clip ayuda a decidir sin reproducir. Criterio: más solicitudes con la transcripción visible.
- **Estado:** todas pendientes; ninguna entra en v1.

## 18. Trabajo con agentes de IA

- **Descubrimiento:** `product-analyst` (este documento).
- **Investigación:** prevista con `researcher`; **no disponible en esta sesión** por el límite de subagentes anidados.
- **UX y revisión:** `ux-designer`, `spec-reviewer` y `doc-reviewer` pendientes de ejecutar en una sesión de primer nivel.
- **Implementación:** `frontend` (Layout, componentes, fachada de vídeo) y `devops` (Worker, secretos, CI). Nada empieza sin plan y backlog aprobados.
- **Revisión humana obligatoria:** contenido, textos legales y aprobación del plan.
- **Validación sin usuarios reales:** pruebas técnicas, Lighthouse, axe y revisión interna; las hipótesis de §17 quedan sin validar.
- **Límites:** no se inventan cifras ni contenido, no se modifican decisiones aprobadas sin registro y no se despliega sin visto bueno humano.

## 19. Decisiones abiertas y próximos pasos

| ID | Decisión/pregunta | Opciones | Recomendación | Quién decide |
|---|---|---|---|---|
| D-014 | Dominio canónico y registrador | Dominio nuevo / existente | Dominio propio en Cloudflare (necesario para Resend y SEO) | Dueño (bloquea F0) |
| Q2 | Revisión legal de privacidad, aviso legal y DPA | Profesional externo / plantilla revisada | Revisión externa antes de publicar | Dueño |
| Q3 | ¿Se publica franja de precio? | Sí / solo por formulario | Solo por formulario en v1 | Dueño |

**Próximos pasos tras la aprobación:** pasar el plan a `project-planner`; el backlog se aprueba por separado.
**Criterio para pasar a `project-planner`:** plan aprobado; D-014 resuelta o aceptada como bloqueante de F0; Q2 y Q3 respondidas o aceptadas como pendientes explícitas.

## Fuentes

| Afirmación respaldada | Fuente directa | Fecha de consulta | Plan/versión y límites |
|---|---|---|---|
| Pages Free: 25 MiB por archivo, 500 builds/mes, 20.000 archivos, 100 dominios | https://developers.cloudflare.com/pages/platform/limits/ | 2026-11-11 | Doc 2026-09-05 |
| Pages: assets estáticos gratuitos e ilimitados; Functions en Workers Free (100.000 req/día) | https://developers.cloudflare.com/pages/functions/pricing/ | 2026-11-11 | Doc 2026-09-08 |
| Netlify Free: 300 créditos/mes, 20 créditos/GB de banda | https://www.netlify.com/pricing/ | 2026-11-11 | Alternativa descartada |
| Resend Free: 3.000 emails/mes, 100/día; retención 30 días en Free | https://resend.com/pricing | 2026-11-11 | Precios en USD |
| YouTube: inserción con «modo de privacidad mejorada» = dominio `youtube-nocookie.com`; requiere `Referer` (error 153 sin él); `autoplay=1` es opcional | https://support.google.com/youtube/answer/171780?hl=es | 2026-11-11 | Centro de ayuda de YouTube en español |
| Instagram Basic Display API deja de estar disponible el 2024-12-04 | https://developers.facebook.com/blog/post/2024/09/04/update-on-instagram-basic-display-api/ | 2026-11-11 | Comunicado de Meta |
| YouTube Data API v3: 10.000 unidades/día; `channels.list` cuesta 1 | https://developers.google.com/youtube/v3/determine_quota_cost | 2026-11-11 | Cuota por defecto |
| Cloudflare Web Analytics: sin cookies, sin UTM, sin eventos personalizados | https://developers.cloudflare.com/web-analytics/faq/ | 2026-11-11 | Doc 2026-07-14 |
| Guía de cookies de la AEPD (analítica exenta y art. 22.2 LSSI) | https://www.aepd.es/guias/guia-cookies.pdf | 2026-11-11 | Versión mayo 2024 |
| RGPD, arts. 6 y 13 | https://eur-lex.europa.eu/eli/reg/2016/679/oj | 2026-11-11 | Texto oficial |
| LSSI, art. 10 (información del prestador) | https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758 | 2026-11-11 | Consolidado; no descargado en esta sesión |

**Estimaciones propias (sin fuente):** coste del dominio (10–15 €/año); rate limit de 5 envíos/hora; umbral de 3 s; retención de 12 meses; tamaños objetivo de imagen (250/200 KB); objetivos de solicitudes y tiempo de respuesta.

## Aprobación

- **Aprobado por:** pendiente.
- **Fecha:** pendiente.
- **Versión del documento:** v0.3 (borrador).
- **Pendientes aceptados explícitamente:** ninguno todavía.

---

## Preguntas abiertas de alto impacto (máximo 3)

1. **¿Dominio y correo de recepción?** (D-014) Sin dominio canónico no se puede verificar el remitente en Resend ni fijar `site`, sitemap y canonical; es el único bloqueante técnico de F0/F1 y el único coste previsto.
2. **¿Quién revisa los textos legales y cuándo?** Hacen falta nombre, NIF, dirección y correo del responsable, y una persona que valide privacidad, aviso legal y DPA antes de publicar (incluida la mención a Google al reproducir).
3. **¿Qué material real hay y con qué permisos?** Fotos, canal de YouTube y clips con inserción activa, menciones de prensa, hitos y próximos bolos: define si las secciones nuevas se publican u ocultan y si el presupuesto de imágenes se cumple.
