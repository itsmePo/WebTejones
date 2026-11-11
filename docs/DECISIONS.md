# Registro de decisiones del producto — Tejones Banda

Registro vivo. Estados: `propuesta`, `aprobada`, `descartada`, `reemplazada`.
Última revisión: 2026-11-11 (v3). Las decisiones marcadas como aprobadas las tomó el dueño del producto; el resto siguen pendientes de aprobación expresa. Cada cambio deja constancia de qué versión sustituye.

---

## D-001 — La contratación se resuelve con un formulario que envía la solicitud por email
- **Fecha:** 2026-11-11
- **Estado:** aprobada
- **Decisión:** formulario de solicitud de bolo; el envío llega al correo de la banda. Sin panel, sin cuentas, sin base de datos propia.
- **Motivo:** volumen esperado bajo; un backoffice añadiría autenticación, mantenimiento y superficie de ataque sin valor.
- **Alternativas descartadas:** `mailto:` visible (fricción y spam); panel con base de datos; WhatsApp como canal único.
- **Consecuencias:** depende de un tercero para entregar el correo (D-006); exige información de tratamiento y retención; sin histórico propio.
- **Secciones afectadas:** plan §4, §7, §16.
- **Reemplaza / reemplazada por:** —

---

## D-002 — Imágenes autohospedadas + vídeo de YouTube embebido con fachada
- **Fecha:** 2026-11-11 (v3: **redefine la v1**, que descartaba los embeds)
- **Estado:** aprobada
- **Decisión:**
  - **Imágenes:** se guardan en el repositorio y las sirve el propio host, optimizadas en build con `astro:assets` (`<Image>`), en AVIF/WebP con `srcset`. Sin CDN ni bucket externo.
  - **Vídeo:** **YouTube incrustado**, no autohospedado. En la content collection se guarda el **ID de YouTube**, no un MP4. Se muestra una **fachada clic-para-reproducir** (miniatura local + botón) y el iframe real se carga **solo al hacer clic**, desde `youtube-nocookie.com`, sin autoplay.
- **Contexto y motivo:** es la única opción con coste cero real (D-015). Autohospedar obligaba a un bucket con egreso gratuito, cabeceras `Range`, compresión manual y vigilancia de ancho de banda; YouTube ya está pagado, aloja, transcodifica y genera subtítulos.
- **Coste comparado (hechos):** YouTube, 0 €; Cloudflare Stream, 5 $/1.000 min almacenados y 1 $/1.000 min servidos, sin plan gratuito (docs 2026-10-27); alojar MP4 en el deploy de Pages choca con el límite de **25 MiB por archivo** (docs 2026-09-05).
- **Mitigación de privacidad (parte de la decisión):**
  - Antes del clic: **solo una imagen local** y un botón; ninguna petición a dominios de Google/YouTube y ninguna cookie de terceros. Descarta usar la miniatura de `i.ytimg.com` como fachada, porque rompería el criterio.
  - Al hacer clic: iframe con `youtube-nocookie.com`, sin autoplay, con `title` descriptivo, `loading="lazy"` y `allowfullscreen`.
  - Aviso junto al botón: "Al reproducir se carga el reproductor de YouTube y se aplican sus políticas".
  - CSP con `frame-src https://www.youtube-nocookie.com` y sin `img-src` de YouTube.
- **Alternativas descartadas:** MP4 autohospedado con R2 (D-007, descartada por coste y mantenimiento); Stream (de pago); GIF animado (peso).
- **Consecuencias y riesgos:** dependemos de la disponibilidad de YouTube y de su reproductor; la retención de vídeos no la controlamos; `youtube-nocookie` reduce cookies pero **no elimina** la transferencia de IP a Google al reproducir, que debe figurar en la política (D-013). Si el canal se cae o el vídeo se hace privado, hay que sustituir el ID.
- **Secciones afectadas:** plan §2, §4 (F2), §7, §8, §10, §16, §17.
- **Reemplaza / reemplazada por:** reemplaza la versión v1 de D-002 ("vídeo autohospedado, sin embeds").

---

## D-003 — Cifras de alcance: dato en vivo si es gratuito; si no, editable a mano
- **Fecha:** 2026-11-11
- **Estado:** aprobada, **superada por D-012** (la sección de cifras se elimina)
- **Hallazgo (2026-11-11):** no hay fuente gratuita que un navegador consulte sin backend: Instagram Basic Display dejó de estar disponible el **2024-12-04** (Meta, 2024-09-04); YouTube Data API exige clave y exponerla la publica (Google, *Quota costs*).
- **Secciones afectadas:** plan §4, §9, §17.
- **Reemplaza / reemplazada por:** reemplazada por **D-012**.

---

## D-004 — Solo español, sitio estático
- **Fecha:** 2026-11-11
- **Estado:** aprobada
- **Decisión:** solo español (sin `/en/`), salida 100 % estática. El formulario usa una función del host (Pages Functions), no un servidor propio.
- **Consecuencias:** contenido y envío deben funcionar sin JavaScript; el vídeo requiere JavaScript o al menos un enlace alternativo, y se acepta como excepción declarada.
- **Secciones afectadas:** plan §2, §4, §8.
- **Reemplaza / reemplazada por:** —

---

## D-005 — Alojamiento en Cloudflare Pages
- **Fecha:** 2026-11-11 (v3: se retira la mención al subdominio de medios)
- **Estado:** **aprobada**
- **Decisión:** desplegar el sitio estático en **Cloudflare Pages** (plan Free). Todo el contenido, incluidas las imágenes, dentro del despliegue.
- **Motivo:** assets estáticos gratuitos e ilimitados, sin límite de visitas y sin factura de ancho de banda (docs 2026-09-08).
- **Límites que condicionan el diseño (hechos, docs 2026-09-05):** **25 MiB por archivo**, **500 builds/mes**, 20.000 archivos, 100 dominios por proyecto. Las imágenes deben quedar muy por debajo del límite de tamaño (ver D-002 y plan §4).
- **Alternativas descartadas:** Netlify (300 créditos/mes ≈ 15 GB de banda); GitHub Pages (menos control de cabeceras).
- **Consecuencias:** el dominio debe ser una zona en Cloudflare (D-014). Las previews deben ir con `noindex`.
- **Secciones afectadas:** plan §8, §10, §14.
- **Reemplaza / reemplazada por:** —

---

## D-006 — Formulario: Cloudflare Worker propio + Resend
- **Fecha:** 2026-11-11 (v2; sin cambios en v3)
- **Estado:** **aprobada**
- **Decisión:** el navegador hace `POST` a un Worker propio (Pages Functions) en el mismo dominio. El Worker valida, comprueba origen y límite de envíos y llama a la API de **Resend** con la clave en un secreto del entorno. **La clave nunca llega al navegador.**
- **Motivo:** 3.000 emails/mes y 100/día gratis, sin exponer credenciales y con el antispam en casa.
- **Alternativas descartadas:** Web3Forms (clave pública, envíos en un tercero); Formspree (50/mes); Netlify Forms (ataría el hosting).
- **Antispam:** honeypot; verificación de `Origin`/`Referer`; **rate limit en el Worker** por IP (5 envíos/hora, valor inicial ajustable); rechazo si la marca de tiempo indica menos de 3 s (solo con JS).
- **Consecuencias:** requiere dominio verificado en Resend (SPF/DKIM) → depende de D-014; hay que mantener un Worker y un secreto; la cuota puede agotarse por spam.
- **Secciones afectadas:** plan §4 (F6), §8, §10, §16.
- **Reemplaza / reemplazada por:** reemplaza la propuesta v1 de Web3Forms (mismo ID, variante aprobada).

---

## D-007 — Vídeo servido desde R2 con dominio propio
- **Fecha:** 2026-11-11 (descartada en v3)
- **Estado:** **descartada**
- **Decisión anterior:** MP4 en bucket R2 con subdominio de medios, caché y cabeceras `Range`.
- **Motivo del descarte:** contradice el principio de coste cero y el vídeo pasa a YouTube embebido (D-002). Sin bucket no hay subdominio de medios, ni caché de vídeo, ni `Range`, ni cuota de 10 GB que vigilar.
- **Alternativas vivas:** YouTube embebido (elegida).
- **Secciones afectadas:** plan §8, §10, §11, §16.
- **Reemplaza / reemplazada por:** reemplazada por **D-002 v3**.

---

## D-008 — Cifras manuales en un fichero de configuración
- **Fecha:** 2026-11-11
- **Estado:** **descartada**
- **Motivo:** la sección de cifras se elimina (D-012).
- **Reemplaza / reemplazada por:** reemplazada por **D-012**.

---

## D-009 — Contenido editable como content collections de Astro
- **Fecha:** 2026-11-11
- **Estado:** aprobado
- **Decisión:** fotos, **IDs de YouTube**, fechas de bolo, hitos de trayectoria y textos viven en `src/content/` con esquemas validados; los componentes no llevan datos incrustados.
- **Motivo:** hoy el contenido está a fuego en `index.astro` e `ImageSlider.astro`; cambiar una foto no debería tocar maquetación. El esquema debe exigir `alt` en fotos, poster local en vídeos y fecha y lugar en bolos.
- **Alternativas descartadas:** datos en componentes; CMS headless (coste).
- **Consecuencias:** obliga a migrar los componentes y a crear el `Layout` común (F11 del plan).
- **Secciones afectadas:** plan §8, §9.
- **Reemplaza / reemplazada por:** —

---

## D-010 — Pruebas y puertas de calidad desde el primer despliegue
- **Fecha:** 2026-11-11 (v2: npm)
- **Estado:** propuesta
- **Decisión propuesta:** **npm**; Vitest para unitarias; comprobaciones de integración sobre el HTML de `astro build`; Playwright para E2E; Stryker para mutación de `src/scripts/`; GitHub Actions que rompe el pipeline por debajo de umbrales.
- **Umbrales:** 100 % objetivo y 90 % mínimo de líneas y ramas (unitarias e integración, por separado y combinadas); 90 % mínimo de mutación en módulos tocados; 100 % de E2E críticos; presupuesto de rendimiento y axe sin violaciones críticas.
- **Consecuencias:** ~1 día de configuración inicial; mutación acotada a scripts.
- **Secciones afectadas:** plan §4, §14.
- **Reemplaza / reemplazada por:** —

---

## D-011 — Analítica sin cookies con Cloudflare Web Analytics
- **Fecha:** 2026-11-11
- **Estado:** propuesta (gratuita y coherente con D-015)
- **Decisión propuesta:** medir visitas con Cloudflare Web Analytics (sin cookies, sin fingerprinting, sin UTM), sin banner. Si la revisión legal no confirma la exención, se retira en v1.
- **Límite:** no hay eventos personalizados → no se mide conversión de formulario ni reproducciones.
- **Alternativas descartadas:** GA4 (cookies y peso); Plausible autoalojado (mantenimiento); ninguna analítica (plan B).
- **Secciones afectadas:** plan §10, §15, §16.
- **Reemplaza / reemplazada por:** —

---

## D-012 — Se elimina la sección de cifras: prensa, trayectoria y próximos bolos
- **Fecha:** 2026-11-11
- **Estado:** **aprobada**
- **Decisión:** sin sección de alcance ni cifras. En su lugar: **prensa** (logos y menciones con permiso), **trayectoria** (hitos con fecha y lugar) y **próximos bolos** (fechas editadas a mano).
- **Motivo:** las cifras o eran falsas, o envejecían, o exigían backend (D-003). Prensa y trayectoria son verificables y no requieren mantenimiento.
- **Consecuencias:** si no hay menciones, la sección se oculta; las fechas pasadas se ocultan en build.
- **Secciones afectadas:** plan §2, §4 (F4, F10), §7, §9, §13, §17.
- **Reemplaza / reemplazada por:** reemplaza **D-003** y **D-008**.

---

## D-013 — Base jurídica única: consentimiento; privacidad y aviso legal
- **Fecha:** 2026-11-11
- **Estado:** **aprobada**, con revisión legal humana pendiente antes de publicar
- **Decisión:**
  - **Base jurídica única:** consentimiento (**art. 6.1.a RGPD**).
  - **Consentimiento retirable:** checkbox vacío por defecto; el texto enlaza la política y explica cómo retirarlo (correo `[PENDIENTE: correo]`). La retirada no afecta a la licitud previa.
  - **Texto:** "He leído la política de privacidad y **consiento** el tratamiento de mis datos para que la banda responda a mi solicitud. Puedo retirar este consentimiento en cualquier momento escribiendo a `[correo]`."
  - **Retención:** **12 meses** desde la última comunicación en el buzón de la banda; en Resend, **la mínima disponible** (30 días en Free, verificado 2026-11-11). Plazo, base y destinatarios redactados igual en plan, repositorio y proveedor.
  - **Páginas legales:** privacidad (art. 13 RGPD) **y aviso legal** (art. 10 LSSI).
  - **Terceros:** Cloudflare (hosting y función) y Resend (correo) como encargados. **YouTube/Google** solo recibe datos cuando el visitante pulsa reproducir (D-002) y así se explica.
- **Alternativas descartadas:** art. 6.1.b como base principal (dos bases conviviendo).
- **Consecuencias y riesgos:** demostrar el consentimiento exige conservar fecha y versión de la política; retirarlo debe ser tan fácil como darlo. **Requiere revisión legal humana** de textos y DPA; transferencia internacional documentada.
- **Secciones afectadas:** plan §4 (F6, F7), §7, §16.
- **Reemplaza / reemplazada por:** —

---

## D-014 — Dominio propio como decisión bloqueante
- **Fecha:** 2026-11-11 (v3: sin subdominio de medios)
- **Estado:** propuesta (el dueño no ha indicado dominio ni registrador)
- **Decisión propuesta:** dominio propio (no `*.pages.dev`) como canónico, con una sola dirección (`www` → apex o al revés).
- **Motivo:** sin dominio no se puede verificar el remitente en Resend, ni fijar `site` en `astro.config`, ni generar absolute en sitemap/canonical/OG.
- **Consecuencias:** si el dominio está fuera de Cloudflare, hay que mover nameservers o montar un *partial (CNAME) setup*. Bloquea F6 y F8. Es el **único coste del proyecto** (D-015).
- **Secciones afectadas:** plan §4 (F8), §8, §10, §14, §19.
- **Reemplaza / reemplazada por:** —

---

## D-015 — Principio de coste: todo gratuito salvo el dominio
- **Fecha:** 2026-11-11 (decisión del dueño)
- **Estado:** **aprobada**
- **Decisión:** el proyecto no asume ningún coste recurrente. Único gasto aceptado: **dominio propio, ~10–15 €/año** (**estimación propia**). Host Cloudflare Pages Free; analítica Cloudflare Web Analytics; formulario Worker + Resend en plan gratuito; vídeo en YouTube; imágenes en el propio despliegue.
- **Motivo:** la web no genera ingresos directos y debe sostenerse con coste ≈ 0.
- **Consecuencias:** cualquier propuesta futura que implique pago (Stream, R2 fuera de cuota, plan de pago de Resend, CMS) queda fuera salvo decisión expresa que reemplace esta. La dependencia de planes gratuitos es un riesgo asumido: si cambian las condiciones, hay que reevaluar.
- **Secciones afectadas:** plan §2, §10, §11, §12.
- **Reemplaza / reemplazada por:** —

---

## Supuestos abiertos (no son decisiones)
- **S-01:** tráfico de cientos o pocos miles de visitas al mes, con picos tras conciertos.
- **S-02:** la banda tiene o comprará un dominio (10–15 €/año, **estimación propia**).
- **S-03:** existe material propio con derechos: fotos, vídeos ya subidos a YouTube y permiso del fotógrafo. `[PENDIENTE: canal de YouTube y autoría]`
- **S-04:** el correo de recepción se revisa a diario.
- **S-05:** no hay venta de entradas ni cobros en el primer año.
- **S-06:** el correo de la banda se puede verificar en Resend (acceso a DNS).

## Riesgos registrados
- **R-01:** dependencia de YouTube: vídeo retirado, canal cerrado o cambio de condiciones → guardar ID y poster local, y poder sustituir en minutos.
- **R-02:** cookies/transferencia a Google al reproducir → fachada, `youtube-nocookie`, sin autoplay y aviso explícito (D-002/D-013).
- **R-03:** el Worker o Resend fallan y se pierde una solicitud → estados de error y alternativa por Instagram; prueba mensual.
- **R-04:** spam agota la cuota de Resend → honeypot, origen, rate limit; vigilancia.
- **R-05:** legales publicados con marcadores o bases mezcladas → bloqueo de lanzamiento y revisión humana.
- **R-06:** fechas de bolos desactualizadas → ocultar pasadas en build; revisión mensual.
- **R-07:** límites sin fuente (rate limit 5/h, 3 s, 12 meses, 10–15 €/año) son **estimaciones propias**.
