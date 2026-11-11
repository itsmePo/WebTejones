export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
  replyTo: string;
}

export async function sendEmailWithResend(apiKey: string, payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Tejones Banda <onboarding@resend.dev>',
        to: [payload.to],
        subject: payload.subject,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });

    if (!response.ok) {
      const errData = await response.text();
      return { success: false, error: `Error del proveedor de correo: ${errData}` };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error de red al conectar con Resend.' };
  }
}
