import { z } from 'zod';

export const contactSchema = z.object({
  nombre: z.string().min(2, "El nombre es obligatorio."),
  email: z.string().email("Correo electrónico inválido."),
  telefono: z.string().optional(),
  mensaje: z.string().min(10, "El mensaje debe tener al menos 10 caracteres."),
  honeypot: z.string().max(0, "Spam detectado."),
  timestamp: z.string().transform((val) => Number(val)),
});

export function validateContactInput(formData: FormData) {
  const raw = {
    nombre: formData.get('nombre')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    telefono: formData.get('telefono')?.toString() || '',
    mensaje: formData.get('mensaje')?.toString() || '',
    honeypot: formData.get('honeypot')?.toString() || '',
    timestamp: formData.get('timestamp')?.toString() || '0',
  };

  const result = contactSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, errors: result.error.format() };
  }

  // Comprobación de tiempo mínimo de envío (3 segundos contra bots)
  const now = Date.now();
  const submissionTime = result.data.timestamp;
  if (now - submissionTime < 3000) {
    return { success: false, error: 'Envío demasiado rápido. Por favor, inténtalo de nuevo.' };
  }

  return { success: true, data: result.data };
}
