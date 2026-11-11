# 🎸 Tejones Banda — Premium Cover Band

> Web oficial y plataforma de contratación de **Tejones Banda**. Rock español e internacional de los años 80, 90 y 2000 para eventos, ayuntamientos y celebraciones privadas.

---

## ⚡ Características Principales

- **Diseño Inmersivo y Oscuro:** Estética de directo, rock, sin filtros y totalmente optimizada para dispositivos móviles y de escritorio.
- **Privacidad Absoluta (Aislamiento de Terceros):** Integración de vídeos de YouTube mediante una fachada local con `youtube-nocookie`. **0 peticiones de red y 0 cookies de Google/YouTube** en la carga inicial hasta que el usuario hace clic expresamente.
- **Formulario de Contacto Anti-Spam (Serverless):** Endpoint seguro en Cloudflare Pages Functions (`/api/contacto`) con validación Zod, honeypot antispam, control de velocidad temporal anti-bots y pasarela de correo con **Resend**.
- **Galería Interactiva de Previsualización:** Carrusel fluido y accesible con 8 posiciones dinámicas y navegación táctil o por teclado.
- **Cumplimiento Legal RGPD / LSSI:** Páginas de Política de Privacidad y Aviso Legal integradas, con consentimiento explícito en formulario.
- **Arquitectura de Coste Cero (D-015):** Diseñada para ejecutarse de forma totalmente gratuita sobre Cloudflare Pages y Resend (Plan Free), con un coste operativo recurrente de **0 €/mes**.

---

## 🛠️ Stack Tecnológico

- **Framework:** [Astro](https://astro.build/) (Arquitectura de islas estáticas y alto rendimiento).
- **Estilos:** CSS Scoped nativo con diseño responsivo adaptativo.
- **Backend / Serverless:** Cloudflare Pages Functions (`/functions/api/contacto.ts`).
- **Validación:** Zod.
- **Pruebas y Calidad:** Vitest (Pruebas unitarias e integración con cobertura > 93%) y Playwright.

---

## 🚀 Guía de Desarrollo Local

### Prerrequisitos
- Node.js (versión 18 o superior recomendada).
- Gestor de paquetes `npm`.

### Instalación

1. Clona el repositorio e instala las dependencias:
   ```bash
   npm install
   ```

2. Arranca el servidor de desarrollo local en segundo plano:
   ```bash
   astro dev --background
   ```
   *(O en primer plano con `npx astro dev`)*.

3. Abre en tu navegador:
   `http://localhost:4321`

---

## 🧪 Pruebas y Puertas de Calidad (G0)

Para ejecutar la suite completa de pruebas unitarias con informe de cobertura:
```bash
npm run test:coverage
```

Para verificar la compilación de producción y la generación de cabeceras de seguridad:
```bash
npm run build
```

---

## 📄 Licencia y Créditos

Desarrollado con arquitectura modular y agentes de IA bajo **Forge / OpenCode**.

- **Autor / Arquitecto:** Borja García Gómez de Segura ([PandaCode](https://www.linkedin.com/in/borja-garc%C3%ADa-g%C3%ـrez-de-segura-287441328/)) 🐼
- **Estado del Proyecto:** Producción / MVP completado al 100%.
