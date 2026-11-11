import { validateContactInput } from './_lib/validate';
import { validateOrigin } from './_lib/origin';
import { checkRateLimit } from './_lib/ratelimit';
import { sendEmailWithResend } from './_lib/resend';

export async function onRequestPost(context: { request: Request; env: { RESEND_API_KEY?: string; CONTACT_TO?: string } }) {
  const { request, env } = context;

  if (!validateOrigin(request)) {
    return new Response(JSON.stringify({ ok: false, error: 'Acceso no autorizado (Origen inválido).' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const clientIp = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
  if (!checkRateLimit(clientIp)) {
    return new Response(JSON.stringify({ ok: false, error: 'Demasiadas solicitudes. Por favor, inténtalo más tarde o usa Instagram.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    let formData: FormData;

    if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      formData = await request.formData();
    } else {
      const body = await request.json();
      formData = new FormData();
      for (const [key, val] of Object.entries(body as any)) {
        formData.append(key, String(val));
      }
    }

    const validation = validateContactInput(formData);
    if (!validation.success) {
      return new Response(JSON.stringify({ ok: false, error: validation.error || 'Datos de formulario inválidos.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiKey = env.RESEND_API_KEY;
    const contactTo = env.CONTACT_TO;

    if (!apiKey || !contactTo) {
      return new Response(JSON.stringify({ ok: false, error: 'El servicio de contacto no está configurado en este entorno.' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { nombre, email, telefono, mensaje } = validation.data!;
    const emailResult = await sendEmailWithResend(apiKey, {
      to: contactTo,
      subject: `Nueva solicitud de contratación de ${nombre}`,
      text: `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono || 'No proporcionado'}\n\nMensaje:\n${mensaje}`,
      replyTo: email,
    });

    if (!emailResult.success) {
      return new Response(JSON.stringify({ ok: false, error: 'No se pudo enviar el mensaje. Usa Instagram como alternativa.' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ ok: false, error: 'Error interno del servidor.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
