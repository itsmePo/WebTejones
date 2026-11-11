export interface ContactConfig {
  destinatario: string;
  maxMensajeLength: number;
  maxNombreLength: number;
  formName: string;
  endpoint: string;
  mode: "unconfigured" | "dev" | "remote";
}

const rawEndpoint = (import.meta.env.PUBLIC_CONTACT_FORM_ENDPOINT || process.env.PUBLIC_CONTACT_FORM_ENDPOINT || "").trim();
const isDev = Boolean(import.meta.env.DEV || process.env.DEV);

let mode: "unconfigured" | "dev" | "remote" = "unconfigured";
if (rawEndpoint) {
  mode = "remote";
} else if (isDev) {
  mode = "dev";
}

export const contactConfig: ContactConfig = {
  destinatario: "contacto@tejonesbanda.es",
  maxMensajeLength: 1000,
  maxNombreLength: 100,
  formName: "contacto-tejones",
  endpoint: rawEndpoint,
  mode,
};
