import { contactConfig } from "../config/contact";

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type StatusState = "success" | "error";

const SUBMIT_LABEL = "ENVIAR SOLICITUD";
const SUBMITTING_LABEL = "ENVIANDO…";

function getFields(form: HTMLFormElement): FormField[] {
  return Array.from(form.querySelectorAll<FormField>("input, select, textarea")).filter(
    (field) => field.type !== "hidden" && field.name !== "_gotcha",
  );
}

function getErrorElement(form: HTMLFormElement, field: FormField): HTMLElement | null {
  return form.querySelector<HTMLElement>(`[data-error-for="${field.name}"]`);
}

function messageFor(field: FormField): string {
  const validity = field.validity;

  if (validity.valid) return "";

  if (validity.valueMissing) {
    if (field.type === "checkbox") {
      return "Debes aceptar la política de privacidad.";
    }

    if (field instanceof HTMLSelectElement) {
      return "Selecciona una opción.";
    }

    return "Este campo es obligatorio.";
  }

  if (validity.typeMismatch && field.type === "email") {
    return "Introduce un email válido.";
  }

  if (
    validity.tooShort &&
    (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)
  ) {
    return `Escribe al menos ${field.minLength} caracteres.`;
  }

  if (
    validity.tooLong &&
    (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)
  ) {
    return `No superes los ${field.maxLength} caracteres.`;
  }

  if (validity.badInput) {
    return "Introduce un valor válido.";
  }

  return field.validationMessage || "Revisa este campo.";
}

function setFieldError(form: HTMLFormElement, field: FormField, message: string): void {
  const error = getErrorElement(form, field);
  const wrapper = field.closest<HTMLElement>("[data-field]");

  if (error) error.textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
  wrapper?.classList.toggle("campo--error", Boolean(message));
}

function validateField(form: HTMLFormElement, field: FormField): boolean {
  const message = messageFor(field);
  setFieldError(form, field, message);
  return !message;
}

export function initContactForm(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");

  if (!form || form.dataset.initialized === "true") return;

  form.dataset.initialized = "true";
  // La validación nativa queda como respaldo sin JavaScript; con JS usamos
  // mensajes propios y accesibles.
  form.noValidate = true;

  const startedInput = form.querySelector<HTMLInputElement>("[data-form-started]");
  const status = form.querySelector<HTMLElement>("[data-form-status]");
  const button = form.querySelector<HTMLButtonElement>("[data-submit-button]");
  const buttonLabel = form.querySelector<HTMLElement>("[data-submit-label]");
  const fields = getFields(form);
  const touched = new Set<string>();

  if (startedInput) startedInput.value = String(Date.now());

  function setStatus(message: string, state?: StatusState): void {
    if (!status) return;

    status.textContent = message;

    if (state) {
      status.dataset.state = state;
    } else {
      delete status.dataset.state;
    }
  }

  function setLoading(isLoading: boolean): void {
    if (button) button.disabled = isLoading;
    if (buttonLabel) {
      buttonLabel.textContent = isLoading ? SUBMITTING_LABEL : SUBMIT_LABEL;
    }
  }

  const clearErrors = (): void => {
    touched.clear();
    fields.forEach((field) => setFieldError(form, field, ""));
  };

  function restartTimer(): void {
    if (startedInput) startedInput.value = String(Date.now());
  }

  const resetForm = (): void => {
    form.reset();
    clearErrors();
    restartTimer();
  };

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      touched.add(field.name);
      validateField(form, field);
    });

    const validateIfTouched = () => {
      if (touched.has(field.name)) validateField(form, field);
    };

    field.addEventListener("input", validateIfTouched);
    field.addEventListener("change", validateIfTouched);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (button?.disabled) return;

    setStatus("");

    const invalidFields = fields.filter((field) => !validateField(form, field));

    if (invalidFields.length > 0) {
      setStatus("Revisa los campos marcados antes de enviar.", "error");
      invalidFields[0]?.focus();
      return;
    }

    const honeypot = form.elements.namedItem("_gotcha");
    const startedAt = Number(startedInput?.value ?? 0);
    const isLikelyBot =
      (honeypot instanceof HTMLInputElement && honeypot.value.trim() !== "") ||
      (startedAt > 0 && Date.now() - startedAt < 1500);

    if (isLikelyBot) {
      // Respuesta neutra para no dar pistas a los bots.
      setStatus("Solicitud enviada. La banda se pondrá en contacto contigo pronto.", "success");
      resetForm();
      return;
    }

    if (contactConfig.mode === "unconfigured") {
      setStatus(
        "El formulario todavía no está conectado. Escríbenos por Instagram mientras terminamos de configurarlo.",
        "error",
      );
      return;
    }

    if (contactConfig.mode === "dev") {
      setLoading(true);

      const payload = Object.fromEntries(new FormData(form).entries());
      console.info("[contacto] Envío simulado en local:", payload);

      // Pequeña espera para comprobar el estado de carga en desarrollo.
      await new Promise((resolve) => setTimeout(resolve, 650));

      setLoading(false);
      setStatus(
        "Formulario validado correctamente. En local el envío está simulado; se activará al conectar el servicio de correo del hosting.",
        "success",
      );
      resetForm();
      return;
    }

    const formData = new FormData(form);
    const body = new URLSearchParams();

    formData.forEach((value, key) => {
      if (typeof value === "string") body.set(key, value);
    });

    setLoading(true);

    try {
      const response = await fetch(contactConfig.endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body,
      });

      if (!response.ok) {
        let detail = "";

        try {
          const data: unknown = await response.json();

          if (
            data &&
            typeof data === "object" &&
            "error" in data &&
            typeof data.error === "string"
          ) {
            detail = data.error;
          }
        } catch {
          // El servicio puede devolver HTML; usamos el código de estado.
        }

        throw new Error(detail || `El servicio respondió con ${response.status}.`);
      }

      setStatus(
        "Solicitud enviada. La banda se pondrá en contacto contigo pronto.",
        "success",
      );
      resetForm();
    } catch (error) {
      console.error("[contacto] Error al enviar el formulario:", error);
      setStatus(
        "No hemos podido enviar la solicitud. Inténtalo de nuevo en unos minutos o escríbenos por Instagram.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  });
}
