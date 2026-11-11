import { afterEach, describe, expect, it, vi } from 'vitest';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const FIELD_NAMES = [
  'nombre',
  'email',
  'telefono',
  'tipoEvento',
  'mensaje',
  'privacidad',
] as const;

interface FormOptions {
  status?: boolean;
  button?: boolean;
  submitLabel?: boolean;
  errorElements?: boolean;
  startedAt?: boolean;
  wrapper?: boolean;
}

interface FormFixture {
  form: HTMLFormElement;
  status: HTMLElement | null;
  button: HTMLButtonElement | null;
  submitLabel: HTMLElement | null;
}

function buildForm(options: FormOptions = {}): FormFixture {
  const {
    status = true,
    button = true,
    submitLabel = true,
    errorElements = true,
    startedAt = true,
    wrapper = true,
  } = options;
  const field = (name: string, control: string, error = '') => `
    <div class="campo"${wrapper ? ' data-field' : ''}>
      ${control}
      ${errorElements ? `<p data-error-for="${name}">${error}</p>` : ''}
    </div>`;

  document.body.innerHTML = `
    <form data-contact-form>
      ${field(
        'nombre',
        '<input id="nombre" name="nombre" type="text" required minlength="2" maxlength="80">',
      )}
      ${field('email', '<input id="email" name="email" type="email" required maxlength="120">')}
      ${field('telefono', '<input id="telefono" name="telefono" type="tel" maxlength="30">')}
      ${field(
        'tipoEvento',
        '<select id="tipoEvento" name="tipoEvento" required><option value="">Selecciona</option><option value="boda">Boda</option></select>',
      )}
      ${field(
        'mensaje',
        '<textarea id="mensaje" name="mensaje" required minlength="10" maxlength="2000"></textarea>',
      )}
      ${field(
        'privacidad',
        '<input id="privacidad" name="privacidad" type="checkbox" required value="si">',
      )}
      <input type="hidden" name="_subject" value="Solicitud">
      ${startedAt ? '<input type="hidden" name="_startedAt" value="" data-form-started>' : ''}
      <input id="_gotcha" name="_gotcha" type="text">
      ${
        button
          ? `<button type="submit" data-submit-button>${
              submitLabel ? '<span data-submit-label>ENVIAR SOLICITUD</span>' : ''
            }</button>`
          : ''
      }
      ${status ? '<p data-form-status role="status"></p>' : ''}
    </form>`;

  return {
    form: document.querySelector('form') as HTMLFormElement,
    status: document.querySelector('[data-form-status]'),
    button: document.querySelector('[data-submit-button]'),
    submitLabel: document.querySelector('[data-submit-label]'),
  };
}

function field(form: HTMLFormElement, name: string): Field {
  return form.elements.namedItem(name) as Field;
}

/** Sustituye `validity` para probar cada rama sin depender de jsdom. */
function setValidity(target: Field, flags: Partial<Record<string, boolean>> = {}): void {
  const validity: Record<string, boolean> = {
    badInput: false,
    customError: false,
    patternMismatch: false,
    rangeOverflow: false,
    rangeUnderflow: false,
    stepMismatch: false,
    tooLong: false,
    tooShort: false,
    typeMismatch: false,
    valid: true,
    valueMissing: false,
    ...flags,
  };
  validity.valid = !Object.entries(validity).some(
    ([key, value]) => key !== 'valid' && value === true,
  );
  Object.defineProperty(target, 'validity', { configurable: true, get: () => validity });
}

function markAllValid(form: HTMLFormElement): void {
  for (const name of FIELD_NAMES) setValidity(field(form, name), {});
}

function setValue(form: HTMLFormElement, name: string, value: string): void {
  const control = field(form, name);

  if (control instanceof HTMLInputElement && control.type === 'checkbox') {
    control.checked = value === 'si';
    return;
  }

  control.value = value;
}

function submit(form: HTMLFormElement): void {
  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

/** Evita la ruta antispam de "menos de 1,5 s" en los envíos de prueba. */
function clearTimestamp(form: HTMLFormElement): void {
  const started = form.querySelector<HTMLInputElement>('[data-form-started]');
  if (started) started.value = '0';
}

async function init({ endpoint, dev }: { endpoint?: string; dev?: boolean } = {}): Promise<void> {
  vi.resetModules();
  vi.stubEnv('PUBLIC_CONTACT_FORM_ENDPOINT', endpoint ?? '');
  vi.stubEnv('DEV', (dev ? 'true' : '') as unknown as boolean);
  const module = await import('../../src/scripts/contact-form');
  module.initContactForm();
}

function errorFor(form: HTMLFormElement, name: string): HTMLElement {
  return form.querySelector(`[data-error-for="${name}"]`) as HTMLElement;
}

function mockResponse(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response;
}

function mockFetch(): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  document.body.innerHTML = '';
});

describe('initContactForm', () => {
  it('no falla si no hay formulario', async () => {
    document.body.innerHTML = '<p>sin formulario</p>';

    await expect(init()).resolves.toBeUndefined();
  });

  it('marca el formulario como inicializado y desactiva la validación nativa', async () => {
    const { form } = buildForm();
    await init();

    expect(form.dataset.initialized).toBe('true');
    expect(form.noValidate).toBe(true);
  });

  it('no vuelve a inicializar un formulario ya preparado', async () => {
    const { form } = buildForm();
    await init();
    const first = form.dataset.initialized;
    await init();

    expect(first).toBe('true');
    expect(form.dataset.initialized).toBe('true');
  });

  it('sella la marca de tiempo de inicio', async () => {
    const { form } = buildForm();
    const started = form.querySelector<HTMLInputElement>('[data-form-started]')!;
    const before = Date.now();
    await init();

    expect(Number(started.value)).toBeGreaterThanOrEqual(before);
  });

  it('funciona sin marca de tiempo, sin botón y sin estado', async () => {
    const { form } = buildForm({ startedAt: false, button: false, status: false });
    await init();
    markAllValid(form);

    expect(() => submit(form)).not.toThrow();
  });
});

describe('validación de campos', () => {
  it('marca el error al salir del campo', async () => {
    const { form } = buildForm();
    await init();
    setValidity(field(form, 'nombre'), { valueMissing: true });

    field(form, 'nombre').dispatchEvent(new Event('blur'));

    expect(errorFor(form, 'nombre').textContent).toBe('Este campo es obligatorio.');
    expect(field(form, 'nombre').getAttribute('aria-invalid')).toBe('true');
    expect(field(form, 'nombre').closest('[data-field]')?.classList.contains('campo--error')).toBe(
      true,
    );
  });

  it('no valida en input si el campo no se ha tocado', async () => {
    const { form } = buildForm();
    await init();
    setValidity(field(form, 'email'), { valueMissing: true });

    field(form, 'email').dispatchEvent(new Event('input'));

    expect(errorFor(form, 'email').textContent).toBe('');
  });

  it('limpia el error cuando el campo tocado pasa a ser válido', async () => {
    const { form } = buildForm();
    await init();
    const nombre = field(form, 'nombre');
    setValidity(nombre, { valueMissing: true });
    nombre.dispatchEvent(new Event('blur'));

    setValidity(nombre, {});
    nombre.dispatchEvent(new Event('input'));

    expect(errorFor(form, 'nombre').textContent).toBe('');
    expect(nombre.getAttribute('aria-invalid')).toBe('false');
    expect(nombre.closest('[data-field]')?.classList.contains('campo--error')).toBe(false);
    expect(errorFor(form, 'nombre').textContent).toBe('');
  });

  it('revalida también en change', async () => {
    const { form } = buildForm();
    await init();
    const tipo = field(form, 'tipoEvento');
    setValidity(tipo, { valueMissing: true });
    tipo.dispatchEvent(new Event('blur'));

    setValidity(tipo, {});
    tipo.dispatchEvent(new Event('change'));

    expect(errorFor(form, 'tipoEvento').textContent).toBe('');
  });

  it('mensaje específico para un select obligatorio', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    setValidity(field(form, 'tipoEvento'), { valueMissing: true });

    submit(form);

    expect(errorFor(form, 'tipoEvento').textContent).toBe('Selecciona una opción.');
  });

  it('mensaje específico para el consentimiento', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    setValidity(field(form, 'privacidad'), { valueMissing: true });

    submit(form);

    expect(errorFor(form, 'privacidad').textContent).toBe(
      'Debes aceptar la política de privacidad.',
    );
  });

  it('mensaje específico para un email mal formado', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    setValidity(field(form, 'email'), { typeMismatch: true });

    submit(form);

    expect(errorFor(form, 'email').textContent).toBe('Introduce un email válido.');
  });

  it('informa de la longitud mínima', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    setValidity(field(form, 'mensaje'), { tooShort: true });

    submit(form);

    expect(errorFor(form, 'mensaje').textContent).toBe('Escribe al menos 10 caracteres.');
  });

  it('informa de la longitud máxima', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    setValidity(field(form, 'nombre'), { tooLong: true });

    submit(form);

    expect(errorFor(form, 'nombre').textContent).toBe('No superes los 80 caracteres.');
  });

  it('informa de un valor no interpretable', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    setValidity(field(form, 'telefono'), { badInput: true });

    submit(form);

    expect(errorFor(form, 'telefono').textContent).toBe('Introduce un valor válido.');
  });

  it('usa el mensaje nativo para el resto de errores', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    const nombre = field(form, 'nombre');
    setValidity(nombre, { patternMismatch: true });
    nombre.setCustomValidity('Formato no permitido');

    submit(form);

    expect(errorFor(form, 'nombre').textContent).toBe('Formato no permitido');
  });

  it('tiene un mensaje de reserva si el navegador no ofrece ninguno', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);
    const nombre = field(form, 'nombre');
    setValidity(nombre, { patternMismatch: true });
    Object.defineProperty(nombre, 'validationMessage', {
      configurable: true,
      get: () => '',
    });

    submit(form);

    expect(errorFor(form, 'nombre').textContent).toBe('Revisa este campo.');
  });

  it('no valida los campos ocultos ni el honeypot', async () => {
    const { form } = buildForm();
    await init();
    markAllValid(form);

    submit(form);

    expect((form.elements.namedItem('_subject') as HTMLElement).hasAttribute('aria-invalid')).toBe(false);
    expect((form.elements.namedItem('_gotcha') as HTMLElement).hasAttribute('aria-invalid')).toBe(false);
  });

  it('no falla si el campo no tiene contenedor ni mensaje', async () => {
    const { form } = buildForm({ errorElements: false, wrapper: false });
    await init();
    markAllValid(form);
    setValidity(field(form, 'nombre'), { valueMissing: true });

    expect(() => submit(form)).not.toThrow();
    expect(field(form, 'nombre').getAttribute('aria-invalid')).toBe('true');
  });
});

describe('envío del formulario', () => {
  it('bloquea el envío y enfoca el primer campo inválido', async () => {
    const { form, status } = buildForm();
    await init();
    markAllValid(form);
    setValidity(field(form, 'email'), { valueMissing: true });

    submit(form);

    expect(status?.textContent).toBe('Revisa los campos marcados antes de enviar.');
    expect(status?.dataset.state).toBe('error');
    expect(document.activeElement).toBe(field(form, 'email'));
  });

  it('no envía si el botón ya está deshabilitado', async () => {
    const { form, status, button } = buildForm();
    await init({ endpoint: 'https://formulario.example/api' });
    markAllValid(form);
    clearTimestamp(form);
    button!.disabled = true;
    const fetchSpy = mockFetch();

    submit(form);

    expect(status?.textContent).toBe('');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('avisa cuando el endpoint no está configurado', async () => {
    const { form, status } = buildForm();
    await init();
    markAllValid(form);
    clearTimestamp(form);
    const fetchSpy = mockFetch();

    submit(form);

    expect(status?.dataset.state).toBe('error');
    expect(status?.textContent).toContain('El formulario todavía no está conectado');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('simula el envío en modo local y restaura el formulario', async () => {
    const { form, status, button, submitLabel } = buildForm();
    await init({ dev: true });
    markAllValid(form);
    clearTimestamp(form);
    setValue(form, 'nombre', 'Ana');
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.useFakeTimers();

    submit(form);

    expect(button?.disabled).toBe(true);
    expect(submitLabel?.textContent).toBe('ENVIANDO…');

    await vi.advanceTimersByTimeAsync(650);

    expect(info).toHaveBeenCalledWith(
      '[contacto] Envío simulado en local:',
      expect.objectContaining({ nombre: 'Ana' }),
    );
    expect(status?.dataset.state).toBe('success');
    expect(status?.textContent).toContain('Formulario validado correctamente');
    expect(button?.disabled).toBe(false);
    expect(submitLabel?.textContent).toBe('ENVIAR SOLICITUD');
    expect(field(form, 'nombre').value).toBe('');
    expect(form.querySelector<HTMLInputElement>('[data-form-started]')!.value).not.toBe('0');
  });

  it('descarta en silencio un envío con el honeypot relleno', async () => {
    const { form, status } = buildForm();
    await init();
    markAllValid(form);
    clearTimestamp(form);
    setValue(form, '_gotcha', 'soy-un-bot');
    const fetchSpy = mockFetch();

    submit(form);

    expect(status?.dataset.state).toBe('success');
    expect(status?.textContent).toContain('Solicitud enviada');
    expect(field(form, '_gotcha').value).toBe('');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('descarta un envío rellenado en menos de 1,5 s', async () => {
    const { form, status } = buildForm();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T10:00:00Z'));
    await init();
    markAllValid(form);
    form.querySelector<HTMLInputElement>('[data-form-started]')!.value = String(Date.now());

    submit(form);

    expect(status?.textContent).toContain('Solicitud enviada');
  });

  it('acepta un envío justo en el límite de 1,5 s', async () => {
    const { form, status } = buildForm();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-11T10:00:00Z'));
    await init();
    markAllValid(form);
    form.querySelector<HTMLInputElement>('[data-form-started]')!.value = String(Date.now());
    vi.setSystemTime(new Date('2026-11-11T10:00:01.500Z'));

    submit(form);

    expect(status?.textContent).toContain('El formulario todavía no está conectado');
    expect(status?.textContent).not.toContain('Solicitud enviada');
  });

  it('envía por POST al endpoint configurado', async () => {
    const { form, status } = buildForm();
    await init({ endpoint: 'https://formulario.example/api' });
    markAllValid(form);
    clearTimestamp(form);
    setValue(form, 'nombre', 'Ana');
    setValue(form, 'email', 'ana@example.com');
    const fetchSpy = mockFetch().mockResolvedValue(mockResponse({}));

    submit(form);

    await vi.waitFor(() => expect(status?.dataset.state).toBe('success'));

    expect(status?.textContent).toContain('Solicitud enviada');
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, request] = fetchSpy.mock.calls[0];
    expect(url).toBe('https://formulario.example/api');
    expect(request?.method).toBe('POST');
    expect(request?.headers).toEqual({ Accept: 'application/json' });
    expect(request?.body).toBeInstanceOf(URLSearchParams);
    expect((request?.body as URLSearchParams).get('nombre')).toBe('Ana');
    expect(field(form, 'nombre').value).toBe('');
  });

  it('muestra el detalle del servicio en consola si responde con error', async () => {
    const { form, status } = buildForm();
    await init({ endpoint: 'https://formulario.example/api' });
    markAllValid(form);
    clearTimestamp(form);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch().mockResolvedValue(mockResponse({ error: 'boom' }, 500));

    submit(form);

    await vi.waitFor(() => expect(status?.dataset.state).toBe('error'));

    expect(status?.textContent).toContain('No hemos podido enviar la solicitud');
    expect(error).toHaveBeenCalledWith(
      '[contacto] Error al enviar el formulario:',
      expect.objectContaining({ message: 'boom' }),
    );
  });

  it('usa el código de estado si la respuesta de error no es JSON', async () => {
    const { form, status } = buildForm();
    await init({ endpoint: 'https://formulario.example/api' });
    markAllValid(form);
    clearTimestamp(form);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch().mockResolvedValue(mockResponse('<html>', 422));

    submit(form);

    await vi.waitFor(() => expect(status?.dataset.state).toBe('error'));

    expect(error).toHaveBeenCalledWith(
      '[contacto] Error al enviar el formulario:',
      expect.objectContaining({ message: 'El servicio respondió con 422.' }),
    );
  });

  it('ignora un JSON de error sin campo error', async () => {
    const { form, status } = buildForm();
    await init({ endpoint: 'https://formulario.example/api' });
    markAllValid(form);
    clearTimestamp(form);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch().mockResolvedValue(mockResponse({ message: 'sin detalle' }, 503));

    submit(form);

    await vi.waitFor(() => expect(status?.dataset.state).toBe('error'));

    expect(error).toHaveBeenCalledWith(
      '[contacto] Error al enviar el formulario:',
      expect.objectContaining({ message: 'El servicio respondió con 503.' }),
    );
  });

  it('gestiona un fallo de red', async () => {
    const { form, status } = buildForm();
    await init({ endpoint: 'https://formulario.example/api' });
    markAllValid(form);
    clearTimestamp(form);
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    mockFetch().mockRejectedValue(new Error('offline'));

    submit(form);

    await vi.waitFor(() => expect(status?.dataset.state).toBe('error'));

    expect(status?.textContent).toContain('Inténtalo de nuevo');
    expect(error).toHaveBeenCalled();
  });

  it('no registra dos veces el envío tras una doble inicialización', async () => {
    const { form } = buildForm();
    await init({ endpoint: 'https://formulario.example/api' });
    await init({ endpoint: 'https://formulario.example/api' });
    markAllValid(form);
    clearTimestamp(form);
    const fetchSpy = mockFetch().mockResolvedValue(mockResponse({}));

    submit(form);

    await vi.waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
