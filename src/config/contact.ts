const endpoint = (import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT ?? "").trim();

export const contactConfig = {
  endpoint,
  formName: "contacto-tejones",
  mode: endpoint ? "remote" : import.meta.env.DEV ? "dev" : "unconfigured",
} as const;
