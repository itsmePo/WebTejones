# Astro Starter Kit: Minimal

```sh
npm create astro@latest -- --template minimal
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 📬 Formulario de contacto

El formulario está en `src/components/ContactForm.astro` y valida los datos en
cliente desde `src/scripts/contact-form.ts`.

### Modo local

Sin endpoint configurado, el formulario valida los campos y **simula** el envío:
muestra una confirmación y escribe los datos en la consola del navegador. No se
envía ningún correo.

### Conectar el servicio del hosting

1. Copia `.env.example` a `.env`.
2. Asigna `PUBLIC_CONTACT_FORM_ENDPOINT` al endpoint del servicio de formularios.
3. Reinicia el servidor de desarrollo.

```sh
PUBLIC_CONTACT_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

El envío se hace por `POST` con codificación `application/x-www-form-urlencoded`
y cabecera `Accept: application/json`. Formspree funciona directamente; otros
servicios pueden necesitar campos adicionales (por ejemplo, la `access_key` de
Web3Forms). Netlify Forms requiere ajustar el adaptador de envío. Para Vercel u
otro hosting sin formularios nativos hará falta una API route o función
serverless y un proveedor de email.

Si se genera un build de producción sin endpoint, el formulario muestra un aviso
en lugar de fingir un envío correcto.

### Privacidad

La página `src/pages/privacidad.astro` es un borrador. Antes de publicar hay que
completar la identidad del responsable, el correo de contacto y el proveedor que
tratará los datos.

## 🖼️ Galería de directos

El slider de la sección **“Es una noche para recordar”** está en
`src/components/ImageSlider.astro` y su lógica en `src/scripts/image-slider.ts`.

Las diapositivas se definen en el array `slides` del componente. Cada una acepta:

- `title` y `caption`: textos visibles bajo la imagen.
- `src` y `alt`: ruta y texto alternativo de la imagen.
- `tone`: color de fondo del marco mientras no hay imagen.

Mientras una diapositiva no tenga `src`, se muestra un marco placeholder con su
número. Para añadir fotos reales, colócalas en `public/` o `src/assets/` y añade
la ruta y el `alt` correspondientes.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
