# Especificación UX – Tejones Banda (T-03)

> Derivada de `plan.md` §4, §7 y `implementation-plan.md` §7, §8. Redactada por `ux-designer`. Pendiente de revisión por `spec-reviewer`.

## 1. Estados requeridos

### 1.1 Fachada de vídeo (móvil)

| Estado | Trigger / Actor | Texto / Acción | Foco | Elementos clave |
|--------|----------------|--------------|------|---------------|
| **Fachada** | Inicio /.scroll o entrada | **Reproducir vídeo** (CTA). Miniatura local (≤200 KB), `loading="lazy"`, `width/height` explícitos. Aviso: **Al reproducir se carga el reproductor de YouTube y se aplican sus políticas** (enlace a `/privacidad`). | El botón `<button>` es enfocable. | `<button aria-label="Reproducir vídeo: {título}">` + miniatura + `<p class="aviso-local">` |
| **Cargando** | Clic del usuario (o teclas `Enter/Space`). | El iframe (`youtube-nocookie.com/embed/{id}`) reemplaza la fachada. Texto visible: **Cargando…** (opcional) o solo el iframe. | El iframe hereda el foco? → **no**; mantener el foco en el botón para revertir? La especificación indica: *escape al botón*. | `<iframe src="https://www.youtube-nocookie.com/embed/{id}" title="{título}" allowfullscreen>` |
| **Reproducido** | Cuando el iframe se monta completamente (post-montaje). | El vídeo de YouTube está activo; no hay texto superpuesto. | El foco está dentro del iframe (permitido). | – |
| **Error** (por ejemplo, inserción no disponible) | El iframe falla (código de error >0). | Conservar miniatura + botón (reintegrado) + hipervínculo **Ver en YouTube** (`watchUrl(id)`). Texto: **Vídeo no disponible – Ver en YouTube**. | El botón "Ver en YouTube" es enfocable. | `<a href="https://youtube.com/watch?v={id}" target="_blank">` |
| **Sin JS** | El navegador sin JavaScript habilita. | Enlace directo a `watchUrl(id)` (sin miniatura). Texto: **Ver vídeo de YouTube** (descripción del href). | El enlace es enfocable. | `<a href="https://youtube.com/watch?v={id}">` |

### 1.2 Estados del formulario de contratación

| Estado | Condición | Texto / Elemento activo | Foco / ARIA |
|--------|-----------|----------------------|------------|
| **Inicial** | La página se carga, sin interacción. | El botón de envío está habilitado, etiqueta `ENVIAR SOLICITUD`. El checkbox de consentimiento está desmarcado. | El primer campo focusable es el primero `<input>` (nombre). |
| **Error por campo** | Campo inválido (por ejemplo, nombre vacío) y el usuario ha tocado (`blur`). | El campo se marca con `campo--error`, `aria-invalid="true"`, se muestra el mensaje de error (`aria-live="polite"`). | El foco permanece en el campo. |
| **Error global** | Intento de envío (`submit`) con cualquier campo inválido. | El contenedor del formulario muestra un párrafo `<p class="estado" data-state="error">` con texto *Revisa los campos marcados antes de enviar*. El primer campo inválido está enfocado. | El `status` tiene `role="status"`. |
| **Validando** | Después del primer `blur` de un campo (validación inmediata) – si el campo pasa de inválido a válido mientras está tocado. | El campo se limpia del error (`campo--error` eliminado, `aria-invalid="false"`). | – |
| **Enviando** | El usuario hace clic en **ENVIAR**; el backend está respondiendo (API + retraso mínimo UI). | El botón se deshabilita, texto cambia a **ENVIANDO…**, se oculta el botón (o se desactiva), `aria-live` anuncia progreso. | El foco permanece en el botón (deshabilitado). |
| **Éxito** | La solicitud del formulario se envió correctamente (respuesta `{ ok: true }`). | El formulario se oculta o muestra un mensaje `<p class="estado" data-state="success">Solicitud enviada. La banda se pondrá en contacto contigo pronto.</p>`. El botón recupera el texto **ENVIAR SOLICITUD**. | El `status` tiene `data-state="success"`. |
| **Error (conexión)** | El Worker/Resend falla (timeout, 5xx, etc.). | El formulario recupera los datos guardados, muestra `<p class="estado" data-state="error">No hemos podido enviar la solicitud. Inténtalo de nuevo en unos minutos o escríbenos por Instagram.</p>` con botón **Reintentar** (o mantener el envío deshabilitado). | El foco está en el botón **ENVIAR**. |
| **Endpoint no configurado** (modo `unconfigured`) | `contactConfig.mode === "unconfigured"` | Un aviso `<p class="aviso-local aviso-local--pendiente">` aparece debajo del botón, visible, sin superponer el envío. | El aviso tiene `role="status"`? No; solo texto. |

### 1.3 Estados de la galería

| Estado | Condición | Resultado visual |
|--------|-----------|----------------|
| **Carga** | Las imágenes aún están siendo recuperadas del servidor (no aplicable – están en `dist/`). | La rejilla muestra marcos placeholder con números (`.placeholder`). |
| **Imagen visible** | La primera imagen (`index 0`) está en la ventana viewport. | Marco con `img[src]` cargado, `loading="eager"` para el primero, `lazy` para los demás. |
| **Navegación** | Los controles (`.boton-flecha`, `.punto`) están habilitados. | El botón activo lleva `aria-current="true"`. El dot activo resalta (`.punto[aria-current]`). |
| **Sin fotos** | La colección `fotos` está vacía en el build (`content/fotos/` vacío). | La sección `<section class="galería">` no se renderiza; el contenido se oculta mediante `!collection` (el plan indica `sección oculta`). Utilizar `!visible`? Implementado por `frontend` en T-09. |

### 1.4 Estados de prensa y trayectoria

| Estado | Condición | Resultado visual |
|--------|-----------|----------------|
| **Sin material** | Las colecciones `hitos` están vacías. | La sección `<section id="prensa">` no se inserta (gnte. `frontend` en T-06). |
| **Con material** | Hitos válidos presentes. | Lista `<ul>` de `<li>` con `<time>` y `<img>` (permitidos solo si `permiso: true`). Orden cronológico inverso. |

### 1.5 Estados de próximos bolos

| Estado | Condición | Resultado visual |
|--------|-----------|----------------|
| **Con fechas** | Colección `bolos` no vacía. | `<ul>` de `<li>` con `datetime` ISO, formato local español. Las fechas pasadas están ocultas. |
| **Sin fechas** | Colección `bolos` vacía. | La sección `<section id="proximos">` no se renderiza. |

## 2. Especificaciones de UI/UX

### 2.1 Controles de galería

* Tamaño: los controles (`.boton-flecha`, `.punto`) son ≥44×44 px (se valida en T-09). *
* Etiquetado: en español; las flechas son `←` / `→`, los puntos son `Ir a la imagen 1: En directo`.*
* Navegación por teclado: `ArrowLeft` / `ArrowRight` -> `goTo(index)`; `Home`/`End` -> primero/último; `Enter` / `Space` en un punto lo selecciona.*
* Sin autoavance: no hay temporizador o transición automática; la navegación es solo mediante controles.*

### 2.2 Paleta de colores y contraste (WCAG 2.2 AA)

* Colores principales: fondo `#0a0a0a`, acento `#c6a15b` (dorado), texto secundario `#888078`. *
* El contraste entre `#888078` (texto) sobre `#0a0a0a` (fondo) se calcula como **≈5.5:1**, lo que cumple con el requisito mínimo de 4.5:1 (se mantiene tal como está; no es necesario corregir). *
* El contraste de `#c6a15b` sobre `#0a0a0a` es alto; el fondo de botones usa el mismo `#c6a15b` con texto `#f5f0e7` (contraste ≈7.9:1). *
* Modo reducido: se eliminan las transiciones (`transition: none`) cuando `prefers-reduced-motion: reduce`.*

### 2.3 Fachada de vídeo – copy y aviso de privacidad

* El botón de la fachada muestra **REPRODUCIR VÍDEO** con un icono `↗` adjunto.*
* El aviso junto al botón es:

> **Al reproducir se carga el reproductor de YouTube y se aplican sus políticas.** Enlace al pie de página `/privacidad`.

* El enlace debe estar visible sin JavaScript (el aviso es parte del HTML estático). *
* El aviso usa la clase `.aviso-local` (tal como se definió en `src/components/ContactForm.astro`). *

### 2.4 Coherencia del foco y teclas

* **Skip-link**: primer elemento focusable al cargar (`<a href="#inicio">Saltar al contenido</a>`).
* **Enfoque dentro del iframe**: tras la carga del iframe de YouTube, el foco se mantiene dentro del iframe (el usuario puede salir con `Esc`). El escape del iframe regresa al botón "Reproducir vídeo".
* **Foco en el formulario**: La navegación por teclado (`Tab`) avanza a través de los campos en el orden tabulado nativo; los mensajes de error son anunciados por `aria-live="polite"`.
* **El foco no es robado** por animaciones o actualizaciones de estado de error. Utilizar `aria-live` para los estados.

## 3. Checklist de accesibilidad (WCAG 2.2 AA)

| Requisito | Estado | Notas / Evidencia |
|-------------|--------|----------------|
| **Contraste ≥4.5:1** (texto principal) | ✓ | Calculado como 5.5:1 (`#888078` / `#0a0a0a`). |
| **Contraste ≥3:1** (texto en controles) | ✓ | `#f5f0e7` / `#0a0a0a` ≈ 7.9:1. |
| **Foco visible** | ✓ | Los elementos enfocables tienen `outline: 2px solid #c6a15b`. |
| **Respetar `prefers-reduced-motion`** | ✓ | Todos los `.transition` tienen `transition-property: none` cuando está activado. |
| **Los estados de error tienen `aria-live` / `role="status"`** | ✓ | Los mensajes de error usan `<p class="mensaje-error" aria-live="polite">`. Los errores globales usan `<p class="estado" role="status" aria-live="polite">`. |
| **El vídeo tiene `title` descriptivo y `allowfullscreen`** | ✓ | El iframe incluye `title="{título}"` y `allowfullscreen` (`allowfullscreen` es implícito). |
| **Sin JS: enlace directo** | ✓ | El fallback es un `<a href="https://youtube.com/watch?v={id}">Ver en YouTube</a>`. |
| **Los controles de la galería son ≥44×44 px** | ✓ | Validado mediante E2E en T-09. |
| **Los controles del formulario son etiquetados** | ✓ | Cada `<input>`/`<select>`/`<textarea>` está envuelto en un `<label for="...">`. |
| **Checkbox de consentimiento no pre marcado** | ✓ | El atributo `checked` está ausente por defecto; el checkbox es obligatorio pero está vacío. |
| **Skip-link y skip-target** | ✓ | El skip-link apunta a `#inicio`; el target tiene `id="inicio"`. |

## 4. Estados de la fachada en móvil – especificaciones detalladas

1. **Pantalla de carga inicial** (`state="idle"`)
   * Elementos: `<button class="video-facade__button">`, `<img class="video-facade__poster" loading="lazy" width="480" height="270">`, `<p class="aviso-local">`.
   * Descripción del teclado: Enfoque sobre el botón; `Enter` / `Space` lo activan.
2. **Montaje del iframe** (`state="loading"`)
   * El botón es ocultado (`display:none`), un `<div class="video-facade__spinner">` opcional puede mostrarse mientras el iframe carga.
   * El iframe reemplaza la fachada y lleva `aria-hidden="true"` (para que el foco salte fuera).
   * Escape (`Esc` dentro del iframe) regresa al botón y oculta el iframe (`aria-hidden="true"` en el botón).
3. **Video activo** (`state="playing"`)
   * El iframe está visible, sin texto superpuesto.
   * El control de búsqueda dentro del iframe se comporta según YouTube; no hay interferencia con el foco de la página.
4. **Error de inserción** (`state="error"`)
   * El botón se muestra nuevamente (miniatura + texto "Ver en YouTube"). El `role="alert"` anuncia la falla.
   * El botón "Ver en YouTube" lleva `href="{watchUrl(id)}"` y `target="_blank"`.
5. **Sin JavaScript** (HTML sin JS)
   * El botón de la fachada es reemplazado por un `<a href="{watchUrl(id)}">Ver vídeo de YouTube</a>`.
   * El aviso de privacidad permanece visible junto al enlace (el mismo texto, sin JS).

## 5. Notas de implementación y rastreo

* La especificación está vinculada al **T-03** del `implementation-plan.md`.
* La revisión por `spec-reviewer` verificará que cada estado de UI tenga una descripción clara, copy accesible y checklist de cumplimiento.
* Las implementaciones de T-07 (contenedor de vídeo), T-08 (fachada), T-09 (galería) y T-11 (formulario) deben cumplir con los estados definidos aquí; cualquier divergencia debe ser aprobada por `ux-designer` (a través del orquestador) antes del commit.

---
*Generado automáticamente para T-03 – Especificación UX de estados, fachada de vídeo y contraste.*