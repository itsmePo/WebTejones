import { describe, it, expect } from 'vitest';
import { validateContactInput } from '../../functions/_lib/validate';

describe('validate.ts', () => {
  it('validates correct input and sufficient timestamp', () => {
    const fd = new FormData();
    fd.append('nombre', 'Juan Pérez');
    fd.append('email', 'juan@example.com');
    fd.append('telefono', '600123456');
    fd.append('mensaje', 'Hola, queremos contrataros para una fiesta.');
    fd.append('honeypot', '');
    fd.append('timestamp', String(Date.now() - 5000)); // 5s ago (> 3s)

    const res = validateContactInput(fd);
    expect(res.success).toBe(true);
  });

  it('rejects submission if timestamp is too fast (< 3s)', () => {
    const fd = new FormData();
    fd.append('nombre', 'Bot Rápido');
    fd.append('email', 'bot@example.com');
    fd.append('mensaje', 'Mensaje de spam automático muy rápido.');
    fd.append('honeypot', '');
    fd.append('timestamp', String(Date.now() - 500)); // 0.5s ago

    const res = validateContactInput(fd);
    expect(res.success).toBe(false);
    expect(res.error).toContain('Envío demasiado rápido');
  });

  it('rejects submission if honeypot is filled', () => {
    const fd = new FormData();
    fd.append('nombre', 'Bot Tonto');
    fd.append('email', 'spammer@example.com');
    fd.append('mensaje', 'Spam spam spam spam spam spam.');
    fd.append('honeypot', 'relleno');
    fd.append('timestamp', String(Date.now() - 10000));

    const res = validateContactInput(fd);
    expect(res.success).toBe(false);
  });
});
