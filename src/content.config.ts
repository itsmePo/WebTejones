import { defineCollection, z } from "astro:content";

const fotosCollection = defineCollection({
  loader: () => [],
  schema: z.object({
    alt: z.string().min(1, "La foto requiere un texto alternativo (alt)."),
    src: z.string().min(1, "La foto requiere una ruta de origen."),
  }),
});

const videosCollection = defineCollection({
  loader: () => [],
  schema: z.object({
    youtubeId: z.string().regex(/^[a-zA-Z0-9_-]{11}$/, "El ID de YouTube debe tener exactamente 11 caracteres válidos."),
    titulo: z.string().min(1, "El vídeo requiere un título."),
    poster: z.string().min(1, "El vídeo requiere una miniatura (poster)."),
  }),
});

const hitosCollection = defineCollection({
  loader: () => [],
  schema: z.object({
    fecha: z.string().min(1, "El hito requiere una fecha."),
    lugar: z.string().min(1, "El hito requiere un lugar."),
    titulo: z.string().min(1, "El hito requiere un título."),
    permiso: z.boolean().default(false),
  }),
});

const bolosCollection = defineCollection({
  loader: () => [],
  schema: z.object({
    fechaIso: z.string().regex(/^\d{4}-\-?\d{2}-\d{2}$/, "El bolo requiere una fecha ISO válida (YYYY-MM-DD).").or(z.string().min(1)),
    hora: z.string().min(1, "El bolo requiere hora."),
    lugar: z.string().min(1, "El bolo requiere lugar."),
    enlace: z.string().url().optional(),
  }),
});

const textosCollection = defineCollection({
  loader: () => [],
  schema: z.object({
    clave: z.string().min(1),
    contenido: z.string().min(1, "El texto no puede estar vacío."),
  }),
});

export const collections = {
  fotos: fotosCollection,
  videos: videosCollection,
  hitos: hitosCollection,
  bolos: bolosCollection,
  textos: textosCollection,
};
